import React, { useState, useEffect, useMemo } from "react";
import { Modal, Spin } from "antd";
import { BookOutlined, PictureOutlined } from "@ant-design/icons";
import { formatBookSizeInches } from "../../helper/photobookSizeHelper";
import { getPhotoBookDesign, getPhotoBookTemplateById } from "../../helper/api_helper";
import {
  RealisticBookPreview,
  getElementCoords,
  getShapeClipPathDefinition,
  renderShapeSvgClip,
  renderShapeSvgBorder,
  resolveDecorationSvg,
  getFontFamilyFallback,
  dynamicallyLoadGoogleFont,
  parseBorderValues,
  parsePaddingValues,
} from "../../pages/Product/PhotoBookEditorPage";

// ── Pure Page Canvas Renderer (100% Identical Visual Fidelity to Editor) ─────
const PhotobookPageCanvas = ({ page }) => {
  if (!page) return null;

  if (page.no_design || page.has_design === false) {
    return (
      <div
        className="page-canvas-container relative w-full h-full overflow-hidden select-none bg-[#0b101d] flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-700/60 text-slate-300"
        style={{ containerType: "inline-size" }}
      >
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-2.5 shadow-sm border border-slate-700 text-slate-400">
          <PictureOutlined className="text-xl" />
        </div>
        <p className="text-xs sm:text-sm font-bold text-slate-200 tracking-wide mb-1">
          No design created for this page
        </p>
        <p className="text-[11px] text-slate-400 max-w-[210px] leading-relaxed mb-2.5">
          The administrator has not configured a layout for {page.display_label || (page.page_number ? `Page ${page.page_number}` : "this page")}.
        </p>
        {page.page_number && (
          <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border bg-slate-800/80 border-slate-700 text-slate-400">
            Page {page.page_number}
          </span>
        )}
      </div>
    );
  }

  const elements = page.elements || [];
  const bg = page.background || {};

  const isImage =
    bg.type === "image" ||
    (typeof bg.value === "string" &&
      (bg.value.startsWith("http://") ||
        bg.value.startsWith("https://") ||
        bg.value.startsWith("/uploads/") ||
        bg.value.startsWith("data:image/") ||
        /\.(jpg|jpeg|png|webp|avif|gif|svg)($|\?)/i.test(bg.value)));

  const flipH = Boolean(bg.flip_h || bg.flipH);
  const flipV = Boolean(bg.flip_v || bg.flipV);
  const transform =
    flipH && flipV
      ? "scale(-1, -1)"
      : flipH
        ? "scaleX(-1)"
        : flipV
          ? "scaleY(-1)"
          : undefined;

  const bgLayerStyle = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
    opacity: bg.opacity ?? 1,
    transform,
    transformOrigin: transform ? "center center" : undefined,
  };

  if (bg.type === "gradient") {
    bgLayerStyle.background = bg.value;
  } else if (isImage && bg.value) {
    const posX = bg.position_x !== undefined ? `${bg.position_x}%` : "50%";
    const posY = bg.position_y !== undefined ? `${bg.position_y}%` : "50%";
    const fitMode = bg.fit_mode || "cover";
    const size =
      fitMode === "stretch" || fitMode === "100% 100%"
        ? "100% 100%"
        : fitMode === "contain"
          ? bg.scale && bg.scale > 1
            ? `${Math.round(bg.scale * 100)}%`
            : "contain"
          : bg.scale && bg.scale > 1
            ? `${Math.round(bg.scale * 100)}%`
            : "cover";
    bgLayerStyle.backgroundImage = `url("${bg.value}")`;
    bgLayerStyle.backgroundSize = size;
    bgLayerStyle.backgroundPosition = `${posX} ${posY}`;
    bgLayerStyle.backgroundRepeat = "no-repeat";
    bgLayerStyle.backgroundColor = "#ffffff";
  } else if (bg.value) {
    bgLayerStyle.backgroundColor = bg.value;
  } else {
    bgLayerStyle.backgroundColor = "#ffffff";
  }

  return (
    <div
      className="page-canvas-container relative w-full h-full overflow-hidden select-none bg-white"
      style={{ containerType: "inline-size" }}
    >
      {/* Background layer */}
      <div style={bgLayerStyle} />

      {/* Page Elements */}
      {elements.map((el, elIdx) => {
        const elKey = el.id || el.frame_id || `el-${elIdx}`;
        const coords = getElementCoords(el);
        const leftPct = coords.left;
        const topPct = coords.top;
        const widthPct = coords.width;
        const heightPct = coords.height;

        const shape = el.shape || el.mask_shape || "rectangle";
        const isCircle = shape === "circle";
        const is1to1Shape =
          el.type === "photo_frame" &&
          ["circle", "heart", "star", "scallop", "hexagon"].includes(shape);

        const baseStyle = {
          position: "absolute",
          left: `${leftPct}%`,
          top: `${topPct}%`,
          width: `${widthPct}%`,
          height: is1to1Shape ? undefined : `${heightPct}%`,
          aspectRatio: is1to1Shape ? "1 / 1" : undefined,
          zIndex: el.z_index || 1,
          transform: `rotate(${el.rotation || 0}deg)`,
          transformOrigin: "center center",
        };

        // 1. Photo Frame
        if (el.type === "photo_frame") {
          const displayPhoto =
            el.photo_url ||
            el.photo?.url ||
            el.photo?.preview ||
            el.image_url ||
            el.url ||
            el.src ||
            el.test_image_url ||
            el.sample_image_url ||
            "";
          const hasPhoto = Boolean(displayPhoto);
          const fitMode = el.fit_mode || "cover";
          const bord = parseBorderValues(el.border);
          const pad = parsePaddingValues(el.padding);
          const isRect = shape === "rectangle";
          const isHeart = shape === "heart" || el.mask_shape === "heart";
          const elRefDim = Math.max(
            50,
            Math.min(
              Number(el.width) > 10 ? Number(el.width) : coords.width * 10,
              Number(el.height) > 10 ? Number(el.height) : coords.height * 10
            ) || 400
          );
          const normalizedBorderStroke = (bord.top || bord.width) / elRefDim;
          const shadow = el.shadow || {};
          const shadowFilter =
            shadow.blur > 0
              ? `drop-shadow(${shadow.offsetX || 0}px ${shadow.offsetY || 4}px ${shadow.blur}px ${shadow.color || "rgba(0,0,0,0.15)"
              })`
              : "none";

          const radiusVal =
            bord.radius ?? el.corner_radius ?? (isCircle ? 50 : 0);
          const maxBorder = Math.max(bord.top, bord.right, bord.bottom, bord.left, bord.width);
          const innerRadius = Math.max(0, bord.radius - Math.min(bord.top, bord.left));
          const clipDef = getShapeClipPathDefinition(shape, radiusVal);
          const clipId = `cart-preview-clip-${page.page_id || page.page_number || "pg"}-${elKey}`;

          const cropZoom = el.crop?.zoom || 1;
          const cropOffsetX = el.crop?.offsetX || 0;
          const cropOffsetY = el.crop?.offsetY || 0;
          const cropRotation = el.crop?.rotation || 0;
          const isFlipped = Boolean(el.crop?.flipH || el.flip_h);
          const hasPadding = pad.top > 0 || pad.right > 0 || pad.bottom > 0 || pad.left > 0;
          const totalPadTop = (bord.top !== undefined ? bord.top : bord.width) + (pad.top || 0);
          const totalPadRight = (bord.right !== undefined ? bord.right : bord.width) + (pad.right || 0);
          const totalPadBottom = (bord.bottom !== undefined ? bord.bottom : bord.width) + (pad.bottom || 0);
          const totalPadLeft = (bord.left !== undefined ? bord.left : bord.width) + (pad.left || 0);

          return (
            <div
              key={elKey}
              style={{
                ...baseStyle,
                filter: shadowFilter,
                borderTop: (isRect || isCircle) && bord.top ? `calc(${bord.top} * (100cqw / 707)) solid ${bord.color}` : undefined,
                borderRight: (isRect || isCircle) && bord.right ? `calc(${bord.right} * (100cqw / 707)) solid ${bord.color}` : undefined,
                borderBottom: (isRect || isCircle) && bord.bottom ? `calc(${bord.bottom} * (100cqw / 707)) solid ${bord.color}` : undefined,
                borderLeft: (isRect || isCircle) && bord.left ? `calc(${bord.left} * (100cqw / 707)) solid ${bord.color}` : undefined,
                borderRadius: isCircle ? "50%" : (isRect && bord.radius ? `calc(${bord.radius} * (100cqw / 707))` : undefined),
                backgroundColor: el.bg_color || el.background?.value || "transparent",
                boxSizing: "border-box",
              }}
              className="group relative overflow-visible flex items-center justify-center pointer-events-none"
            >
              {/* SVG Defs for objectBoundingBox clip */}
              {!isRect && !isCircle && (
                <svg width="0" height="0" className="absolute pointer-events-none">
                  <defs>
                    <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                      {renderShapeSvgClip(clipDef, false)}
                    </clipPath>
                  </defs>
                </svg>
              )}

              {/* Outer Shape Border SVG for custom non-rectangular/non-circular shapes */}
              {!isRect && !isCircle && maxBorder > 0 && (
                <svg
                  viewBox="0 0 1 1"
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                  style={{ zIndex: 10, overflow: "visible" }}
                >
                  {renderShapeSvgBorder(clipDef, bord.color, maxBorder)}
                </svg>
              )}

              {/* Clipped container: Symmetrically centered for shapes to guarantee 100% even gap on all sides */}
              <div
                className={`absolute overflow-hidden ${!hasPhoto ? `bg-slate-100/90 ${isRect ? "border border-dashed border-slate-300 rounded" : ""}` : ""}`}
                style={
                  (isRect || isCircle)
                    ? {
                        top: pad.top ? `calc(${pad.top} * (100cqw / 707))` : 0,
                        right: pad.right ? `calc(${pad.right} * (100cqw / 707))` : 0,
                        bottom: pad.bottom ? `calc(${pad.bottom} * (100cqw / 707))` : 0,
                        left: pad.left ? `calc(${pad.left} * (100cqw / 707))` : 0,
                        borderRadius: isCircle ? "50%" : (isRect && innerRadius ? `${innerRadius}px` : undefined),
                      }
                    : {
                        top: totalPadTop ? `calc(${totalPadTop} * (100cqw / 707))` : 0,
                        right: totalPadRight ? `calc(${totalPadRight} * (100cqw / 707))` : 0,
                        bottom: totalPadBottom ? `calc(${totalPadBottom} * (100cqw / 707))` : 0,
                        left: totalPadLeft ? `calc(${totalPadLeft} * (100cqw / 707))` : 0,
                        clipPath: `url(#${clipId})`,
                        WebkitClipPath: `url(#${clipId})`,
                      }
                }
              >
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: hasPhoto ? "transparent" : "#f1f5f9" }}
                />

                {hasPhoto && (
                  <img
                    src={displayPhoto}
                    alt=""
                    style={{
                      position: "absolute",
                      left: `${cropOffsetX}%`,
                      top: `${cropOffsetY}%`,
                      width: "100%",
                      height: "100%",
                      objectFit:
                        fitMode === "contain"
                          ? "contain"
                          : fitMode === "stretch" || fitMode === "fill"
                            ? "fill"
                            : "cover",
                      transformOrigin: "50% 50%",
                      transform: `scale(${isFlipped ? -cropZoom : cropZoom}, ${cropZoom}) rotate(${cropRotation}deg)`,
                      transition: "transform 0.1s ease",
                      maxWidth: "none",
                      maxHeight: "none",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  />
                )}

                {!hasPhoto && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center pointer-events-none">
                    <div className="bg-white/80 p-1.5 rounded-full shadow-xs mb-1 text-slate-400">
                      <PictureOutlined className="text-base text-teal-600" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      {el.frame_id ? `Photo ${el.frame_id.split("-").pop()}` : "Empty"}
                    </span>
                  </div>
                )}
              </div>

              {/* Border overlay for non-rectangular clip shapes */}
              {!isRect && bord.top > 0 && (
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ zIndex: 10 }}
                >
                  <g
                    transform="scale(100, 100)"
                    fill="none"
                    stroke={bord.color}
                    strokeWidth={normalizedBorderStroke}
                    vectorEffect="non-scaling-stroke"
                  >
                    {renderShapeSvgClip(clipDef, false)}
                  </g>
                </svg>
              )}
            </div>
          );
        }

        // 2. Text Element
        if (el.type === "text") {
          const hasExplicitNewlines =
            el.content && String(el.content).includes("\n");
          const textBord = parseBorderValues(el.border);
          const textPad = parsePaddingValues(el.padding);
          const effectiveFontFamily = el.font_family || el.fontFamily || "Inter";
          const effectiveFontWeight = el.font_weight || el.fontWeight || "normal";
          const effectiveFontStyle = el.font_style || el.fontStyle || "normal";
          const effectiveTextTransform = el.text_transform || el.textTransform || "none";
          const effectiveLetterSpacing = el.letter_spacing !== undefined ? el.letter_spacing : (el.letterSpacing !== undefined ? el.letterSpacing : 0);
          const effectiveLineHeight = el.line_height || el.lineHeight || 1.2;
          dynamicallyLoadGoogleFont(effectiveFontFamily);

          return (
            <div
              key={elKey}
              style={{
                ...baseStyle,
                width: `${widthPct}%`,
                maxWidth: "100%",
                fontFamily: getFontFamilyFallback(effectiveFontFamily),
                fontSize: `calc(${Number(el.font_size || 24)} * (100cqw / 707))`,
                fontWeight: effectiveFontWeight,
                fontStyle: effectiveFontStyle,
                letterSpacing: effectiveLetterSpacing
                  ? `calc(${Number(effectiveLetterSpacing)} * (100cqw / 707))`
                  : "normal",
                lineHeight: effectiveLineHeight,
                color: el.color || "#1f2937",
                textAlign: el.align || "center",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  el.align === "left"
                    ? "flex-start"
                    : el.align === "right"
                      ? "flex-end"
                      : "center",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                whiteSpace: hasExplicitNewlines ? "pre-line" : "normal",
                textTransform: el.text_transform || el.textTransform || "none",
                background:
                  el.background?.type !== "none" && el.background?.value
                    ? el.background.value
                    : el.bg_color || undefined,
                borderTop: textBord.top ? `calc(${textBord.top} * (100cqw / 707)) solid ${textBord.color}` : undefined,
                borderRight: textBord.right ? `calc(${textBord.right} * (100cqw / 707)) solid ${textBord.color}` : undefined,
                borderBottom: textBord.bottom ? `calc(${textBord.bottom} * (100cqw / 707)) solid ${textBord.color}` : undefined,
                borderLeft: textBord.left ? `calc(${textBord.left} * (100cqw / 707)) solid ${textBord.color}` : undefined,
                borderRadius: textBord.radius
                  ? `calc(${textBord.radius} * (100cqw / 707))`
                  : el.background?.value || el.bg_color
                    ? `calc(${el.background?.radius ?? 4} * (100cqw / 707))`
                    : undefined,
                paddingTop: textPad.top
                  ? `calc(${textPad.top} * (100cqw / 707))`
                  : el.background?.value || el.bg_color
                    ? `calc(${el.background?.padding ?? 4} * (100cqw / 707))`
                    : undefined,
                paddingRight: textPad.right
                  ? `calc(${textPad.right} * (100cqw / 707))`
                  : el.background?.value || el.bg_color
                    ? `calc(${((el.background?.padding ?? 4) * 1.5)} * (100cqw / 707))`
                    : undefined,
                paddingBottom: textPad.bottom
                  ? `calc(${textPad.bottom} * (100cqw / 707))`
                  : el.background?.value || el.bg_color
                    ? `calc(${el.background?.padding ?? 4} * (100cqw / 707))`
                    : undefined,
                paddingLeft: textPad.left
                  ? `calc(${textPad.left} * (100cqw / 707))`
                  : el.background?.value || el.bg_color
                    ? `calc(${((el.background?.padding ?? 4) * 1.5)} * (100cqw / 707))`
                    : undefined,
                boxSizing: "border-box",
                zIndex: Math.max(100, Number(el.z_index) || 100),
                pointerEvents: "none",
              }}
              className="leading-tight select-none"
            >
              <span
                style={{
                  minWidth: "max-content",
                  maxWidth: "100%",
                  whiteSpace: hasExplicitNewlines ? "pre-line" : "nowrap",
                  wordBreak: "normal",
                  overflowWrap: "normal",
                  textAlign: el.align || "center",
                  fontFamily: "inherit",
                  fontWeight: "inherit",
                  fontStyle: "inherit",
                  letterSpacing: "inherit",
                  textTransform: el.text_transform || el.textTransform || "none",
                }}
              >
                {el.content}
              </span>
            </div>
          );
        }

        // 3. Decoration Element
        if (el.type === "decoration") {
          const svgContent = resolveDecorationSvg(el);
          const hasSvg = Boolean(svgContent);
          const hasAsset = Boolean(el.asset_url);
          const isExplicitButterfly =
            el.shape === "butterfly" || el.custom_svg_path === "butterfly";
          const isExplicitHeart =
            el.shape === "heart" || el.custom_svg_path === "heart";

          return (
            <div
              key={elKey}
              style={{
                ...baseStyle,
                opacity: el.opacity ?? 1,
                color: el.tint || "currentColor",
                pointerEvents: "none",
              }}
              className="flex items-center justify-center select-none overflow-visible"
            >
              <div className="w-full h-full flex items-center justify-center pointer-events-none">
                {hasSvg ? (
                  <div
                    className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                  />
                ) : hasAsset ? (
                  <img
                    src={el.asset_url}
                    alt={el.name || "Decoration"}
                    style={{
                      objectFit: el.fit_mode || "contain",
                    }}
                    className="w-full h-full pointer-events-none select-none"
                  />
                ) : isExplicitButterfly ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill={el.tint || "#f43f5e"}
                    className="w-full h-full drop-shadow"
                  >
                    <path d="M12 4.5C12.5 3 14 2 16 2c2.5 0 4.5 2 4.5 4.5 0 2.5-2.5 4.5-5 5.5 3 .5 5.5 2.5 5.5 5.5 0 3-2.5 5.5-5.5 5.5-2 0-3.5-1-4-2.5-.5 1.5-2 2.5-4 2.5C4.5 23 2 20.5 2 17.5c0-3 2.5-5 5.5-5.5-2.5-1-5-3-5-5.5C2.5 4 4.5 2 7 2c2 0 3.5 1 4 2.5l1 1 1-1z" />
                  </svg>
                ) : isExplicitHeart ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill={el.tint || "#ec4899"}
                    className="w-full h-full drop-shadow"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                ) : null}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

// ── Size Aspect Ratio Resolver ──────────────────────────────────────────────
const resolveSizeInfo = (sizeInput, optionalSizes = []) => {
  const rawStr = String(sizeInput || "").trim();

  // 1. Try finding in optionalSizes list
  if (Array.isArray(optionalSizes) && optionalSizes.length > 0) {
    const matched = optionalSizes.find(
      (s) =>
        s &&
        (String(s._id || s.id) === rawStr ||
          String(s.name || "").toLowerCase() === rawStr.toLowerCase())
    );
    if (matched) {
      let width = Number(matched.width_in || matched.width);
      let height = Number(matched.height_in || matched.height);
      if (!width || !height) {
        if (matched.width_cm && matched.height_cm) {
          width = +(Number(matched.width_cm) / 2.54).toFixed(2);
          height = +(Number(matched.height_cm) / 2.54).toFixed(2);
        }
      }
      if (!width || !height) {
        width = 8.27;
        height = 11.69;
      }
      return {
        id: matched._id || matched.id || rawStr,
        name: matched.name || "A4",
        width,
        height,
        singlePageRatio: +(width / height).toFixed(4),
        spreadRatio: +((width * 2) / height).toFixed(4),
        dimensions: `${matched.name || "A4"} - ${width} x ${height} in`,
        formattedSize: `${matched.name || "A4"} - ${width} x ${height} in`,
      };
    }
  }

  // 2. Check localStorage cache if available
  try {
    const cached = localStorage.getItem("photobook_template_sizes");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const found = parsed.find(
          (s) =>
            s &&
            (String(s._id || s.id) === rawStr ||
              String(s.name || "").toLowerCase() === rawStr.toLowerCase())
        );
        if (found) {
          return resolveSizeInfo(found, [found]);
        }
      }
    }
  } catch (e) { }

  // 3. Check standard sizes
  const lower = rawStr.toLowerCase();
  if (lower.includes("a4") || rawStr.startsWith("size-")) {
    const width = 8.27;
    const height = 11.69;
    return {
      id: rawStr,
      name: "A4",
      width,
      height,
      singlePageRatio: +(width / height).toFixed(4),
      spreadRatio: +((width * 2) / height).toFixed(4),
      dimensions: "A4 - 8.27 x 11.69 in",
      formattedSize: "A4 - 8.27 x 11.69 in",
    };
  }
  if (lower.includes("a3")) {
    const width = 11.69;
    const height = 16.54;
    return {
      id: rawStr,
      name: "A3",
      width,
      height,
      singlePageRatio: +(width / height).toFixed(4),
      spreadRatio: +((width * 2) / height).toFixed(4),
      dimensions: "A3 - 11.69 x 16.54 in",
      formattedSize: "A3 - 11.69 x 16.54 in",
    };
  }
  if (lower.includes("a5")) {
    const width = 5.83;
    const height = 8.27;
    return {
      id: rawStr,
      name: "A5",
      width,
      height,
      singlePageRatio: +(width / height).toFixed(4),
      spreadRatio: +((width * 2) / height).toFixed(4),
      dimensions: "A5 - 5.83 x 8.27 in",
      formattedSize: "A5 - 5.83 x 8.27 in",
    };
  }

  // 4. Pattern like 8x8 or 10x10
  const match = rawStr.match(/([0-9.]+)\s*[xX*×]\s*([0-9.]+)/);
  if (match) {
    const width = parseFloat(match[1]) || 8;
    const height = parseFloat(match[2]) || 8;
    return {
      id: rawStr,
      name: `${width}x${height}`,
      width,
      height,
      singlePageRatio: +(width / height).toFixed(4),
      spreadRatio: +((width * 2) / height).toFixed(4),
      dimensions: `${width} × ${height} in`,
      formattedSize: `${width} × ${height} in`,
    };
  }

  return {
    id: rawStr || "8x8",
    name: "A4",
    width: 8.27,
    height: 11.69,
    singlePageRatio: +(8.27 / 11.69).toFixed(4),
    spreadRatio: +((8.27 * 2) / 11.69).toFixed(4),
    dimensions: formatBookSizeInches(rawStr) || "A4 - 8.27 x 11.69 in",
    formattedSize: formatBookSizeInches(rawStr) || "A4 - 8.27 x 11.69 in",
  };
};

// ── PhotoBookPreviewModal Component ──────────────────────────────────────────
const PhotoBookPreviewModal = ({ open, onClose, cartItem }) => {
  const [loading, setLoading] = useState(false);
  const [designData, setDesignData] = useState(null);
  const [templateData, setTemplateData] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);

  // Load design and template when modal opens
  useEffect(() => {
    if (!open || !cartItem) {
      setStepIndex(0);
      return;
    }

    let isMounted = true;

    const loadDesign = async () => {
      // Immediate seed from cart item embedded data
      if (cartItem.photobook_design_data?.pages?.length > 0) {
        setDesignData(cartItem.photobook_design_data);
      }

      const designId =
        cartItem.photobook_design_id ||
        cartItem.photobook_details?.design_id ||
        cartItem.photobook_design_data?.design_id;

      if (designId) {
        try {
          setLoading(true);
          const guestId =
            localStorage.getItem("guestId") ||
            localStorage.getItem("GuestId") ||
            localStorage.getItem("guest") ||
            "";
          const res = await getPhotoBookDesign(designId, guestId);
          const fullDesign = res?.data?.data;
          if (isMounted && fullDesign && fullDesign.pages?.length > 0) {
            setDesignData(fullDesign);

            // Fetch template to resolve blank page config and exact size definitions
            if (fullDesign.template_id) {
              try {
                const tplRes = await getPhotoBookTemplateById(fullDesign.template_id);
                const tpl = tplRes?.data?.data;
                if (isMounted && tpl) {
                  setTemplateData(tpl);
                }
              } catch (e) {
                // Ignore template fetch error
              }
            }
          }
        } catch (err) {
          console.error("Failed to fetch full photobook design:", err);
        } finally {
          if (isMounted) setLoading(false);
        }
      }
    };

    loadDesign();

    return () => {
      isMounted = false;
    };
  }, [open, cartItem]);

  // Derive size info from ordered item or design (without edit/selection option)
  const sizeInfo = useMemo(() => {
    const rawSize =
      cartItem?.photobook_details?.size_name ||
      cartItem?.photobook_details?.size ||
      cartItem?.photobook_size ||
      designData?.size ||
      "8x8";

    const configSizes = [
      ...(cartItem?.photobook_config?.sizes || []),
      ...(templateData?.supported_sizes || []),
    ];

    return resolveSizeInfo(rawSize, configSizes);
  }, [cartItem, designData, templateData]);

  // Construct sequential flip preview steps (Step 0: Front Cover -> Spreads -> Step N: Back Cover)
  const previewSteps = useMemo(() => {
    const pages = designData?.pages || cartItem?.photobook_design_data?.pages || [];
    if (!pages || pages.length === 0) return [];

    const steps = [];

    // Front Cover
    const frontCover =
      pages.find((p) => p.page_type === "front_cover" || p.page_id === "front-cover") ||
      pages[0];

    // Back Cover
    const backCover =
      pages.find((p) => p.page_type === "back_cover" || p.page_id === "back-cover") ||
      pages[pages.length - 1];

    const isBlankPageEnabled = Boolean(
      templateData?.include_blank_page ||
      templateData?.page_config?.include_blank_page ||
      templateData?.published_snapshot?.include_blank_page ||
      templateData?.published_snapshot?.page_config?.include_blank_page
    );

    const hasBlankPage =
      Boolean(
        pages.some(
          (p) =>
            p.is_blank ||
            p.page_id === "blank-inside-front" ||
            p.page_id === "blank-inside-back" ||
            p.page_type === "blank"
        )
      ) || isBlankPageEnabled;

    // Step 0: Front Cover (Single Closed Book View)
    steps.push({
      type: "cover_front",
      stepIndex: 0,
      title: "Front Cover (Closed Book)",
      page: frontCover,
    });

    const interiorPages = pages
      .filter(
        (p) =>
          p.page_type !== "front_cover" &&
          p.page_type !== "back_cover" &&
          p.page_id !== "front-cover" &&
          p.page_id !== "back-cover" &&
          !p.is_blank &&
          p.page_id !== "blank-inside-front" &&
          p.page_id !== "blank-inside-back" &&
          p.page_type !== "blank"
      )
      .sort((a, b) => (Number(a.page_number) || 0) - (Number(b.page_number) || 0));

    let stepCount = 1;

    if (hasBlankPage) {
      const blankInsideFront = pages.find((p) => p.page_id === "blank-inside-front") || {
        page_id: "blank-inside-front",
        name: "Inside Front Cover",
        display_label: "Inside Front Cover",
        page_type: "blank",
        page_number: "Inside Cover",
        is_blank: true,
        background: { type: "color", value: "#ffffff" },
        elements: [],
      };

      const blankInsideBack = pages.find((p) => p.page_id === "blank-inside-back") || {
        page_id: "blank-inside-back",
        name: "Inside Back Cover",
        display_label: "Inside Back Cover",
        page_type: "blank",
        page_number: "Inside Cover",
        is_blank: true,
        background: { type: "color", value: "#ffffff" },
        elements: [],
      };

      const page1 =
        interiorPages.find((p) => p.page_number === 1 || p.page_id === "page-1") ||
        interiorPages[0];

      steps.push({
        type: "spread",
        stepIndex: 1,
        title: "Inside Cover & Page 1",
        leftPage: blankInsideFront,
        rightPage: page1,
      });

      const remainingPages = interiorPages.filter(
        (p) => (p.page_id || p.page_number) !== (page1?.page_id || page1?.page_number)
      );

      stepCount = 2;
      for (let i = 0; i < remainingPages.length; i += 2) {
        const leftP = remainingPages[i];
        const rightP = remainingPages[i + 1] || blankInsideBack;
        steps.push({
          type: "spread",
          stepIndex: stepCount,
          title: rightP?.is_blank
            ? `Page ${leftP?.page_number} & Inside Back Cover`
            : `Pages ${leftP?.page_number} & ${rightP?.page_number}`,
          leftPage: leftP,
          rightPage: rightP,
        });
        stepCount++;
      }
    } else {
      // Blank page OFF: No inside front cover, Page 1 on left, Page 2 on right
      stepCount = 1;
      for (let i = 0; i < interiorPages.length; i += 2) {
        const leftP = interiorPages[i];
        const rightP = interiorPages[i + 1] || null;
        steps.push({
          type: "spread",
          stepIndex: stepCount,
          title: rightP
            ? `Pages ${leftP?.page_number} & ${rightP?.page_number}`
            : `Page ${leftP?.page_number}`,
          leftPage: leftP,
          rightPage: rightP,
        });
        stepCount++;
      }
    }

    // Step N: Back Cover (Single Closed Book View)
    steps.push({
      type: "cover_back",
      stepIndex: stepCount,
      title: "Back Cover (Closed Book)",
      page: backCover,
    });

    return steps;
  }, [designData, cartItem, templateData]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={980}
      destroyOnClose
      styles={{
        body: { padding: "16px 20px" },
      }}
    >
      {loading && !designData ? (
        <div className="min-h-[460px] flex flex-col items-center justify-center gap-3">
          <Spin size="large" />
          <span className="text-sm text-slate-500 font-medium">
            Loading photobook preview...
          </span>
        </div>
      ) : previewSteps.length > 0 ? (
        <RealisticBookPreview
          steps={previewSteps}
          currentStepIndex={stepIndex}
          onStepChange={setStepIndex}
          renderCanvas={(page) => <PhotobookPageCanvas page={page} />}
          onClose={onClose}
          sizeInfo={sizeInfo}
          availableSizes={null}
          onSelectSize={null}
        />
      ) : (
        <div className="min-h-[300px] flex flex-col items-center justify-center text-slate-400 gap-2">
          <BookOutlined className="text-4xl text-slate-300" />
          <p className="text-sm font-medium">
            No design pages available for preview.
          </p>
        </div>
      )}
    </Modal>
  );
};

export default PhotoBookPreviewModal;
