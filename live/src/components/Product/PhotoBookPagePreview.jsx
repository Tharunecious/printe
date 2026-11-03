import React, { useState, useMemo } from "react";
import { Tooltip, Button, Tag, Slider } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  DeleteOutlined,
  CheckCircleFilled,
  ExclamationCircleFilled,
  ReloadOutlined,
  PictureOutlined,
  EditOutlined,
} from "@ant-design/icons";

export const PhotoBookPagePreview = ({
  design,
  activePageIndex = 0,
  setActivePageIndex,
  onUpdateFrame,
  onRemovePhotoFromFrame,
}) => {
  const [selectedFrameId, setSelectedFrameId] = useState(null);

  const pages = useMemo(() => design?.pages || [], [design?.pages]);
  const currentPage = pages[activePageIndex] || pages[0] || null;

  const totalPages = pages.length;

  const handlePrevPage = () => {
    if (activePageIndex > 0) {
      setActivePageIndex(activePageIndex - 1);
      setSelectedFrameId(null);
    }
  };

  const handleNextPage = () => {
    if (activePageIndex < totalPages - 1) {
      setActivePageIndex(activePageIndex + 1);
      setSelectedFrameId(null);
    }
  };

  // Find selected frame in current page
  const selectedFrame = useMemo(() => {
    if (!currentPage || !selectedFrameId) return null;
    return (currentPage.photo_frames || []).find((f) => f.frame_id === selectedFrameId) || null;
  }, [currentPage, selectedFrameId]);

  // Adjust zoom for selected frame
  const handleZoomChange = (val) => {
    if (!selectedFrame || !onUpdateFrame) return;
    onUpdateFrame(currentPage.page_number, selectedFrame.frame_id, {
      crop: { ...(selectedFrame.crop || {}), zoom: val },
    });
  };

  // Check if a page is complete
  const isPageComplete = (page) => {
    if (!page) return false;
    const frames = page.photo_frames || [];
    if (frames.length === 0) return true;
    const required = frames.filter((f) => f.is_required !== false);
    if (required.length === 0) return frames.some((f) => Boolean(f.photo_url));
    return required.every((f) => Boolean(f.photo_url));
  };

  const getPageTitle = (page, idx) => {
    if (!page) return "";
    if (page.page_type === "front_cover") return "Front Cover";
    if (page.page_type === "back_cover") return "Back Cover";
    return `Page ${page.page_number || idx + 1}`;
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* ── Top Header Controls ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Button
            type="text"
            shape="circle"
            icon={<LeftOutlined />}
            disabled={activePageIndex <= 0}
            onClick={handlePrevPage}
          />
          <div>
            <span className="font-bold text-gray-800 text-sm md:text-base">
              {getPageTitle(currentPage, activePageIndex)}
            </span>
            <span className="text-xs text-gray-500 ml-2">
              ({activePageIndex + 1} of {totalPages})
            </span>
          </div>
          <Button
            type="text"
            shape="circle"
            icon={<RightOutlined />}
            disabled={activePageIndex >= totalPages - 1}
            onClick={handleNextPage}
          />
        </div>

        <div className="flex items-center gap-2">
          {isPageComplete(currentPage) ? (
            <Tag color="success" className="!rounded-full font-medium flex items-center gap-1">
              <CheckCircleFilled /> Complete
            </Tag>
          ) : (
            <Tag color="warning" className="!rounded-full font-medium flex items-center gap-1">
              <ExclamationCircleFilled /> Photos Needed
            </Tag>
          )}
        </div>
      </div>

      {/* ── Main Canvas / Book Spread ───────────────────────────────────── */}
      <div className="relative w-full aspect-square bg-gray-900/5 rounded-2xl p-4 md:p-6 border border-gray-200 flex items-center justify-center shadow-inner overflow-hidden">
        {/* Book shadow effect */}
        <div className="absolute inset-x-8 bottom-2 h-4 bg-black/10 blur-md rounded-full pointer-events-none" />

        {/* Page Sheet */}
        <div
          className="relative w-full h-full bg-white rounded-xl shadow-xl border border-gray-300 overflow-hidden flex flex-col transition-all duration-300"
          style={{
            background:
              currentPage?.background?.type === "gradient"
                ? currentPage?.background?.value
                : currentPage?.background?.value || "#ffffff",
          }}
        >
          {/* Header watermark/style for cover */}
          {currentPage?.page_type === "front_cover" && (
            <div className="absolute top-4 inset-x-0 text-center pointer-events-none z-10 px-4">
              <p className="text-[11px] uppercase tracking-widest text-amber-700 font-semibold drop-shadow-xs">
                {design?.variant || "Custom Photo Book"} • {design?.size || "8x8"}
              </p>
            </div>
          )}

          {/* Photo Frames Grid Render */}
          <div className="relative w-full h-full p-4 flex-1">
            {currentPage?.photo_frames?.length > 0 ? (
              <div
                className={`w-full h-full grid gap-3 ${
                  currentPage.photo_frames.length === 1
                    ? "grid-cols-1 grid-rows-1"
                    : currentPage.photo_frames.length === 2
                    ? currentPage.layout_id === "2-horizontal"
                      ? "grid-cols-1 grid-rows-2"
                      : "grid-cols-2 grid-rows-1"
                    : currentPage.photo_frames.length === 3
                    ? "grid-cols-2 grid-rows-2"
                    : "grid-cols-2 grid-rows-2"
                }`}
              >
                {currentPage.photo_frames.map((frame, fIdx) => {
                  const isSelected = selectedFrameId === frame.frame_id;
                  const hasPhoto = Boolean(frame.photo_url);
                  const isSpanHero =
                    currentPage.photo_frames.length === 3 && fIdx === 0;

                  return (
                    <div
                      key={frame.frame_id || fIdx}
                      onClick={() => setSelectedFrameId(frame.frame_id)}
                      className={`relative group rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200 flex items-center justify-center bg-gray-50 ${
                        isSpanHero ? "row-span-2" : ""
                      } ${
                        isSelected
                          ? "border-amber-500 shadow-lg ring-2 ring-amber-300"
                          : hasPhoto
                          ? "border-transparent hover:border-amber-400"
                          : "border-dashed border-gray-300 hover:border-amber-400"
                      }`}
                    >
                      {hasPhoto ? (
                        <>
                          <img
                            src={frame.photo_url}
                            alt="Photo placement"
                            className="w-full h-full object-cover transition-transform duration-200"
                            style={{
                              transform: `scale(${frame.crop?.zoom || 1}) translate(${
                                frame.crop?.offsetX || 0
                              }px, ${frame.crop?.offsetY || 0}px) rotate(${
                                frame.rotation || 0
                              }deg)`,
                            }}
                          />
                          {/* Hover Overlay Controls */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Tooltip title="Click to adjust zoom/crop">
                              <span className="p-2 rounded-full bg-white/90 text-gray-800 hover:bg-white text-xs font-bold shadow">
                                <EditOutlined /> Edit
                              </span>
                            </Tooltip>
                            {onRemovePhotoFromFrame && (
                              <Tooltip title="Remove photo">
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemovePhotoFromFrame(
                                      currentPage.page_number,
                                      frame.frame_id
                                    );
                                  }}
                                  className="p-2 rounded-full bg-red-600/90 text-white hover:bg-red-600 text-xs font-bold shadow"
                                >
                                  <DeleteOutlined />
                                </span>
                              </Tooltip>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-3 text-center text-gray-400 group-hover:text-amber-600">
                          <PictureOutlined className="text-2xl mb-1" />
                          <span className="text-[11px] font-medium">Click photo from tray</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                <p>No photo frames configured on this page</p>
              </div>
            )}
          </div>

          {/* Bottom Cover Title or Page Number */}
          <div className="py-2 px-4 border-t border-gray-100 bg-white/80 backdrop-blur-xs flex items-center justify-between text-xs text-gray-500">
            <span>
              {currentPage?.page_type === "front_cover"
                ? "Cover Page"
                : currentPage?.page_type === "back_cover"
                ? "Back Cover"
                : `Interior Page ${currentPage?.page_number}`}
            </span>
            <span>
              {currentPage?.photo_frames?.filter((f) => f.photo_url)?.length || 0}/
              {currentPage?.photo_frames?.length || 0} Photos Placed
            </span>
          </div>
        </div>
      </div>

      {/* ── Selected Frame Quick Editor Bar ─────────────────────────────── */}
      {selectedFrame && selectedFrame.photo_url && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-900">Photo Zoom:</span>
            <ZoomOutOutlined className="text-gray-500" />
            <Slider
              min={1}
              max={2.5}
              step={0.1}
              value={selectedFrame.crop?.zoom || 1}
              onChange={handleZoomChange}
              className="w-28 md:w-40 !m-0"
            />
            <ZoomInOutlined className="text-gray-500" />
          </div>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() =>
              onRemovePhotoFromFrame(currentPage.page_number, selectedFrame.frame_id)
            }
          >
            Remove
          </Button>
        </div>
      )}

      {/* ── Bottom Filmstrip Thumbnail Navigation ───────────────────────── */}
      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between text-xs text-gray-600 px-1">
          <span className="font-bold">Page Navigation Strip</span>
          <span className="text-gray-400">Click a thumbnail to edit that page</span>
        </div>
        <div className="w-full overflow-x-auto flex items-center gap-2.5 pb-2 pt-1 px-1 scrollbar-thin">
          {pages.map((page, idx) => {
            const isActive = idx === activePageIndex;
            const complete = isPageComplete(page);
            const firstPhoto = page.photo_frames?.find((f) => f.photo_url)?.photo_url;

            return (
              <div
                key={page.page_number || idx}
                onClick={() => {
                  setActivePageIndex(idx);
                  setSelectedFrameId(null);
                }}
                className={`relative flex-shrink-0 w-16 h-20 rounded-lg border-2 cursor-pointer transition-all duration-200 bg-white flex flex-col overflow-hidden shadow-xs ${
                  isActive
                    ? "border-amber-500 ring-2 ring-amber-300 scale-105"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                {/* Thumbnail Visual */}
                <div className="flex-1 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                  {firstPhoto ? (
                    <img
                      src={firstPhoto}
                      alt={`Page ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-gray-400 font-bold">
                      {page.photo_frames?.length || 0} frames
                    </span>
                  )}
                  {/* Status indicator badge */}
                  <span className="absolute top-1 right-1">
                    {complete ? (
                      <CheckCircleFilled className="text-green-500 text-[10px] bg-white rounded-full" />
                    ) : (
                      <ExclamationCircleFilled className="text-amber-500 text-[10px] bg-white rounded-full" />
                    )}
                  </span>
                </div>

                {/* Thumbnail Label */}
                <div
                  className={`text-[9px] font-bold text-center py-0.5 ${
                    isActive ? "bg-amber-500 text-white" : "bg-gray-50 text-gray-600"
                  }`}
                >
                  {page.page_type === "front_cover"
                    ? "Cover"
                    : page.page_type === "back_cover"
                    ? "Back"
                    : `P. ${page.page_number || idx + 1}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PhotoBookPagePreview;
