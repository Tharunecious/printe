import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Modal,
  Button,
  Tag,
  Tooltip,
  Spin,
  Progress,
  message,
  Popconfirm,
  Badge,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  LeftOutlined,
  RightOutlined,
  ShoppingCartOutlined,
  BookOutlined,
  SwapOutlined,
  ThunderboltOutlined,
  PictureOutlined,
  CloseOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { EnvHelper } from "../../helper/EnvHelper";
import _ from "lodash";

const UPLOAD_BASE_URL = EnvHelper.UPLOAD_BASE_API_URL;

// Available page layout templates
export const PAGE_LAYOUTS = [
  {
    id: "1-full",
    name: "1 Photo",
    slots: 1,
    description: "Full Page Hero",
    icon: (
      <div className="w-8 h-8 border border-gray-400 bg-gray-100 rounded flex items-center justify-center p-0.5">
        <div className="w-full h-full bg-blue-200 rounded-sm"></div>
      </div>
    ),
  },
  {
    id: "2-vertical",
    name: "2 Photos (Side by Side)",
    slots: 2,
    description: "Two Columns",
    icon: (
      <div className="w-8 h-8 border border-gray-400 bg-gray-100 rounded flex gap-0.5 p-0.5">
        <div className="w-1/2 h-full bg-blue-200 rounded-sm"></div>
        <div className="w-1/2 h-full bg-blue-200 rounded-sm"></div>
      </div>
    ),
  },
  {
    id: "2-horizontal",
    name: "2 Photos (Stacked)",
    slots: 2,
    description: "Two Rows",
    icon: (
      <div className="w-8 h-8 border border-gray-400 bg-gray-100 rounded flex flex-col gap-0.5 p-0.5">
        <div className="w-full h-1/2 bg-blue-200 rounded-sm"></div>
        <div className="w-full h-1/2 bg-blue-200 rounded-sm"></div>
      </div>
    ),
  },
  {
    id: "3-hero",
    name: "3 Photos",
    slots: 3,
    description: "1 Top + 2 Bottom",
    icon: (
      <div className="w-8 h-8 border border-gray-400 bg-gray-100 rounded flex flex-col gap-0.5 p-0.5">
        <div className="w-full h-1/2 bg-blue-200 rounded-sm"></div>
        <div className="w-full h-1/2 flex gap-0.5">
          <div className="w-1/2 h-full bg-blue-200 rounded-sm"></div>
          <div className="w-1/2 h-full bg-blue-200 rounded-sm"></div>
        </div>
      </div>
    ),
  },
  {
    id: "4-grid",
    name: "4 Photos",
    slots: 4,
    description: "2x2 Grid",
    icon: (
      <div className="w-8 h-8 border border-gray-400 bg-gray-100 rounded grid grid-cols-2 gap-0.5 p-0.5">
        <div className="w-full h-full bg-blue-200 rounded-sm"></div>
        <div className="w-full h-full bg-blue-200 rounded-sm"></div>
        <div className="w-full h-full bg-blue-200 rounded-sm"></div>
        <div className="w-full h-full bg-blue-200 rounded-sm"></div>
      </div>
    ),
  },
];

const PhotoBookDesignerModal = ({
  open,
  onClose,
  productData,
  selectedVariants = {},
  photoBookPages = 20,
  pricePerExtraPage = 15,
  extraPages = 0,
  extraPagesCost = 0,
  finalPrice = 0,
  onAddToCartSuccess,
}) => {
  // ── Step State ─────────────────────────────────────────────────────────────
  // 1: Upload Images | 2: Design Pages | 3: Preview and Add to Cart
  const [currentStep, setCurrentStep] = useState(1);

  // Min: 1 per page. Max: 4 per page.
  const minImages = useMemo(() => Math.max(1, photoBookPages * 1), [photoBookPages]);
  const maxImages = useMemo(() => Math.max(4, photoBookPages * 4), [photoBookPages]);

  // ── Uploaded Photos State ──────────────────────────────────────────────────
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const fileInputRef = useRef(null);

  // ── Pages Design State ─────────────────────────────────────────────────────
  // Each page: { pageNumber: 1, layout: "1-full", slots: [ photoObj, null, ... ] }
  const [pagesData, setPagesData] = useState([]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);

  // ── Preview State ──────────────────────────────────────────────────────────
  const [previewPageIndex, setPreviewPageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or re-initialize pages structure when total page count changes
  useEffect(() => {
    if (!open) return;
    setPagesData((prev) => {
      const existing = prev || [];
      const newPages = [];
      for (let i = 1; i <= photoBookPages; i++) {
        if (existing[i - 1]) {
          newPages.push(existing[i - 1]);
        } else {
          newPages.push({
            pageNumber: i,
            layout: "1-full",
            slots: [null],
          });
        }
      }
      return newPages;
    });
  }, [photoBookPages, open]);

  // Reset to Step 1 on open if not started
  useEffect(() => {
    if (open && uploadedPhotos.length === 0) {
      setCurrentStep(1);
      setActivePageIndex(0);
      setPreviewPageIndex(0);
    }
  }, [open]);

  // Count how many times each photo is used across all pages
  const photoUsageCount = useMemo(() => {
    const counts = {};
    pagesData.forEach((pg) => {
      (pg.slots || []).forEach((slot) => {
        if (slot?.id) {
          counts[slot.id] = (counts[slot.id] || 0) + 1;
        }
      });
    });
    return counts;
  }, [pagesData]);

  // Total slots filled across all pages
  const totalPhotosPlaced = useMemo(() => {
    let count = 0;
    pagesData.forEach((pg) => {
      (pg.slots || []).forEach((slot) => {
        if (slot) count++;
      });
    });
    return count;
  }, [pagesData]);

  // Check if every page has at least 1 image placed
  const pagesValidity = useMemo(() => {
    const emptyPages = [];
    pagesData.forEach((pg) => {
      const hasPhoto = (pg.slots || []).some((s) => Boolean(s));
      if (!hasPhoto) emptyPages.push(pg.pageNumber);
    });
    return {
      isValid: emptyPages.length === 0,
      emptyPages,
    };
  }, [pagesData]);

  // ── Handle Uploading Images (Step 1) ────────────────────────────────────────
  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const availableSlots = maxImages - uploadedPhotos.length;
    if (availableSlots <= 0) {
      message.warning(`Maximum limit of ${maxImages} images already reached.`);
      return;
    }

    const filesToUpload = files.slice(0, availableSlots);
    if (files.length > availableSlots) {
      message.info(`Only ${availableSlots} image(s) can be added to stay within the limit of ${maxImages}.`);
    }

    setIsUploading(true);
    setUploadPercent(0);

    const newPhotoObjs = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      if (!file.type.startsWith("image/")) {
        continue;
      }

      // Generate local object URL immediately for instant UI responsiveness
      const localUrl = URL.createObjectURL(file);
      const tempId = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const photoObj = {
        id: tempId,
        url: localUrl,
        file,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + "MB",
        isUploaded: false,
      };

      newPhotoObjs.push(photoObj);

      // Upload to server asynchronously
      try {
        const formData = new FormData();
        formData.append("image", file);
        const res = await axios.post(`${UPLOAD_BASE_URL}/upload_images`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const serverUrl = _.get(res, "data.data.url", "");
        if (serverUrl) {
          photoObj.url = serverUrl;
          photoObj.isUploaded = true;
        }
      } catch (err) {
        console.error("Image upload failed for", file.name, err);
        // keep localUrl as fallback
      }

      setUploadPercent(Math.round(((i + 1) / filesToUpload.length) * 100));
    }

    setUploadedPhotos((prev) => [...prev, ...newPhotoObjs]);
    setIsUploading(false);
    setUploadPercent(100);
    if (fileInputRef.current) fileInputRef.current.value = "";
    message.success(`Added ${newPhotoObjs.length} photo(s)`);
  };

  const handleDeletePhoto = (photoId) => {
    // Remove from uploadedPhotos
    setUploadedPhotos((prev) => prev.filter((p) => p.id !== photoId));
    // Remove from any pages where placed
    setPagesData((prev) =>
      prev.map((pg) => ({
        ...pg,
        slots: (pg.slots || []).map((s) => (s?.id === photoId ? null : s)),
      })),
    );
  };

  // ── Design Pages Logic (Step 2) ────────────────────────────────────────────
  const activePage = pagesData[activePageIndex] || {
    pageNumber: activePageIndex + 1,
    layout: "1-full",
    slots: [null],
  };

  // Change layout of active page
  const handleSelectLayout = (layoutId) => {
    const layoutDef = PAGE_LAYOUTS.find((l) => l.id === layoutId) || PAGE_LAYOUTS[0];
    const newSlotCount = layoutDef.slots;

    setPagesData((prev) => {
      const copy = [...prev];
      const curPage = copy[activePageIndex] || { pageNumber: activePageIndex + 1 };
      const currentSlots = curPage.slots || [];

      // Preserve existing photos up to new slot count
      const newSlots = [];
      for (let i = 0; i < newSlotCount; i++) {
        newSlots.push(currentSlots[i] || null);
      }

      copy[activePageIndex] = {
        ...curPage,
        layout: layoutId,
        slots: newSlots,
      };
      return copy;
    });

    setSelectedSlotIndex(null);
  };

  // Place or swap photo in slot
  const handleAssignPhotoToSlot = (photo, slotIndex) => {
    setPagesData((prev) => {
      const copy = [...prev];
      const curPage = copy[activePageIndex];
      const newSlots = [...(curPage.slots || [])];
      newSlots[slotIndex] = photo;
      copy[activePageIndex] = { ...curPage, slots: newSlots };
      return copy;
    });
    setSelectedSlotIndex(null);
  };

  const handleRemovePhotoFromSlot = (slotIndex, e) => {
    if (e) e.stopPropagation();
    setPagesData((prev) => {
      const copy = [...prev];
      const curPage = copy[activePageIndex];
      const newSlots = [...(curPage.slots || [])];
      newSlots[slotIndex] = null;
      copy[activePageIndex] = { ...curPage, slots: newSlots };
      return copy;
    });
  };

  // When clicking a photo from the uploaded tray in Step 2:
  const handleTrayPhotoClick = (photo) => {
    // If a specific slot is selected, assign there
    if (selectedSlotIndex !== null) {
      handleAssignPhotoToSlot(photo, selectedSlotIndex);
      return;
    }
    // Otherwise, assign to the first empty slot on active page
    const slots = activePage.slots || [];
    const firstEmptyIndex = slots.findIndex((s) => s === null);
    if (firstEmptyIndex !== -1) {
      handleAssignPhotoToSlot(photo, firstEmptyIndex);
    } else {
      // If active page is full, offer or assign to slot 0
      handleAssignPhotoToSlot(photo, 0);
      message.info(`Replaced photo in Slot 1 of Page ${activePage.pageNumber}`);
    }
  };

  // Smart Auto-Fill all pages
  const handleAutoFillAllPages = () => {
    if (uploadedPhotos.length === 0) {
      message.warning("Please upload photos first!");
      return;
    }

    const availablePhotos = [...uploadedPhotos];
    let photoIndex = 0;

    const newPages = pagesData.map((pg) => {
      // Distribute photos: if remaining photos > remaining pages, use 2-3 layout
      const remainingPages = photoBookPages - pg.pageNumber + 1;
      const remainingPhotos = availablePhotos.length - photoIndex;
      const ratio = remainingPhotos / remainingPages;

      let chosenLayout = "1-full";
      if (ratio >= 3.5) chosenLayout = "4-grid";
      else if (ratio >= 2.5) chosenLayout = "3-hero";
      else if (ratio >= 1.6) chosenLayout = "2-vertical";
      else chosenLayout = "1-full";

      const layoutDef = PAGE_LAYOUTS.find((l) => l.id === chosenLayout) || PAGE_LAYOUTS[0];
      const slots = [];

      for (let s = 0; s < layoutDef.slots; s++) {
        if (photoIndex < availablePhotos.length) {
          slots.push(availablePhotos[photoIndex]);
          photoIndex++;
        } else {
          // Loop around if needed so no page is left empty
          slots.push(availablePhotos[photoIndex % availablePhotos.length]);
          photoIndex++;
        }
      }

      return {
        ...pg,
        layout: chosenLayout,
        slots,
      };
    });

    setPagesData(newPages);
    message.success("All pages auto-filled with your photos!");
  };

  // ── Step Navigation ────────────────────────────────────────────────────────
  const handleProceedToDesign = () => {
    if (uploadedPhotos.length < minImages) {
      message.error(
        `Please upload at least ${minImages} photos (minimum 1 per page for ${photoBookPages} pages). Currently uploaded: ${uploadedPhotos.length}`,
      );
      return;
    }
    // Auto-fill initial empty pages if they are all empty
    const allEmpty = pagesData.every((pg) => (pg.slots || []).every((s) => s === null));
    if (allEmpty) {
      handleAutoFillAllPages();
    }
    setCurrentStep(2);
  };

  const handleProceedToPreview = () => {
    if (!pagesValidity.isValid) {
      message.error(
        `Page(s) ${pagesValidity.emptyPages.slice(0, 5).join(", ")}${
          pagesValidity.emptyPages.length > 5 ? "..." : ""
        } are empty. Please place at least 1 photo on every page before previewing.`,
      );
      return;
    }
    setPreviewPageIndex(0);
    setCurrentStep(3);
  };

  // ── Step 3: Add to Cart Action ─────────────────────────────────────────────
  const handleConfirmAddToCart = async () => {
    try {
      setIsSubmitting(true);

      // Prepare design package
      const designPayload = {
        template: selectedVariants["Template"] || "",
        edition: selectedVariants["Edition"] || "",
        size: selectedVariants.sizes || selectedVariants.size || "8x8",
        total_pages: photoBookPages,
        total_photos_used: totalPhotosPlaced,
        pages: pagesData.map((p) => ({
          page_number: p.pageNumber,
          layout: p.layout,
          photos: (p.slots || []).map((s) => (s ? { id: s.id, url: s.url, name: s.name } : null)),
        })),
        uploaded_photos: uploadedPhotos.map((p) => ({ id: p.id, url: p.url, name: p.name })),
        cover_image: pagesData[0]?.slots?.[0]?.url || uploadedPhotos[0]?.url || "",
      };

      if (onAddToCartSuccess) {
        await onAddToCartSuccess(designPayload);
      }
      onClose();
    } catch (err) {
      console.error(err);
      message.error("Failed to add photobook to cart");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render Slot Grid for Active Page ───────────────────────────────────────
  const renderPageCanvas = (page, isInteractive = true) => {
    const layout = page?.layout || "1-full";
    const slots = page?.slots || [];

    const getLayoutClasses = () => {
      switch (layout) {
        case "2-vertical":
          return "grid grid-cols-2 gap-2 h-full";
        case "2-horizontal":
          return "grid grid-rows-2 gap-2 h-full";
        case "3-hero":
          return "grid grid-rows-2 gap-2 h-full";
        case "4-grid":
          return "grid grid-cols-2 grid-rows-2 gap-2 h-full";
        case "1-full":
        default:
          return "w-full h-full";
      }
    };

    return (
      <div className={`w-full h-full ${getLayoutClasses()}`}>
        {layout === "3-hero" ? (
          <>
            {/* Top hero photo */}
            <div className="w-full h-full">
              {renderSlot(slots[0], 0, isInteractive)}
            </div>
            {/* Bottom 2 photos */}
            <div className="grid grid-cols-2 gap-2 w-full h-full">
              {renderSlot(slots[1], 1, isInteractive)}
              {renderSlot(slots[2], 2, isInteractive)}
            </div>
          </>
        ) : (
          slots.map((slotPhoto, slotIdx) => (
            <div key={slotIdx} className="w-full h-full">
              {renderSlot(slotPhoto, slotIdx, isInteractive)}
            </div>
          ))
        )}
      </div>
    );
  };

  const renderSlot = (slotPhoto, slotIdx, isInteractive = true) => {
    const isSelected = selectedSlotIndex === slotIdx;

    if (!slotPhoto) {
      return (
        <div
          onClick={() => isInteractive && setSelectedSlotIndex(slotIdx)}
          className={`w-full h-full min-h-[120px] rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
            isSelected
              ? "border-yellow-500 bg-yellow-50/80 ring-2 ring-yellow-400"
              : "border-gray-300 bg-gray-50/60 hover:border-yellow-400 hover:bg-yellow-50/30"
          }`}
        >
          <PlusOutlined className="text-xl text-gray-400 mb-1" />
          <span className="text-xs font-medium text-gray-500">
            {isSelected ? "Select photo below" : `Slot ${slotIdx + 1}`}
          </span>
        </div>
      );
    }

    return (
      <div
        onClick={() => isInteractive && setSelectedSlotIndex(slotIdx)}
        className={`w-full h-full min-h-[120px] rounded-lg overflow-hidden relative group border-2 transition-all ${
          isSelected ? "border-yellow-500 ring-2 ring-yellow-400 shadow-md" : "border-gray-200"
        }`}
      >
        <img
          src={slotPhoto.url}
          alt={slotPhoto.name || "Slot photo"}
          className="w-full h-full object-cover select-none"
        />
        {isInteractive && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={(e) => handleRemovePhotoFromSlot(slotIdx, e)}
              className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs shadow"
              title="Remove photo"
            >
              <DeleteOutlined />
            </button>
            <button
              type="button"
              onClick={() => setSelectedSlotIndex(slotIdx)}
              className="p-1.5 bg-yellow-500 hover:bg-yellow-600 text-black rounded-full text-xs shadow font-bold"
              title="Replace photo"
            >
              <SwapOutlined />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1100}
      centered
      destroyOnClose
      className="photobook-designer-modal"
      bodyStyle={{ padding: 0 }}
      title={null}
      closable={false}
    >
      <div className="flex flex-col h-[90vh] max-h-[820px] bg-white rounded-2xl overflow-hidden font-sans">
        {/* ── Top Header Bar with 3-Step Wizard Progress ───────────────────── */}
        <div className="px-6 py-4 bg-gray-900 text-white flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center text-black font-black text-lg shadow">
              <BookOutlined />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Photo Book Studio
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                <span>{selectedVariants.sizes || selectedVariants.size || "8x8"}</span>
                <span>•</span>
                <span>{selectedVariants["Template"] || "Custom Template"}</span>
                <span>•</span>
                <span className="text-yellow-400 font-semibold">{photoBookPages} Pages</span>
              </div>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Step 1 */}
            <div
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-2 cursor-pointer transition-colors ${
                currentStep === 1
                  ? "text-yellow-400 font-bold"
                  : currentStep > 1
                  ? "text-green-400"
                  : "text-gray-500"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === 1
                    ? "bg-yellow-400 text-black"
                    : currentStep > 1
                    ? "bg-green-500 text-white"
                    : "bg-gray-800 text-gray-400"
                }`}
              >
                {currentStep > 1 ? "✓" : "1"}
              </div>
              <span className="text-xs hidden sm:inline">1. Upload Images</span>
            </div>

            <span className="text-gray-600">→</span>

            {/* Step 2 */}
            <div
              onClick={() => uploadedPhotos.length >= minImages && setCurrentStep(2)}
              className={`flex items-center gap-2 transition-colors ${
                currentStep === 2
                  ? "text-yellow-400 font-bold cursor-pointer"
                  : currentStep > 2
                  ? "text-green-400 cursor-pointer"
                  : uploadedPhotos.length >= minImages
                  ? "text-gray-400 cursor-pointer"
                  : "text-gray-600 cursor-not-allowed"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === 2
                    ? "bg-yellow-400 text-black"
                    : currentStep > 2
                    ? "bg-green-500 text-white"
                    : "bg-gray-800 text-gray-400"
                }`}
              >
                {currentStep > 2 ? "✓" : "2"}
              </div>
              <span className="text-xs hidden sm:inline">2. Design Pages</span>
            </div>

            <span className="text-gray-600">→</span>

            {/* Step 3 */}
            <div
              onClick={() => pagesValidity.isValid && setCurrentStep(3)}
              className={`flex items-center gap-2 transition-colors ${
                currentStep === 3
                  ? "text-yellow-400 font-bold cursor-pointer"
                  : pagesValidity.isValid
                  ? "text-gray-400 cursor-pointer"
                  : "text-gray-600 cursor-not-allowed"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === 3
                    ? "bg-yellow-400 text-black"
                    : "bg-gray-800 text-gray-400"
                }`}
              >
                3
              </div>
              <span className="text-xs hidden sm:inline">3. Preview & Cart</span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors text-lg"
          >
            <CloseOutlined />
          </button>
        </div>

        {/* ── STEP 1: Upload Images ────────────────────────────────────────── */}
        {currentStep === 1 && (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Step 1: Upload Your Photos
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Each page contains 1 to 4 photos. For your <b>{photoBookPages} page</b> photo book,
                  upload between <b>{minImages}</b> and <b>{maxImages}</b> photos.
                </p>
              </div>

              {/* Upload Counter Badge */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-gray-800">
                    {uploadedPhotos.length} / {maxImages} Photos
                  </span>
                  <span className="text-xs text-gray-500">
                    {uploadedPhotos.length < minImages ? (
                      <span className="text-red-500 font-medium">
                        Need {minImages - uploadedPhotos.length} more
                      </span>
                    ) : (
                      <span className="text-green-600 font-medium">✓ Ready to design</span>
                    )}
                  </span>
                </div>
                <Progress
                  type="circle"
                  percent={Math.min(100, Math.round((uploadedPhotos.length / minImages) * 100))}
                  width={42}
                  strokeColor={uploadedPhotos.length >= minImages ? "#10b981" : "#f59e0b"}
                />
              </div>
            </div>

            {/* Upload Dropzone */}
            <div className="mt-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFilesSelected}
                className="hidden"
                id="photobook-bulk-upload"
              />
              <label
                htmlFor="photobook-bulk-upload"
                className="border-2 border-dashed border-gray-300 hover:border-yellow-500 bg-gray-50/70 hover:bg-yellow-50/30 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-xl mb-2">
                  <UploadOutlined />
                </div>
                <h4 className="text-sm font-bold text-gray-800">
                  Click to select photos or drag and drop
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Supports JPG, PNG, WEBP • Select all photos at once (Min: {minImages}, Max: {maxImages})
                </p>
                {isUploading && (
                  <div className="w-full max-w-xs mt-3">
                    <Progress percent={uploadPercent} status="active" strokeColor="#f59e0b" />
                  </div>
                )}
              </label>
            </div>

            {/* Gallery of Uploaded Photos */}
            <div className="flex-1 mt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Uploaded Gallery ({uploadedPhotos.length})
                </span>
                {uploadedPhotos.length > 0 && (
                  <button
                    onClick={() => setUploadedPhotos([])}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {uploadedPhotos.length === 0 ? (
                <div className="h-48 border border-gray-100 rounded-xl bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                  <PictureOutlined className="text-3xl mb-2" />
                  <span className="text-xs">No photos uploaded yet</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[340px] overflow-y-auto pr-1">
                  {uploadedPhotos.map((photo, pIdx) => (
                    <div
                      key={photo.id}
                      className="group relative rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-100 shadow-sm"
                    >
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        title="Delete photo"
                      >
                        <DeleteOutlined />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                        #{pIdx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Action Bar */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
              <Button onClick={onClose}>Cancel</Button>
              <Button
                type="primary"
                size="large"
                disabled={uploadedPhotos.length < minImages || isUploading}
                onClick={handleProceedToDesign}
                className="bg-yellow-400 text-black hover:!bg-yellow-500 font-bold px-8 h-11"
              >
                Proceed to Design Pages ({uploadedPhotos.length}/{minImages} min) →
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Design Pages ─────────────────────────────────────────── */}
        {currentStep === 2 && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Design Toolbar */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-700 uppercase">
                  Page Layout ({activePage.slots?.length || 1} Photo):
                </span>
                <div className="flex items-center gap-2">
                  {PAGE_LAYOUTS.map((layout) => (
                    <Tooltip key={layout.id} title={`${layout.name} - ${layout.description}`}>
                      <button
                        type="button"
                        onClick={() => handleSelectLayout(layout.id)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          activePage.layout === layout.id
                            ? "border-yellow-500 bg-yellow-50 shadow-sm ring-2 ring-yellow-400"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        {layout.icon}
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* Smart auto fill */}
              <div className="flex items-center gap-2">
                <Button
                  size="small"
                  icon={<ThunderboltOutlined />}
                  onClick={handleAutoFillAllPages}
                  className="font-medium text-xs bg-yellow-100 border-yellow-300 text-yellow-800 hover:!bg-yellow-200"
                >
                  Auto-Fill All Pages
                </Button>
                <span className="text-xs text-gray-500 font-medium">
                  {totalPhotosPlaced} slots filled
                </span>
              </div>
            </div>

            {/* Design Workspace: Center Canvas + Page Navigator + Bottom Tray */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left Side: Thumbnail Filmstrip of all pages */}
              <div className="w-full md:w-44 border-r border-gray-200 bg-gray-50/50 p-3 overflow-y-auto flex md:flex-col gap-2 shrink-0">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 hidden md:block">
                  Pages ({photoBookPages})
                </span>
                {pagesData.map((pg, pIdx) => {
                  const hasPhoto = (pg.slots || []).some((s) => Boolean(s));
                  const isCurrent = pIdx === activePageIndex;

                  return (
                    <div
                      key={pIdx}
                      onClick={() => {
                        setActivePageIndex(pIdx);
                        setSelectedSlotIndex(null);
                      }}
                      className={`cursor-pointer rounded-xl p-2 border-2 transition-all flex flex-col items-center shrink-0 w-24 md:w-full ${
                        isCurrent
                          ? "border-yellow-500 bg-yellow-50/60 shadow ring-2 ring-yellow-400/30"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="w-full aspect-[4/3] rounded bg-gray-100 overflow-hidden relative border border-gray-200 mb-1">
                        {pg.slots?.[0]?.url ? (
                          <img
                            src={pg.slots[0].url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                            Empty
                          </div>
                        )}
                        {hasPhoto && (
                          <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px]">
                            ✓
                          </div>
                        )}
                      </div>
                      <span className={`text-[11px] ${isCurrent ? "font-bold text-black" : "text-gray-600"}`}>
                        Page {pg.pageNumber}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Center Canvas Area */}
              <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-100 overflow-auto">
                <div className="w-full max-w-[540px] aspect-[1/1] bg-white rounded-2xl shadow-xl border border-gray-200 p-5 flex flex-col relative">
                  {/* Page header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                    <span className="text-xs font-bold text-gray-700">
                      Page {activePage.pageNumber} of {photoBookPages}
                      {activePage.pageNumber === 1 && " (Cover Page)"}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Layout: {PAGE_LAYOUTS.find((l) => l.id === activePage.layout)?.name}
                    </span>
                  </div>

                  {/* The interactive layout canvas */}
                  <div className="flex-1 overflow-hidden">
                    {renderPageCanvas(activePage, true)}
                  </div>
                </div>

                {/* Page switch arrows */}
                <div className="flex items-center gap-4 mt-3">
                  <Button
                    size="small"
                    icon={<LeftOutlined />}
                    disabled={activePageIndex === 0}
                    onClick={() => {
                      setActivePageIndex((prev) => Math.max(0, prev - 1));
                      setSelectedSlotIndex(null);
                    }}
                  >
                    Previous Page
                  </Button>
                  <span className="text-xs font-bold text-gray-700">
                    Page {activePageIndex + 1} / {photoBookPages}
                  </span>
                  <Button
                    size="small"
                    disabled={activePageIndex === photoBookPages - 1}
                    onClick={() => {
                      setActivePageIndex((prev) => Math.min(photoBookPages - 1, prev + 1));
                      setSelectedSlotIndex(null);
                    }}
                  >
                    Next Page <RightOutlined />
                  </Button>
                </div>
              </div>

              {/* Right Side: Uploaded Photo Tray */}
              <div className="w-full md:w-64 border-l border-gray-200 bg-white p-4 overflow-y-auto shrink-0 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Photo Tray ({uploadedPhotos.length})
                  </span>
                  <span className="text-[11px] text-gray-400">Click to place</span>
                </div>

                <div className="grid grid-cols-3 gap-2 overflow-y-auto flex-1 pr-1">
                  {uploadedPhotos.map((photo) => {
                    const usage = photoUsageCount[photo.id] || 0;
                    return (
                      <div
                        key={photo.id}
                        onClick={() => handleTrayPhotoClick(photo)}
                        className={`group relative rounded-lg overflow-hidden border-2 aspect-square cursor-pointer transition-all hover:scale-105 ${
                          usage > 0 ? "border-green-400 bg-green-50/20" : "border-gray-200 bg-gray-50 hover:border-yellow-400"
                        }`}
                        title="Click to place into current page"
                      >
                        <img
                          src={photo.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        {usage > 0 && (
                          <div className="absolute top-1 right-1 bg-green-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow">
                            {usage}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="px-6 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
              <Button onClick={() => setCurrentStep(1)}>
                ← Back to Upload
              </Button>
              <div className="flex items-center gap-3">
                {!pagesValidity.isValid && (
                  <span className="text-xs text-red-500 font-medium">
                    ⚠️ {pagesValidity.emptyPages.length} page(s) still empty
                  </span>
                )}
                <Button
                  type="primary"
                  size="large"
                  onClick={handleProceedToPreview}
                  disabled={!pagesValidity.isValid}
                  className="bg-yellow-400 text-black hover:!bg-yellow-500 font-bold px-8"
                >
                  Proceed to Preview Book →
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Preview and Add to Cart ──────────────────────────────── */}
        {currentStep === 3 && (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-gray-50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Step 3: Preview Your Photo Book
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Review your designed pages before adding your customized photo book to cart.
                </p>
              </div>

              {/* Book Summary Card */}
              <div className="flex items-center gap-4 bg-white border border-gray-200 px-4 py-2.5 rounded-xl shadow-sm">
                <div>
                  <span className="text-[11px] text-gray-500 block">Total Pages</span>
                  <span className="text-sm font-bold text-gray-900">{photoBookPages} Pages</span>
                </div>
                <div className="h-6 w-px bg-gray-200" />
                <div>
                  <span className="text-[11px] text-gray-500 block">Photos Placed</span>
                  <span className="text-sm font-bold text-gray-900">{totalPhotosPlaced} Photos</span>
                </div>
                <div className="h-6 w-px bg-gray-200" />
                <div>
                  <span className="text-[11px] text-gray-500 block">Final Deal Price</span>
                  <span className="text-base font-extrabold text-green-600">
                    ₹{parseFloat(finalPrice || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Book Reader Preview */}
            <div className="flex-1 flex flex-col items-center justify-center my-4">
              <div className="w-full max-w-xl aspect-[1/1] bg-white rounded-2xl shadow-2xl border-4 border-gray-800 p-6 flex flex-col relative">
                {/* Book Spine Simulation */}
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-gray-300 to-transparent opacity-60 rounded-l-xl pointer-events-none" />

                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    {previewPageIndex === 0
                      ? "Front Cover"
                      : `Page ${previewPageIndex + 1} of ${photoBookPages}`}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    {selectedVariants.sizes || selectedVariants.size || "8x8"}
                  </span>
                </div>

                <div className="flex-1 overflow-hidden">
                  {renderPageCanvas(pagesData[previewPageIndex], false)}
                </div>
              </div>

              {/* Book pagination arrows */}
              <div className="flex items-center gap-4 mt-4">
                <Button
                  shape="circle"
                  icon={<LeftOutlined />}
                  disabled={previewPageIndex === 0}
                  onClick={() => setPreviewPageIndex((p) => Math.max(0, p - 1))}
                />
                <span className="text-xs font-bold text-gray-700 min-w-28 text-center">
                  Page {previewPageIndex + 1} of {photoBookPages}
                </span>
                <Button
                  shape="circle"
                  icon={<RightOutlined />}
                  disabled={previewPageIndex === photoBookPages - 1}
                  onClick={() => setPreviewPageIndex((p) => Math.min(photoBookPages - 1, p + 1))}
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-gray-200 flex items-center justify-between mt-auto bg-white -mx-6 -mb-6 p-6">
              <Button onClick={() => setCurrentStep(2)} size="large">
                ← Back to Edit Pages
              </Button>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <span className="text-xs text-gray-500 block">Total Inclusive of GST</span>
                  <span className="text-lg font-bold text-gray-900">
                    ₹{parseFloat(finalPrice || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <Button
                  type="primary"
                  size="large"
                  icon={<ShoppingCartOutlined />}
                  loading={isSubmitting}
                  onClick={handleConfirmAddToCart}
                  className="bg-yellow-400 text-black hover:!bg-yellow-500 font-extrabold h-12 px-8 text-base shadow-lg"
                >
                  Confirm & Add To Cart
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PhotoBookDesignerModal;
