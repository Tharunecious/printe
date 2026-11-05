import React, { useRef } from "react";
import { Progress, Spin } from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  PictureOutlined,
  CheckCircleOutlined,
  DragOutlined,
} from "@ant-design/icons";

/**
 * Step 2: "Upload Photos"
 * Allows customer to drag & drop or select photos to meet their configured target count.
 * Displays uploaded grid with reordering, preview, and removal before entering the canvas editor.
 */
const UploadPhotosStep = ({
  targetPhotoCount,
  uploadedPhotos,
  isUploading,
  uploadPercent,
  handleFilesSelected,
  handleDeletePhoto,
  handlePhotoDragStart,
  handlePhotoDragOver,
  handlePhotoDrop,
  onPreviewPhoto,
  onBack,
  onProceedToEdit,
  isGiveaway = false,
}) => {
  const fileInputRef = useRef(null);
  const remainingCount = Math.max(0, targetPhotoCount - uploadedPhotos.length);
  const canProceed = isGiveaway
    ? uploadedPhotos.length === targetPhotoCount
    : uploadedPhotos.length > 0;
  const uploadProgressRatio = Math.min(
    100,
    Math.round((uploadedPhotos.length / Math.max(1, targetPhotoCount)) * 100)
  );

  return (
    <div className="w-full flex-1 overflow-y-auto bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ── Top Header & Upload Status ───────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {isGiveaway ? "Upload Photos for Giveaway Photo Book" : "Upload Your Memories"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Required: <span className="font-bold text-teal-700">{targetPhotoCount} Photos</span> • Uploaded:{" "}
              <span className="font-bold text-slate-800">{uploadedPhotos.length}</span>
              {isGiveaway ? (
                <>
                  {" "}• Remaining:{" "}
                  <span className={`font-bold ${remainingCount > 0 ? "text-amber-600" : "text-green-600"}`}>
                    {remainingCount > 0 ? `${remainingCount} required` : "Complete ✓"}
                  </span>
                </>
              ) : null}
            </p>
          </div>

          <div className="w-full sm:w-48 space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>Goal Progress</span>
              <span className="text-teal-700">{uploadProgressRatio}%</span>
            </div>
            <Progress
              percent={uploadProgressRatio}
              showInfo={false}
              strokeColor="#0d9488"
              size="small"
            />
          </div>
        </div>

        {/* ── Click to Upload Photos Zone ─────────────────────────────────── */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-white border-2 border-dashed border-teal-300 hover:border-teal-500 hover:bg-teal-50/20 rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-sm group"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFilesSelected}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-full bg-teal-50 group-hover:bg-teal-100/80 text-teal-600 flex items-center justify-center mb-3 transition-colors shadow-xs">
            {isUploading ? (
              <Spin size="default" />
            ) : (
              <UploadOutlined className="text-2xl" />
            )}
          </div>

          <h3 className="text-sm font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
            {isUploading ? `Uploading... (${uploadPercent}%)` : "Click to Browse & Upload Photos"}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Select unique photos from your device. Supported formats: JPG, PNG, WebP, HEIC.
          </p>

          <button
            type="button"
            className="mt-4 bg-teal-600 group-hover:bg-teal-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <PictureOutlined />
            <span>Browse Device Photos</span>
          </button>
        </div>

        {/* ── Uploaded Gallery Grid ────────────────────────────────────────── */}
        {uploadedPhotos.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircleOutlined className="text-teal-600 text-base" />
                <h3 className="text-sm font-bold text-slate-900">
                  Ready to Flow into Pages ({uploadedPhotos.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Drag photos to reorder sequence
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {uploadedPhotos.map((photo, idx) => (
                <div
                  key={photo.id}
                  draggable
                  onDragStart={() => handlePhotoDragStart(idx)}
                  onDragOver={handlePhotoDragOver}
                  onDrop={() => handlePhotoDrop(idx)}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs hover:shadow-md transition-all cursor-move select-none"
                >
                  <img
                    src={photo.url}
                    alt={photo.name || "Upload"}
                    className="w-full h-full object-cover pointer-events-none"
                  />

                  {/* Index badge */}
                  <span className="absolute top-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md pointer-events-none">
                    #{idx + 1}
                  </span>

                  {/* Hover action overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onPreviewPhoto) onPreviewPhoto(photo.url);
                      }}
                      className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center text-xs shadow-xs transition-transform active:scale-90"
                      title="Preview Photo"
                    >
                      <EyeOutlined />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(photo.id);
                      }}
                      className="w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-xs shadow-xs transition-transform active:scale-90"
                      title="Remove Photo"
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Navigation Footer ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeftOutlined />
            <span>{isGiveaway ? "Back to Product" : "Back to Book Setup"}</span>
          </button>

          <button
            type="button"
            disabled={!canProceed}
            onClick={() => {
              if (!canProceed) return;
              onProceedToEdit();
            }}
            title={
              !canProceed
                ? isGiveaway
                  ? `Please upload exactly ${targetPhotoCount} photos (${remainingCount} remaining)`
                  : "Please upload at least 1 photo to proceed"
                : "Proceed to Album Editor"
            }
            className={`w-full sm:w-auto font-bold text-sm px-8 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
              !canProceed
                ? "bg-slate-300 text-slate-500 cursor-not-allowed opacity-75 shadow-none"
                : "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 active:scale-98 text-white cursor-pointer"
            }`}
          >
            <span>
              {isGiveaway
                ? canProceed
                  ? `Next: Edit Your Book (${uploadedPhotos.length} photos)`
                  : `Upload ${remainingCount} More Photo${remainingCount !== 1 ? "s" : ""} to Proceed`
                : uploadedPhotos.length > 0
                ? `Next: Arrange & Edit Album (${uploadedPhotos.length} photos)`
                : "Upload Photos to Proceed"}
            </span>
            <ArrowRightOutlined />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPhotosStep;
