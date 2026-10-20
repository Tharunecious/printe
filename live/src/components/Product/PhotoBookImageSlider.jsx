import React, { useState, useMemo, useCallback } from "react";
import { Tooltip, Tag } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  ZoomInOutlined,
  BookOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "motion/react";

const PhotoBookImageSlider = ({
  imageList = [],
  data = {},
  selectedSize = null,
  selectedVariant = {},
  selectedPages = 26,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSpreadView, setIsSpreadView] = useState(false);

  // Normalize images
  const processedImages = useMemo(() => {
    return (
      imageList
        ?.map((img) => {
          if (typeof img === "string") {
            if (img.startsWith("http")) return img;
            if (img.startsWith("/")) return `${window.location.origin}${img}`;
            return `${window.location.origin}/${img}`;
          }
          const url = img?.path || img?.url || "";
          if (!url) return "";
          if (url.startsWith("http")) return url;
          if (url.startsWith("/")) return `${window.location.origin}${url}`;
          return `${window.location.origin}/${url}`;
        })
        .filter(Boolean) || []
    );
  }, [imageList]);

  const currentImage =
    processedImages[activeIndex] ||
    "https://printe.s3.ap-south-1.amazonaws.com/1763971587472-qf92jdbjm4.jpg";

  const nextImage = useCallback(() => {
    if (processedImages.length > 1) {
      setActiveIndex((prev) => (prev + 1) % processedImages.length);
    }
  }, [processedImages.length]);

  const prevImage = useCallback(() => {
    if (processedImages.length > 1) {
      setActiveIndex((prev) =>
        prev === 0 ? processedImages.length - 1 : prev - 1,
      );
    }
  }, [processedImages.length]);

  // Dimensions & aspect ratio
  const widthIn = selectedSize?.width_in || 8;
  const heightIn = selectedSize?.height_in || 8;
  const widthCm = selectedSize?.width_cm || (widthIn * 2.54).toFixed(1);
  const heightCm = selectedSize?.height_cm || (heightIn * 2.54).toFixed(1);
  const sizeName = selectedSize?.name || `${widthIn}x${heightIn}`;
  const isSquare = widthIn === heightIn;

  // Selected variant title and value
  const variantSummary = useMemo(() => {
    if (!selectedVariant || typeof selectedVariant !== "object") return "Basic";
    const keys = Object.keys(selectedVariant);
    if (keys.length === 0) return "Basic";
    return keys.map((k) => `${selectedVariant[k]}`).join(" • ");
  }, [selectedVariant]);

  return (
    <div className="flex flex-col space-y-4 select-none">
      {/* ── Main Photo Book Viewport ────────────────────────────────────────── */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 rounded-2xl overflow-hidden border border-gray-200/80 shadow-sm group">
        {/* Subtle photo book decorative cover background framing */}
        <div className="absolute inset-0 flex items-center justify-center p-6 md:p-10">
          <AnimatePresence mode="wait">
            {!isSpreadView ? (
              // Single Cover / Page View
              <motion.div
                key={`single-${currentImage}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="relative max-w-full max-h-full rounded-xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-gray-900/10"
                style={{
                  aspectRatio: `${widthIn} / ${heightIn}`,
                }}
              >
                <img
                  src={currentImage}
                  alt={data?.name || "Photo Book"}
                  className="w-full h-full object-cover"
                />
                {/* Book spine simulation overlay on the left */}
                <div className="absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-black/40 via-black/15 to-transparent pointer-events-none" />
                <div className="absolute top-0 bottom-0 left-4 w-1 bg-white/20 pointer-events-none" />
              </motion.div>
            ) : (
              // Open 2-Page Spread View Simulation
              <motion.div
                key={`spread-${currentImage}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="relative w-full max-w-full rounded-xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-gray-900/10 flex bg-white"
                style={{
                  aspectRatio: `${widthIn * 2} / ${heightIn}`,
                }}
              >
                {/* Left Page */}
                <div className="w-1/2 h-full relative overflow-hidden border-r border-gray-200/60 bg-gray-50 flex items-center justify-center">
                  <img
                    src={currentImage}
                    alt="Left Page"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 bottom-0 right-0 w-6 bg-gradient-to-l from-black/25 via-black/10 to-transparent pointer-events-none" />
                </div>
                {/* Right Page */}
                <div className="w-1/2 h-full relative overflow-hidden bg-white flex items-center justify-center">
                  <img
                    src={processedImages[(activeIndex + 1) % processedImages.length] || currentImage}
                    alt="Right Page"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 bottom-0 left-0 w-6 bg-gradient-to-r from-black/25 via-black/10 to-transparent pointer-events-none" />
                </div>
                {/* Gutter / Center Spine Fold line */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1.5 bg-gradient-to-r from-black/30 via-black/50 to-black/30 pointer-events-none shadow-sm" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-20">
          <Tag color="cyan" className="m-0 font-medium px-2.5 py-0.5 rounded-full shadow-sm text-xs border-0">
            <BookOutlined className="mr-1" /> Photo Book
          </Tag>
          <Tag color="blue" className="m-0 font-semibold px-2.5 py-0.5 rounded-full shadow-sm text-xs border-0">
            {sizeName} ({widthIn}&quot;×{heightIn}&quot;)
          </Tag>
          <Tag color="purple" className="m-0 font-medium px-2.5 py-0.5 rounded-full shadow-sm text-xs border-0">
            {selectedPages} Pages
          </Tag>
        </div>

        {/* View Toggle Buttons (Cover vs Spread) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20 bg-white/90 backdrop-blur-md p-1 rounded-lg border border-gray-200/80 shadow-sm">
          <button
            onClick={() => setIsSpreadView(false)}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
              !isSpreadView
                ? "bg-teal-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Cover View
          </button>
          <button
            onClick={() => setIsSpreadView(true)}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-all ${
              isSpreadView
                ? "bg-teal-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Open Spread
          </button>
        </div>

        {/* Arrows for multi-images */}
        {processedImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Previous"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:text-teal-600 hover:bg-white transition-all opacity-0 group-hover:opacity-100 z-20"
            >
              <LeftOutlined className="text-sm" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Next"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-gray-200 flex items-center justify-center text-gray-700 hover:text-teal-600 hover:bg-white transition-all opacity-0 group-hover:opacity-100 z-20"
            >
              <RightOutlined className="text-sm" />
            </button>
          </>
        )}

        {/* Bottom Specs Bar on the image */}
        <div className="absolute bottom-3 inset-x-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between z-20">
          <div className="flex items-center gap-2 text-xs text-gray-700 font-medium">
            <span className="font-semibold text-teal-800">{sizeName}</span>
            <span className="text-gray-400">•</span>
            <span>{widthCm} × {heightCm} cm</span>
            <span className="text-gray-400">•</span>
            <span className="text-teal-700 font-semibold">{variantSummary}</span>
          </div>
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="text-xs text-gray-500 hover:text-teal-700 flex items-center gap-1 font-medium transition-colors"
          >
            <ZoomInOutlined /> Fullscreen
          </button>
        </div>
      </div>

      {/* ── Thumbnails Carousel ────────────────────────────────────────────── */}
      {processedImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-gray-200">
          {processedImages.map((img, idx) => (
            <button
              key={`thumb-${idx}`}
              onClick={() => setActiveIndex(idx)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                activeIndex === idx
                  ? "border-teal-600 ring-2 ring-teal-600/30 scale-105"
                  : "border-gray-200 opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Fullscreen Lightbox Modal ──────────────────────────────────────── */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-4 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <div className="flex items-center gap-2">
                <BookOutlined className="text-teal-600 text-lg" />
                <span className="font-semibold text-gray-800">
                  {data?.name || "Photo Book"} — {sizeName} ({widthIn}&quot;×{heightIn}&quot;)
                </span>
                <Tag color="cyan">{selectedPages} Pages</Tag>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>
            <img
              src={currentImage}
              alt="High Resolution Preview"
              className="max-h-[70vh] object-contain rounded-lg shadow-sm"
            />
            <div className="text-xs text-gray-500 pt-3">
              {widthIn}&quot; × {heightIn}&quot; ({widthCm} × {heightCm} cm) • {selectedPages} Pages • {variantSummary}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoBookImageSlider;
