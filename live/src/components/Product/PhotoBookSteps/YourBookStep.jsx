import React, { useMemo, useEffect } from "react";
import { Slider, InputNumber } from "antd";
import { formatBookSizeInches } from "../../../helper/photobookSizeHelper";
import {
  CheckOutlined,
  MinusOutlined,
  PlusOutlined,
  ArrowRightOutlined,
  BookOutlined,
} from "@ant-design/icons";

/**
 * Calculates dynamic min and max photo bounds based on page count and density mode.
 * Example for 20 pages:
 * - 1 photo per page: min 20, max 25
 * - 2 photos per page: min 20, max 40
 * - mixed photos per page: min 20, max 80 (1 to 4 photos per page randomly)
 * - 4 photos per page: min 20, max 80 (up to 4 photos per page)
 */
export const getPhotoBoundsForDensity = (pages, densityMode) => {
  const p = Math.max(1, Number(pages) || 20);
  switch (densityMode) {
    case "template":
    case "admin_theme":
      return {
        min: p,
        max: p * 4,
      };
    case "1":
      return {
        min: p,
        max: p + Math.max(5, Math.round(p * 0.25)), // e.g. 20 -> 25, 24 -> 30, 40 -> 50
      };
    case "2":
      return {
        min: p,
        max: p * 2, // e.g. 20 -> 40, 24 -> 48
      };
    case "3":
      return {
        min: p,
        max: p * 3, // e.g. 20 -> 60, 24 -> 72
      };
    case "mixed":
      return {
        min: p,
        max: p * 4, // e.g. 20 -> 80, 24 -> 96 (min 1/page, max 4/page)
      };
    case "4":
      return {
        min: p,
        max: p * 4, // e.g. 20 -> 80, 24 -> 96
      };
    default:
      return {
        min: p,
        max: p * 4,
      };
  }
};

/**
 * Step 1: "Your Book"
 * Configuration step where customer sets the photo count and chooses photo density per page.
 */
const YourBookStep = ({
  photoBookPages,
  targetPhotoCount,
  setTargetPhotoCount,
  photosPerPageMode,
  setPhotosPerPageMode,
  priceDetails,
  onProceedToUpload,
}) => {
  // Current active mode bounds
  const currentBounds = useMemo(
    () => getPhotoBoundsForDensity(photoBookPages, photosPerPageMode),
    [photoBookPages, photosPerPageMode]
  );

  // Keep targetPhotoCount strictly within currentBounds whenever pages or density mode change
  useEffect(() => {
    setTargetPhotoCount((prev) => {
      const clamped = Math.min(currentBounds.max, Math.max(currentBounds.min, prev));
      return clamped;
    });
  }, [currentBounds, setTargetPhotoCount]);

  // Dynamic density layout cards
  const densityOptions = useMemo(() => {
    const p = Math.max(1, Number(photoBookPages) || 20);

    const bTpl = getPhotoBoundsForDensity(p, "template");
    const b1 = getPhotoBoundsForDensity(p, "1");
    const b2 = getPhotoBoundsForDensity(p, "2");
    const b3 = getPhotoBoundsForDensity(p, "3");
    const bMixed = getPhotoBoundsForDensity(p, "mixed");
    const b4 = getPhotoBoundsForDensity(p, "4");

    return [
      {
        id: "template",
        title: "Admin Template Layout",
        badge: "Original Placeholder Design",
        desc: "Photos fit on placeholders designed by template creator",
        icon: (
          <svg viewBox="0 0 52 36" className="w-12 h-9">
            <rect x="2" y="2" width="22" height="32" rx="2" fill="#f8fafc" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="13" cy="14" r="6.5" fill="#f59e0b" />
            <rect x="5" y="23" width="16" height="3.5" rx="1" fill="#cbd5e1" />
            <rect x="28" y="2" width="22" height="32" rx="2" fill="#f8fafc" stroke="currentColor" strokeWidth="1.5" />
            <rect x="32" y="6" width="14" height="15" rx="1.5" fill="#cbd5e1" />
            <rect x="32" y="23" width="14" height="3.5" rx="1" fill="#f59e0b" />
          </svg>
        ),
      },
      {
        id: "1",
        title: "1 Photo Per Page",
        badge: `${b1.min} - ${b1.max} Photos`,
        desc: "Fewer per page means bigger, impactful photos",
        icon: (
          <svg viewBox="0 0 52 36" className="w-12 h-9">
            <rect x="2" y="2" width="22" height="32" rx="2" fill="#f8fafc" stroke="currentColor" strokeWidth="1.5" />
            <rect x="6" y="6" width="14" height="24" rx="1.5" fill="#cbd5e1" />
            <rect x="28" y="2" width="22" height="32" rx="2" fill="#f8fafc" stroke="currentColor" strokeWidth="1.5" />
            <rect x="32" y="6" width="14" height="24" rx="1.5" fill="#cbd5e1" />
          </svg>
        ),
      },
      {
        id: "2",
        title: "2 Photos Per Page",
        badge: `${b2.min} - ${b2.max} Photos`,
        desc: "Balanced 2-photo spreads for your highlights",
        icon: (
          <svg viewBox="0 0 52 36" className="w-12 h-9">
            <rect x="2" y="2" width="22" height="32" rx="2" fill="#f8fafc" stroke="currentColor" strokeWidth="1.5" />
            <rect x="5" y="5" width="16" height="11" rx="1.5" fill="#cbd5e1" />
            <rect x="5" y="19" width="16" height="11" rx="1.5" fill="#cbd5e1" />
            <rect x="28" y="2" width="22" height="32" rx="2" fill="#f8fafc" stroke="currentColor" strokeWidth="1.5" />
            <rect x="31" y="5" width="16" height="11" rx="1.5" fill="#cbd5e1" />
            <rect x="31" y="19" width="16" height="11" rx="1.5" fill="#cbd5e1" />
          </svg>
        ),
      },
      {
        id: "3",
        title: "3 Photos Per Page",
        badge: `${b3.min} - ${b3.max} Photos`,
        desc: "Trio photo arrangements with hero shots",
        icon: (
          <svg viewBox="0 0 52 36" className="w-12 h-9">
            <rect x="2" y="2" width="22" height="32" rx="2" fill="#f8fafc" stroke="currentColor" strokeWidth="1.5" />
            <rect x="4.5" y="5" width="4.5" height="24" rx="1" fill="#cbd5e1" />
            <rect x="10.5" y="5" width="4.5" height="24" rx="1" fill="#cbd5e1" />
            <rect x="16.5" y="5" width="4.5" height="24" rx="1" fill="#cbd5e1" />
            <rect x="28" y="2" width="22" height="32" rx="2" fill="#f8fafc" stroke="currentColor" strokeWidth="1.5" />
            <rect x="31" y="5" width="7.5" height="11" rx="1" fill="#cbd5e1" />
            <rect x="39.5" y="5" width="7.5" height="11" rx="1" fill="#cbd5e1" />
            <rect x="31" y="19" width="16" height="11" rx="1" fill="#cbd5e1" />
          </svg>
        ),
      },
      {
        id: "4",
        title: "4 Photos Per Page",
        badge: `${b4.min} - ${b4.max} Photos`,
        desc: "Maximum density collage grid (up to 4 per page)",
        icon: (
          <svg viewBox="0 0 52 36" className="w-12 h-9">
            <rect x="2" y="2" width="22" height="32" rx="2" fill="#f8fafc" stroke="currentColor" strokeWidth="1.5" />
            <rect x="5" y="5" width="7.5" height="11" rx="1.5" fill="#cbd5e1" />
            <rect x="13.5" y="5" width="7.5" height="11" rx="1.5" fill="#cbd5e1" />
            <rect x="5" y="19" width="7.5" height="11" rx="1.5" fill="#cbd5e1" />
            <rect x="13.5" y="19" width="7.5" height="11" rx="1.5" fill="#cbd5e1" />
            <rect x="28" y="2" width="22" height="32" rx="2" fill="#f8fafc" stroke="currentColor" strokeWidth="1.5" />
            <rect x="31" y="5" width="7.5" height="11" rx="1.5" fill="#cbd5e1" />
            <rect x="39.5" y="5" width="7.5" height="11" rx="1.5" fill="#cbd5e1" />
            <rect x="31" y="19" width="7.5" height="11" rx="1.5" fill="#cbd5e1" />
            <rect x="39.5" y="19" width="7.5" height="11" rx="1.5" fill="#cbd5e1" />
          </svg>
        ),
      },
      {
        id: "mixed",
        title: "Mixed Photos Per Page",
        badge: `${bMixed.min} - ${bMixed.max} Photos`,
        desc: "Random mix of 1 to 4 photos per page",
        icon: (
          <svg viewBox="0 0 52 36" className="w-12 h-9">
            <rect x="2" y="2" width="22" height="32" rx="2" fill="#f8fafc" stroke="currentColor" strokeWidth="1.5" />
            <rect x="6" y="6" width="14" height="24" rx="1.5" fill="#cbd5e1" />
            <rect x="28" y="2" width="22" height="32" rx="2" fill="#f8fafc" stroke="currentColor" strokeWidth="1.5" />
            <rect x="31" y="5" width="16" height="11" rx="1.5" fill="#cbd5e1" />
            <rect x="31" y="19" width="16" height="11" rx="1.5" fill="#cbd5e1" />
          </svg>
        ),
      },
    ];
  }, [photoBookPages]);

  const handleSelectDensity = (opt) => {
    setPhotosPerPageMode(opt.id);
    const bounds = getPhotoBoundsForDensity(photoBookPages, opt.id);
    setTargetPhotoCount((prev) => Math.min(bounds.max, Math.max(bounds.min, prev)));
  };

  const handleDecrement = () => {
    setTargetPhotoCount((prev) => Math.max(currentBounds.min, prev - 1));
  };

  const handleIncrement = () => {
    setTargetPhotoCount((prev) => Math.min(currentBounds.max, prev + 1));
  };

  return (
    <div className="w-full flex-1 overflow-y-auto bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ── Section 1: How Many Photos? ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-0.5">
                1
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  How Many Photos?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Drag the slider or type the exact number you have
                </p>
              </div>
            </div>

            {/* Stepper Input: [-] [ number ] [+] */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-xs self-start sm:self-auto">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={targetPhotoCount <= currentBounds.min}
                className="w-9 h-9 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200/80 flex items-center justify-center text-slate-700 transition-all cursor-pointer active:scale-95"
                title="Decrease photos"
              >
                <MinusOutlined className="text-xs" />
              </button>
              <InputNumber
                min={currentBounds.min}
                max={currentBounds.max}
                value={targetPhotoCount}
                onChange={(val) => {
                  const num = Number(val);
                  if (!isNaN(num)) {
                    setTargetPhotoCount(Math.max(currentBounds.min, Math.min(currentBounds.max, num)));
                  }
                }}
                className="!w-16 !border-0 !shadow-none !bg-transparent text-center font-bold text-base text-slate-800"
                controls={false}
              />
              <button
                type="button"
                onClick={handleIncrement}
                disabled={targetPhotoCount >= currentBounds.max}
                className="w-9 h-9 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200/80 flex items-center justify-center text-slate-700 transition-all cursor-pointer active:scale-95"
                title="Increase photos"
              >
                <PlusOutlined className="text-xs" />
              </button>
            </div>
          </div>

          {/* Smooth Range Slider */}
          <div className="px-1 pt-2">
            <Slider
              min={currentBounds.min}
              max={currentBounds.max}
              value={targetPhotoCount}
              onChange={(val) => setTargetPhotoCount(val)}
              tooltip={{
                formatter: (val) => `${val} Photos`,
              }}
            />
            <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 mt-1">
              <span>Min {currentBounds.min}</span>
              <span className="text-teal-700 font-bold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                {targetPhotoCount} Photos Selected
              </span>
              <span>Max {currentBounds.max}</span>
            </div>
          </div>

          {/* Breakdown Summary Badge */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 flex items-center gap-3 text-xs text-slate-700">
            <BookOutlined className="text-teal-600 text-lg shrink-0" />
            <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-slate-800">
                {photoBookPages} Pages (incl. covers) • Target = {targetPhotoCount} Photos
              </span>
              <span className="text-slate-500 font-medium">
                (~{(targetPhotoCount / Math.max(1, photoBookPages)).toFixed(1)} photos per page average)
              </span>
            </div>
          </div>
        </div>

        {/* ── Section 2: Photos Per Page ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-0.5">
              2
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Photos Per Page
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Fewer per page means bigger photos
              </p>
            </div>
          </div>

          {/* 6 Layout Density Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {densityOptions.map((opt) => {
              const isSelected = photosPerPageMode === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectDensity(opt)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative flex flex-col justify-between select-none group ${
                    isSelected
                      ? "border-teal-600 bg-teal-50/30 shadow-md ring-2 ring-teal-500/20"
                      : "border-slate-200 hover:border-teal-300 hover:bg-slate-50/80 bg-white"
                  }`}
                >
                  {/* Selected Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs">
                      <CheckOutlined className="text-[10px] font-bold" />
                    </div>
                  )}

                  {/* Wireframe Miniature Preview */}
                  <div className="w-full flex items-center justify-center p-3 text-slate-400 group-hover:text-teal-600 transition-colors">
                    {opt.icon}
                  </div>

                  {/* Title & Info */}
                  <div className="text-center mt-2 space-y-1">
                    <h4
                      className={`text-xs font-bold transition-colors ${
                        isSelected ? "text-teal-800" : "text-slate-800"
                      }`}
                    >
                      {opt.title}
                    </h4>
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                        isSelected
                          ? "bg-teal-600 text-white"
                          : "bg-slate-100 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-700"
                      }`}
                    >
                      {opt.badge}
                    </span>
                    <p className="text-[10px] text-slate-400 leading-tight pt-1">
                      {opt.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Section 3: Bottom Order Summary & Proceed CTA ───────────────── */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                Album ({photoBookPages} Pages{priceDetails.matchedEditionName ? ` • ${priceDetails.matchedEditionName}` : ""}{priceDetails.matchedSizeName ? ` • ${formatBookSizeInches(priceDetails.matchedSizeName)}` : ""})
              </span>
              <span className="text-lg font-bold text-slate-800">
                ₹{priceDetails.basePrice}
              </span>
            </div>
            {priceDetails.extraPages > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                  Extra Pages ({priceDetails.extraPages} × ₹{priceDetails.extraPricePerUnit})
                </span>
                <span className="text-sm font-bold text-amber-600">
                  +₹{priceDetails.extraPagesCost}
                </span>
              </div>
            )}
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                Total
              </span>
              <span className="text-xl font-extrabold text-teal-700">
                ₹{priceDetails.finalTotal}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onProceedToUpload}
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Next - Upload {targetPhotoCount} photos</span>
            <ArrowRightOutlined />
          </button>
        </div>
      </div>
    </div>
  );
};

export default YourBookStep;
