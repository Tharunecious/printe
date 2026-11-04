import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Button,
  Tag,
  Select,
  InputNumber,
  Progress,
  Tooltip,
  Alert,
  Spin,
  Divider,
  message,
  Popconfirm,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  CheckCircleFilled,
  ExclamationCircleFilled,
  ShoppingCartOutlined,
  BookOutlined,
  ThunderboltOutlined,
  PictureOutlined,
  SaveOutlined,
  LoadingOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import _ from "lodash";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { EnvHelper } from "../../helper/EnvHelper";
import {
  savePhotoBookDesign,
  getPhotoBookTemplates,
  addToShoppingCart,
} from "../../helper/api_helper";
import { ADD_TO_CART } from "../../redux/slices/cart.slice";

const UPLOAD_URL = `${EnvHelper.BASE_API_URL}/upload_images`;

export const LAYOUT_PRESETS = [
  { id: "1-full", name: "1 Photo", slots: 1, desc: "Full Hero" },
  { id: "2-vertical", name: "2 Photos", slots: 2, desc: "Side by Side" },
  { id: "2-horizontal", name: "2 Photos", slots: 2, desc: "Stacked" },
  { id: "3-hero", name: "3 Photos", slots: 3, desc: "1 Hero + 2 Split" },
  { id: "4-grid", name: "4 Photos", slots: 4, desc: "2x2 Grid" },
];

export const PhotoBookCustomizer = ({
  productData,
  design,
  setDesign,
  activePageIndex,
  setActivePageIndex,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.authSlice?.user);

  const fileInputRef = useRef(null);

  // ── Config from backend product ───────────────────────────────────────────
  const pbConfig = useMemo(() => {
    return (
      productData?.photobook_config || {
        min_pages: 10,
        max_pages: 60,
        default_pages: 20,
        supported_sizes: ["8x8", "10x10", "12x12"],
        price_per_extra_page: 15,
      }
    );
  }, [productData]);

  const minPages = pbConfig.min_pages || 10;
  const maxPages = pbConfig.max_pages || 60;
  const defaultPages = pbConfig.default_pages || 20;
  const pricePerExtraPage = Number(pbConfig.price_per_extra_page || 15);

  // Available Sizes
  const supportedSizes = useMemo(() => {
    if (pbConfig.supported_sizes && pbConfig.supported_sizes.length > 0) {
      return pbConfig.supported_sizes;
    }
    const sizeVar = (productData?.variants || []).find(
      (v) => (v.variant_name || "").toLowerCase() === "size" || (v.variant_name || "").toLowerCase() === "sizes"
    );
    if (sizeVar?.options?.length > 0) {
      return sizeVar.options.map((o) => o.value);
    }
    return ["8x8", "10x10", "12x12"];
  }, [pbConfig, productData]);

  // Available Variants / Paper
  const availableVariants = useMemo(() => {
    const paperVar = (productData?.variants || []).find(
      (v) =>
        (v.variant_name || "").toLowerCase() === "edition" ||
        (v.variant_name || "").toLowerCase() === "paper quality" ||
        (v.variant_name || "").toLowerCase() === "paper"
    );
    if (paperVar?.options?.length > 0) {
      return paperVar.options.map((o) => o.value);
    }
    return ["Standard Matte", "Premium Glossy", "Silk Finish"];
  }, [productData]);

  // ── Available Templates from backend ──────────────────────────────────────
  const [templatesList, setTemplatesList] = useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoadingTemplates(true);
        const res = await getPhotoBookTemplates();
        const tpls = res.data?.data || res.data || [];
        setTemplatesList(tpls);
      } catch (err) {
        console.warn("Could not fetch remote templates:", err.message);
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, []);

  // ── Upload State ──────────────────────────────────────────────────────────
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);

  // ── Auto-save & Cart State ────────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);

  // ── Derived pricing ───────────────────────────────────────────────────────
  const basePrice = useMemo(() => {
    return Number(productData?.customer_product_price || productData?.price || 499);
  }, [productData]);

  const pageCount = design?.page_count || defaultPages;
  const extraPages = Math.max(0, pageCount - defaultPages);
  const extraPagesCost = extraPages * pricePerExtraPage;
  const totalPrice = basePrice + extraPagesCost;

  // ── Helper: Get / Generate Guest ID ───────────────────────────────────────
  const getGuestId = useCallback(() => {
    let gid = localStorage.getItem("guestId");
    if (!gid) {
      gid = "guest_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("guestId", gid);
    }
    return gid;
  }, []);

  // ── Photo Upload Handler ──────────────────────────────────────────────────
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter((file) => {
      const isImg = file.type.startsWith("image/");
      const isLt15M = file.size / 1024 / 1024 < 15;
      if (!isImg) toast.error(`${file.name} is not a valid image format.`);
      if (!isLt15M) toast.error(`${file.name} exceeds 15MB file limit.`);
      return isImg && isLt15M;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    setUploadPercent(0);

    const uploadedNewPhotos = [];
    let completedCount = 0;

    for (const file of validFiles) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await axios.post(UPLOAD_URL, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (prog) => {
            const filePercent = Math.round((prog.loaded * 100) / prog.total);
            const totalPercent = Math.round(
              ((completedCount + filePercent / 100) / validFiles.length) * 100
            );
            setUploadPercent(totalPercent);
          },
        });

        const url = response.data?.data?.url || response.data?.url;
        const fileName = response.data?.data?.fileName || response.data?.fileName || file.name;

        if (url) {
          uploadedNewPhotos.push({
            url,
            fileName,
            uploaded_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err);
        toast.error(`Upload failed for ${file.name}`);
      }
      completedCount++;
    }

    setIsUploading(false);
    setUploadPercent(100);

    if (uploadedNewPhotos.length > 0) {
      toast.success(`${uploadedNewPhotos.length} photo(s) uploaded successfully!`);
      setDesign((prev) => ({
        ...prev,
        uploaded_images: [...(prev.uploaded_images || []), ...uploadedNewPhotos],
      }));
    }
  };

  // Remove uploaded photo
  const handleRemoveUploadedPhoto = (urlToRemove) => {
    setDesign((prev) => {
      const updatedImages = (prev.uploaded_images || []).filter((img) => img.url !== urlToRemove);
      // Also unplace from frames
      const updatedPages = (prev.pages || []).map((page) => ({
        ...page,
        photo_frames: (page.photo_frames || []).map((frame) =>
          frame.photo_url === urlToRemove ? { ...frame, photo_url: "", photo_name: "" } : frame
        ),
      }));
      return {
        ...prev,
        uploaded_images: updatedImages,
        pages: updatedPages,
      };
    });
  };

  // ── Frame assignment ──────────────────────────────────────────────────────
  const handleAssignPhotoToActivePage = (photoUrl, photoName = "") => {
    setDesign((prev) => {
      const pages = [...(prev.pages || [])];
      const page = pages[activePageIndex];
      if (!page) return prev;

      // Find first empty frame or replace first frame
      const frames = [...(page.photo_frames || [])];
      let targetIndex = frames.findIndex((f) => !f.photo_url);
      if (targetIndex === -1) targetIndex = 0; // replace first

      if (frames[targetIndex]) {
        frames[targetIndex] = {
          ...frames[targetIndex],
          photo_url: photoUrl,
          photo_name: photoName,
        };
      }

      pages[activePageIndex] = { ...page, photo_frames: frames };
      return { ...prev, pages };
    });
    message.success("Photo placed into page!");
  };

  // ── Change Page Layout ────────────────────────────────────────────────────
  const handleChangePageLayout = (layoutId) => {
    const preset = LAYOUT_PRESETS.find((p) => p.id === layoutId) || LAYOUT_PRESETS[0];
    setDesign((prev) => {
      const pages = [...(prev.pages || [])];
      const page = pages[activePageIndex];
      if (!page) return prev;

      // Retain existing photos up to new slot count
      const existingPhotos = (page.photo_frames || []).map((f) => f.photo_url).filter(Boolean);
      const newFrames = Array.from({ length: preset.slots }, (_, i) => ({
        frame_id: `frame_${page.page_number}_${i + 1}`,
        shape: "rectangle",
        fit_mode: "cover",
        is_required: true,
        photo_url: existingPhotos[i] || "",
        crop: { zoom: 1, offsetX: 0, offsetY: 0 },
        rotation: 0,
      }));

      pages[activePageIndex] = {
        ...page,
        layout_id: layoutId,
        photo_frames: newFrames,
      };
      return { ...prev, pages };
    });
  };

  // ── Auto-Fill All Pages ───────────────────────────────────────────────────
  const handleAutoFillAll = () => {
    const photos = design?.uploaded_images || [];
    if (photos.length === 0) {
      toast.error("Please upload photos first before auto-filling!");
      return;
    }

    setDesign((prev) => {
      let photoIdx = 0;
      const updatedPages = (prev.pages || []).map((page) => {
        const frames = (page.photo_frames || []).map((frame) => {
          if (!frame.photo_url && photoIdx < photos.length) {
            const photo = photos[photoIdx++];
            return {
              ...frame,
              photo_url: photo.url,
              photo_name: photo.fileName,
            };
          }
          return frame;
        });
        return { ...page, photo_frames: frames };
      });

      return { ...prev, pages: updatedPages };
    });

    toast.success("Auto-filled empty photo frames across your pages!");
  };

  // ── Calculate validation checklist ────────────────────────────────────────
  const validationSummary = useMemo(() => {
    const photosCount = design?.uploaded_images?.length || 0;
    const pages = design?.pages || [];

    const hasMinPhotos = photosCount >= Math.max(1, Math.floor(pageCount / 2));
    const coverPage = pages.find((p) => p.page_type === "front_cover") || pages[0];
    const isCoverComplete = Boolean(coverPage?.photo_frames?.some((f) => Boolean(f.photo_url)));

    const interiorPages = pages.filter((p) => p.page_type === "interior");
    const incompleteInteriors = interiorPages.filter(
      (p) => !p.photo_frames?.some((f) => Boolean(f.photo_url))
    );
    const completedInteriorsCount = interiorPages.length - incompleteInteriors.length;

    const backCover = pages.find((p) => p.page_type === "back_cover");
    const isBackCoverComplete = backCover ? backCover.photo_frames?.some((f) => Boolean(f.photo_url)) : true;

    const allPagesComplete =
      hasMinPhotos &&
      isCoverComplete &&
      incompleteInteriors.length === 0 &&
      isBackCoverComplete;

    return {
      photosCount,
      hasMinPhotos,
      isCoverComplete,
      totalInteriors: interiorPages.length,
      completedInteriorsCount,
      incompleteInteriorsCount: incompleteInteriors.length,
      isBackCoverComplete,
      allPagesComplete,
    };
  }, [design, pageCount]);

  // ── Save Design to Backend ────────────────────────────────────────────────
  const saveDesignToBackend = useCallback(async () => {
    if (!productData?._id) return null;
    try {
      setIsSaving(true);
      const guestId = !user ? getGuestId() : null;

      const payload = {
        design_id: design?._id || design?.design_id,
        product_id: productData._id,
        guest_id: guestId,
        size: design?.size || supportedSizes[0] || "8x8",
        variant: design?.variant || availableVariants[0] || "Standard Matte",
        page_count: pageCount,
        template_id: design?.template_id || "vintage-wedding-book",
        template_name: design?.template_name || "Custom Book",
        template_version: 1,
        uploaded_images: design?.uploaded_images || [],
        pages: design?.pages || [],
        front_cover: design?.pages?.find((p) => p.page_type === "front_cover") || null,
        back_cover: design?.pages?.find((p) => p.page_type === "back_cover") || null,
        cover_image:
          design?.pages?.find((p) => p.page_type === "front_cover")?.photo_frames?.[0]?.photo_url ||
          design?.uploaded_images?.[0]?.url ||
          "",
      };

      const res = await savePhotoBookDesign(payload);
      const savedData = res.data?.data || res.data;
      if (savedData?.design_id || savedData?._id) {
        setDesign((prev) => ({
          ...prev,
          _id: savedData.design_id || savedData._id,
          status: savedData.status,
          is_complete: savedData.is_complete,
          validation_errors: savedData.validation_errors,
        }));
        setLastSavedTime(new Date().toLocaleTimeString());
      }
      return savedData;
    } catch (err) {
      console.error("Failed to save design:", err);
      toast.error("Failed to save design draft");
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [productData?._id, user, getGuestId, design, supportedSizes, availableVariants, pageCount, setDesign]);

  // Auto-save on page changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (design?.uploaded_images?.length > 0 || design?.pages?.length > 0) {
        saveDesignToBackend();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [design?.pages, design?.size, design?.variant, design?.page_count]);

  // ── Add To Cart Handler ───────────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!validationSummary.allPagesComplete) {
      const pages = design?.pages || [];
      const coverPage = pages.find((p) => p.page_type === "front_cover") || pages[0];
      const interiorPages = pages.filter((p) => p.page_type === "interior");
      const incompleteInteriors = interiorPages.filter(
        (p) => !p.photo_frames?.some((f) => Boolean(f.photo_url))
      );
      const backCover = pages.find((p) => p.page_type === "back_cover");

      let firstMissingLabel = "This page";
      if (!coverPage?.photo_frames?.some((f) => Boolean(f.photo_url))) {
        firstMissingLabel = "Front Cover";
      } else if (incompleteInteriors.length > 0) {
        const firstIncomp = incompleteInteriors[0];
        firstMissingLabel = firstIncomp.page_number ? `Page ${firstIncomp.page_number}` : "Page 1";
      } else if (backCover && !backCover.photo_frames?.some((f) => Boolean(f.photo_url))) {
        firstMissingLabel = "Back Cover";
      }

      toast.dismiss();
      toast.error(`${firstMissingLabel} has no image.`, {
        duration: 4000,
        id: "empty-page-photo-notice",
      });
      return;
    }

    try {
      setIsAddingToCart(true);

      // Force immediate server save and validation check
      const saved = await saveDesignToBackend();
      const designId = saved?.design_id || saved?._id || design?._id;

      if (!designId) {
        toast.error("Could not obtain saved design ID. Please try saving again.");
        return;
      }

      const guestId = !user ? getGuestId() : undefined;

      const cartPayload = {
        product_id: productData._id,
        product_name: productData.name,
        product_image: saved?.design?.cover_image || design?.cover_image || productData.images?.[0] || "",
        product_design_file: saved?.design?.cover_image || design?.cover_image || "",
        product_price: totalPrice,
        final_total: totalPrice,
        final_total_withoutGst: totalPrice,
        product_quantity: 1,
        quantity: 1,
        is_photobook: true,
        photobook_design_id: designId,
        size: design?.size || "8x8",
        color: design?.variant || "Standard",
        guestId,
      };

      const result = await addToShoppingCart(cartPayload);
      dispatch(ADD_TO_CART(_.get(result, "data.data.data", "")));

      Swal.fire({
        title: "Photo Book Added To Cart!",
        text: `Your ${pageCount}-page custom photo book has been saved and added to cart.`,
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Go to Cart",
        cancelButtonText: "Stay on Page",
        confirmButtonColor: "#f59e0b",
      }).then((res) => {
        if (res.isConfirmed) {
          navigate("/cart");
        }
      });
    } catch (err) {
      console.error("Add to cart failed:", err);
      const errMsg = err?.response?.data?.message || err.message || "Failed to add to cart";
      toast.error(errMsg);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Determine button state according to table rules
  const isButtonDisabled =
    validationSummary.photosCount === 0 ||
    isUploading ||
    isSaving ||
    !validationSummary.allPagesComplete;

  return (
    <div className="w-full space-y-5 font-primary">
      {/* ── Title & Price Header ─────────────────────────────────────────── */}
      <div className="border-b border-gray-200 pb-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
          {productData?.name || "Custom Photo Book"}
        </h1>
        <div className="mt-2 flex flex-wrap items-baseline gap-3">
          <span className="text-2xl md:text-3xl font-extrabold text-gray-900">
            ₹{totalPrice.toLocaleString("en-IN")}
          </span>
          {extraPagesCost > 0 && (
            <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Includes base ₹{basePrice} + {extraPages} extra pages (₹{extraPagesCost})
            </span>
          )}
        </div>
      </div>

      {/* ── STEP 1: Product Options ──────────────────────────────────────── */}
      <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
            <BookOutlined /> 1. Configure Options
          </span>
          <span className="text-xs text-gray-500">
            {lastSavedTime ? `Auto-saved at ${lastSavedTime}` : isSaving ? "Saving..." : ""}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Size */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Book Size</label>
            <Select
              className="w-full"
              value={design?.size || supportedSizes[0]}
              onChange={(val) => setDesign((prev) => ({ ...prev, size: val }))}
              options={supportedSizes.map((s) => ({ label: `${s} inches`, value: s }))}
            />
          </div>

          {/* Paper / Edition Variant */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Paper & Finish</label>
            <Select
              className="w-full"
              value={design?.variant || availableVariants[0]}
              onChange={(val) => setDesign((prev) => ({ ...prev, variant: val }))}
              options={availableVariants.map((v) => ({ label: v, value: v }))}
            />
          </div>

          {/* Page Count */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Number of Pages ({minPages} - {maxPages})
            </label>
            <InputNumber
              min={minPages}
              max={maxPages}
              step={2}
              value={pageCount}
              className="w-full"
              onChange={(val) => {
                const count = Math.max(minPages, Math.min(maxPages, Number(val) || minPages));
                setDesign((prev) => {
                  const existingPages = prev.pages || [];
                  let updated = [...existingPages];
                  if (count > existingPages.length) {
                    // Add pages
                    for (let p = existingPages.length + 1; p <= count; p++) {
                      updated.push({
                        page_number: p,
                        page_type: p === count ? "back_cover" : "interior",
                        layout_id: "1-full",
                        photo_frames: [
                          {
                            frame_id: `frame_${p}_1`,
                            shape: "rectangle",
                            fit_mode: "cover",
                            is_required: true,
                            photo_url: "",
                            crop: { zoom: 1, offsetX: 0, offsetY: 0 },
                          },
                        ],
                      });
                    }
                  } else if (count < existingPages.length) {
                    updated = updated.slice(0, count);
                  }
                  return { ...prev, page_count: count, pages: updated };
                });
              }}
            />
          </div>

          {/* Template */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Theme Template</label>
            <Select
              className="w-full"
              value={design?.template_id || (templatesList[0]?.template_id || "vintage-wedding-book")}
              loading={isLoadingTemplates}
              onChange={(val) => {
                const selected = templatesList.find((t) => t.template_id === val);
                setDesign((prev) => ({
                  ...prev,
                  template_id: val,
                  template_name: selected?.template_name || val,
                }));
              }}
              options={
                templatesList.length > 0
                  ? templatesList.map((t) => ({
                      label: `${t.template_name} (${t.category})`,
                      value: t.template_id,
                    }))
                  : [
                      { label: "Vintage Wedding Book", value: "vintage-wedding-book" },
                      { label: "Modern Minimalist", value: "modern-minimalist" },
                      { label: "Family Holiday", value: "family-holiday" },
                    ]
              }
            />
          </div>
        </div>
      </div>

      {/* ── STEP 2: Photo Uploader & Tray ────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
            <PictureOutlined className="text-amber-500" /> 2. Upload Photos ({validationSummary.photosCount} Uploaded)
          </span>
          <span className="text-[11px] text-gray-500">Min {Math.max(1, Math.floor(pageCount / 2))} required</span>
        </div>

        {/* Dropzone */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50/70 p-4 rounded-xl cursor-pointer text-center transition-all duration-200 flex flex-col items-center justify-center space-y-1"
        >
          <UploadOutlined className="text-2xl text-amber-600 mb-1" />
          <p className="text-xs font-bold text-gray-800">
            Click to Browse or Drag & Drop Multiple Photos
          </p>
          <p className="text-[10px] text-gray-500">
            Supports JPEG, PNG, WebP up to 15MB each
          </p>
        </div>

        {isUploading && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Uploading to cloud...</span>
              <span>{uploadPercent}%</span>
            </div>
            <Progress percent={uploadPercent} status="active" strokeColor="#f59e0b" />
          </div>
        )}

        {/* Uploaded Photos Filmstrip */}
        {design?.uploaded_images?.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] text-gray-600">
              <span>Your Photo Tray (Click photo to place onto current page):</span>
              <Button
                type="link"
                size="small"
                icon={<ThunderboltOutlined />}
                className="!p-0 !text-amber-600 font-bold"
                onClick={handleAutoFillAll}
              >
                Auto-Fill All Pages
              </Button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {design.uploaded_images.map((img, i) => (
                <div
                  key={img.url || i}
                  onClick={() => handleAssignPhotoToActivePage(img.url, img.fileName)}
                  className="relative group flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-amber-500 hover:scale-105 transition-all shadow-xs"
                >
                  <img src={img.url} alt="Uploaded" className="w-full h-full object-cover" />
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveUploadedPhoto(img.url);
                    }}
                    className="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-bl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  >
                    <DeleteOutlined className="text-[10px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── STEP 3: Page Layout & Placement ──────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
            <BookOutlined className="text-amber-500" /> 3. Layout for Page {activePageIndex + 1}
          </span>
          <span className="text-xs text-amber-700 font-medium">
            {design?.pages?.[activePageIndex]?.layout_id || "1-full"}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {LAYOUT_PRESETS.map((p) => {
            const isCur = (design?.pages?.[activePageIndex]?.layout_id || "1-full") === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleChangePageLayout(p.id)}
                className={`p-2 rounded-lg border text-center transition-all ${
                  isCur
                    ? "border-amber-500 bg-amber-50 text-amber-900 font-bold ring-1 ring-amber-400"
                    : "border-gray-200 hover:border-gray-300 text-gray-600 bg-white"
                }`}
              >
                <div className="text-xs">{p.name}</div>
                <div className="text-[9px] text-gray-400">{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── STEP 4: Validation Checklist & Status ─────────────────────────── */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-gray-700">Design Completion Checklist</span>
          {validationSummary.allPagesComplete ? (
            <Tag color="success" className="font-semibold !rounded-full">
              ✓ Ready for Cart
            </Tag>
          ) : (
            <Tag color="warning" className="font-semibold !rounded-full">
              Action Required
            </Tag>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-gray-700">
            {validationSummary.hasMinPhotos ? (
              <CheckCircleFilled className="text-green-500" />
            ) : (
              <ExclamationCircleFilled className="text-amber-500" />
            )}
            <span>Photos uploaded ({validationSummary.photosCount})</span>
          </div>

          <div className="flex items-center gap-1.5 text-gray-700">
            {validationSummary.isCoverComplete ? (
              <CheckCircleFilled className="text-green-500" />
            ) : (
              <ExclamationCircleFilled className="text-amber-500" />
            )}
            <span>Cover page complete</span>
          </div>

          <div className="flex items-center gap-1.5 text-gray-700">
            {validationSummary.incompleteInteriorsCount === 0 ? (
              <CheckCircleFilled className="text-green-500" />
            ) : (
              <ExclamationCircleFilled className="text-amber-500" />
            )}
            <span>
              Interiors ({validationSummary.completedInteriorsCount}/{validationSummary.totalInteriors})
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-gray-700">
            {validationSummary.isBackCoverComplete ? (
              <CheckCircleFilled className="text-green-500" />
            ) : (
              <ExclamationCircleFilled className="text-amber-500" />
            )}
            <span>Back cover complete</span>
          </div>
        </div>

        {!validationSummary.allPagesComplete && (
          <p className="text-[11px] text-amber-800 bg-amber-100/60 p-2 rounded border border-amber-200">
            ⚠️ Please fill required photo frames across all pages before adding to cart. You can click <strong>"Auto-Fill All Pages"</strong> above to instantly populate them.
          </p>
        )}
      </div>

      {/* ── STEP 5: Add To Cart Button ───────────────────────────────────── */}
      <div className="pt-2">
        <Button
          type="primary"
          size="large"
          icon={isAddingToCart ? <LoadingOutlined /> : <ShoppingCartOutlined />}
          disabled={isButtonDisabled}
          loading={isAddingToCart}
          onClick={handleAddToCart}
          className={`w-full !h-14 text-base font-bold rounded-xl shadow-md transition-all ${
            isButtonDisabled
              ? "!bg-gray-300 !text-gray-500 border-none cursor-not-allowed"
              : "!bg-yellow-400 hover:!bg-yellow-500 !text-gray-950 hover:!text-black border-none"
          }`}
        >
          {isAddingToCart
            ? "Adding to Cart..."
            : validationSummary.allPagesComplete
            ? `Add Custom Photo Book To Cart (₹${totalPrice.toLocaleString("en-IN")})`
            : "Complete All Pages to Add to Cart"}
        </Button>

        {validationSummary.allPagesComplete && (
          <p className="text-center text-xs text-green-700 mt-2 font-medium flex items-center justify-center gap-1">
            <CheckCircleFilled /> Your Photo Book design is validated and ready for printing.
          </p>
        )}
      </div>
    </div>
  );
};

export default PhotoBookCustomizer;
