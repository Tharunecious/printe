import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Button,
  Tag,
  Tooltip,
  Input,
  Spin,
  Modal,
  Drawer,
  Form,
  Rate,
  Divider,
} from "antd";
import {
  ShoppingCartOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  MinusOutlined,
  ShareAltOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  RocketOutlined,
  EnvironmentOutlined,
  CheckOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import {
  FaTruckFast,
  FaWhatsapp,
  FaFacebook,
  FaRegCopy,
  FaBookOpen,
  FaLayerGroup,
} from "react-icons/fa6";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import _ from "lodash";

import { addToShoppingCart, getGuestId } from "../../helper/api_helper";
import { ADD_TO_CART } from "../../redux/slices/cart.slice";

const PhotoBookDetails = ({
  data = {},
  selectedSize: externalSize = null,
  onSizeChange,
  selectedVariant: externalVariant = {},
  onVariantChange,
  selectedPages: externalPages = 26,
  onPagesChange,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.authSlice || {});

  // ── Config resolution ────────────────────────────────────────────────────────
  const photobookConfig = useMemo(() => data?.photobook_config || {}, [data]);

  const defaultPages = Number(photobookConfig.default_pages || 26);
  const minPages = Number(photobookConfig.min_pages || 10);
  const maxPages = Number(photobookConfig.max_pages || 60);
  const pageIncrement = Number(photobookConfig.page_increment || 2);
  const pricePerExtraPage = Number(photobookConfig.price_per_extra_page || 15);

  // Available Sizes
  const availableSizes = useMemo(() => {
    const cfgSizes = photobookConfig.sizes;
    if (Array.isArray(cfgSizes) && cfgSizes.length > 0) {
      return cfgSizes.filter((s) => s.is_available !== false);
    }
    const supported = photobookConfig.supported_sizes || [];
    if (supported.length > 0) {
      return supported.map((name, idx) => {
        const parts = name.split("x").map(Number);
        const w = parts[0] || 8;
        const h = parts[1] || 8;
        return {
          _id: `size-${idx}`,
          name,
          width_in: w,
          height_in: h,
          width_cm: Number((w * 2.54).toFixed(2)),
          height_cm: Number((h * 2.54).toFixed(2)),
          is_available: true,
        };
      });
    }
    return [
      {
        _id: "size-0",
        name: "8x8",
        width_in: 8,
        height_in: 8,
        width_cm: 20.32,
        height_cm: 20.32,
        is_available: true,
      },
      {
        _id: "size-1",
        name: "10x10",
        width_in: 10,
        height_in: 10,
        width_cm: 25.4,
        height_cm: 25.4,
        is_available: true,
      },
      {
        _id: "size-2",
        name: "12x12",
        width_in: 12,
        height_in: 12,
        width_cm: 30.48,
        height_cm: 30.48,
        is_available: true,
      },
    ];
  }, [photobookConfig]);

  // Dynamic variants from photobook_config.variants
  const configVariants = useMemo(() => {
    return photobookConfig.variants || [];
  }, [photobookConfig]);

  // ── Local selection states ──────────────────────────────────────────────────
  const [currentSize, setCurrentSize] = useState(() => {
    if (externalSize) return externalSize;
    return availableSizes[0] || null;
  });

  const [currentPages, setCurrentPages] = useState(
    externalPages || defaultPages,
  );

  const [selectedVariantsState, setSelectedVariantsState] = useState(() => {
    if (externalVariant && Object.keys(externalVariant).length > 0) {
      return externalVariant;
    }
    const initial = {};
    configVariants.forEach((v) => {
      if (v.values && v.values.length > 0) {
        initial[v.title] = v.values[0];
      }
    });
    return initial;
  });

  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [designerModalOpen, setDesignerModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync size when externalSize changes
  useEffect(() => {
    if (externalSize) setCurrentSize(externalSize);
  }, [externalSize]);

  // Sync pages when externalPages changes
  useEffect(() => {
    if (externalPages) setCurrentPages(externalPages);
  }, [externalPages]);

  // Ensure default size is notified to parent on initial mount
  useEffect(() => {
    if (currentSize && onSizeChange) {
      onSizeChange(currentSize);
    }
  }, []);

  // Ensure default variants are notified to parent on mount
  useEffect(() => {
    if (onVariantChange) {
      onVariantChange(selectedVariantsState);
    }
  }, []);

  // ── Size change handler ─────────────────────────────────────────────────────
  const handleSelectSize = (sz) => {
    setCurrentSize(sz);
    if (onSizeChange) onSizeChange(sz);
  };

  // ── Variant option change handler ───────────────────────────────────────────
  const handleSelectVariantOption = (title, val) => {
    const updated = { ...selectedVariantsState, [title]: val };
    setSelectedVariantsState(updated);
    if (onVariantChange) onVariantChange(updated);
  };

  // ── Pages change handler ────────────────────────────────────────────────────
  const handlePagesChange = (newCount) => {
    const clamped = Math.max(minPages, Math.min(maxPages, newCount));
    setCurrentPages(clamped);
    if (onPagesChange) onPagesChange(clamped);
  };

  // ── Matching variant price lookup ───────────────────────────────────────────
  const matchedVariantPrice = useMemo(() => {
    if (!currentSize || !Array.isArray(data.variants_price)) return null;
    return (
      data.variants_price.find(
        (vp) =>
          (vp.sizes &&
            String(vp.sizes).trim().toLowerCase() ===
              String(currentSize.name).trim().toLowerCase()) ||
          (vp.key &&
            String(vp.key).trim().toLowerCase() ===
              String(currentSize.name).trim().toLowerCase()),
      ) || null
    );
  }, [currentSize, data.variants_price]);

  // Role-based base price
  const baseUnitPrice = useMemo(() => {
    const role = user?.role;
    if (matchedVariantPrice) {
      if (role === "Dealer")
        return Number(
          matchedVariantPrice.Deler_product_price ||
            matchedVariantPrice.customer_product_price ||
            0,
        );
      if (role === "Corporate")
        return Number(
          matchedVariantPrice.corporate_product_price ||
            matchedVariantPrice.customer_product_price ||
            0,
        );
      if (role === "bni_user") {
        const d = Number(matchedVariantPrice.Deler_product_price || 0);
        const c = Number(matchedVariantPrice.customer_product_price || 0);
        return c - Math.abs((c - d) / 2);
      }
      return Number(
        matchedVariantPrice.customer_product_price ||
          matchedVariantPrice.MRP_price ||
          0,
      );
    }
    // Fallback to product-level prices
    if (role === "Dealer")
      return Number(
        data.Deler_product_price ||
          data.single_product_price ||
          data.customer_product_price ||
          0,
      );
    if (role === "Corporate")
      return Number(
        data.corporate_product_price ||
          data.single_product_price ||
          data.customer_product_price ||
          0,
      );
    if (role === "bni_user") {
      const d = Number(data.Deler_product_price || 0);
      const c = Number(data.customer_product_price || 0);
      return c - Math.abs((c - d) / 2);
    }
    return Number(
      data.customer_product_price ||
        data.single_product_price ||
        data.MRP_price ||
        0,
    );
  }, [user?.role, matchedVariantPrice, data]);

  // Base MRP
  const baseUnitMRP = useMemo(() => {
    if (matchedVariantPrice) {
      return Number(
        matchedVariantPrice.MRP_price ||
          matchedVariantPrice.customer_product_price ||
          0,
      );
    }
    return Number(data.MRP_price || data.customer_product_price || 0);
  }, [matchedVariantPrice, data]);

  // Extra pages & cost calculation
  const extraPages = Math.max(0, currentPages - defaultPages);
  const extraPagesCost = extraPages * pricePerExtraPage;

  // Final single unit prices
  const finalUnitPrice = baseUnitPrice + extraPagesCost;
  const finalUnitMRP = Math.max(baseUnitMRP + extraPagesCost, finalUnitPrice);

  // Total amount
  const totalPrice = finalUnitPrice * quantity;
  const totalMRP = finalUnitMRP * quantity;
  const totalSavings = Math.max(0, totalMRP - totalPrice);
  const discountPercent =
    totalMRP > 0 ? Math.round(((totalMRP - totalPrice) / totalMRP) * 100) : 0;

  // ── Pincode delivery calculator ─────────────────────────────────────────────
  const [pincode, setPincode] = useState("");
  const [isValidatingPin, setIsValidatingPin] = useState(false);
  const [isPinValid, setIsPinValid] = useState(null);
  const [deliveryEstimate, setDeliveryEstimate] = useState("");
  const [deliveryRegion, setDeliveryRegion] = useState("");

  const handleValidatePincode = async (pin) => {
    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setIsPinValid(false);
      setDeliveryEstimate("");
      setDeliveryRegion("");
      return;
    }
    setIsValidatingPin(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsValidatingPin(false);
    setIsPinValid(true);

    const prefix = parseInt(pin.substring(0, 3));
    let days = 3;
    let stateName = "Express Metro";
    if (prefix >= 600 && prefix < 650) {
      days = 2;
      stateName = "Tamil Nadu";
    } else if (prefix === 560) {
      days = 3;
      stateName = "Karnataka";
    } else if (prefix === 400) {
      days = 3;
      stateName = "Maharashtra";
    } else {
      days = 4;
      stateName = "All India Standard";
    }
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDeliveryRegion(stateName);
    setDeliveryEstimate(
      d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
    );
  };

  // ── Cart & Checkout actions ─────────────────────────────────────────────────
  const executeAddToCart = async (isBuyNowFlow = false) => {
    try {
      if (isBuyNowFlow) setBuyingNow(true);
      else setAddingToCart(true);

      const userPhone =
        user?.phone || user?.phoneNumber || user?.mobile || null;
      const userEmail = user?.email || null;
      const token = localStorage.getItem("userData") || "guest";
      const guestId = getGuestId();

      const baseCartPayload = {
        product_id: data._id,
        product_name: data.name,
        product_image:
          data.images?.[0]?.url ||
          data.images?.[0]?.path ||
          data.seo_img ||
          "",
        category_name:
          data.category_details?.main_category_name || "Photo Book",
        subcategory_name:
          data.sub_category_details?.sub_category_name || "Photo Book",
        product_price: finalUnitPrice,
        product_quantity: quantity,
        product_seo_url: data.seo_url || "",
        MRP_savings: totalSavings,
        TotalSavings: totalSavings,
        FreeDelivery: true,
        DeliveryCharges: 0,
        final_total: Number(totalPrice.toFixed(2)),
        final_total_withoutGst: Number(totalPrice.toFixed(2)),
        phone_number: userPhone,
        email: userEmail,
        pincode: pincode || "600001",
        is_photobook: true,
        photobook_size: currentSize?.name || "8x8",
        photobook_dimensions: currentSize
          ? `${currentSize.width_in}x${currentSize.height_in} in (${currentSize.width_cm}x${currentSize.height_cm} cm)`
          : "8x8 in",
        photobook_pages: currentPages,
        photobook_extra_pages: extraPages,
        photobook_extra_pages_cost: extraPagesCost,
        photobook_variants: selectedVariantsState,
        photobook_selected_template:
          photobookConfig.eligible_template_ids?.[0] || "vintage-wedding-book",
      };

      const cartPayload =
        token === "user"
          ? { ...baseCartPayload, userRole: token }
          : { ...baseCartPayload, guestId, GuestId: guestId, userRole: token };

      const result = await addToShoppingCart(cartPayload);
      dispatch(ADD_TO_CART(_.get(result, "data.data.data", "")));

      if (isBuyNowFlow) {
        navigate("/shopping-cart");
      } else {
        Swal.fire({
          title: "Photo Book Added to Cart!",
          text: `${currentSize?.name} (${currentPages} Pages) is ready in your cart.`,
          icon: "success",
          showCancelButton: true,
          confirmButtonText: "Go to Shopping Cart",
          cancelButtonText: "Continue Shopping",
          confirmButtonColor: "#2563eb",
          cancelButtonColor: "#64748b",
        }).then((res) => {
          if (res.isConfirmed) {
            navigate("/shopping-cart");
          }
        });
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.setItem("redirect_url", data.seo_url || "");
        toast.error("Please login to proceed with your order");
        navigate("/sign-up");
      } else {
        toast.error(err.message || "Failed to add Photo Book to cart");
      }
    } finally {
      setAddingToCart(false);
      setBuyingNow(false);
    }
  };

  // ── Share handler ───────────────────────────────────────────────────────────
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col space-y-6 pb-12 select-none">
      {/* ── 1. Top Badges & Product Header ────────────────────────────────────── */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-xs">
            <BookOutlined className="text-indigo-600" /> Premium Photo Book
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
            ★ Layflat Archival Binding
          </span>
          {data.stocks_status && (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                data.is_soldout
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              {data.is_soldout ? "Out of Stock" : "In Stock & Ready to Print"}
            </span>
          )}
        </div>

        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight pt-1">
          {data.name || "Customizable Photo Book"}
        </h1>

        {/* Product meta line */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
          {data.product_code && (
            <span>
              SKU: <b className="text-slate-700">{data.product_code}</b>
            </span>
          )}
          {data.Vendor_Code && (
            <span>
              Vendor Code:{" "}
              <b className="text-slate-700">{data.Vendor_Code}</b>
            </span>
          )}
          {data.HSNcode_time && (
            <span>
              HSN: <b className="text-slate-700">{data.HSNcode_time}</b>
            </span>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <Rate
              disabled
              defaultValue={5}
              className="text-xs text-amber-400"
            />
            <span className="text-slate-600 font-semibold">(4.9)</span>
          </div>
        </div>
      </div>

      {/* ── 2. Live Dynamic Pricing Card ──────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-lg relative overflow-hidden">
        {/* Ambient subtle light circles */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-blue-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <div className="text-xs font-medium text-indigo-200 uppercase tracking-wider">
              Total Unit Price
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl lg:text-4xl font-black tracking-tight text-white">
                ₹{finalUnitPrice.toLocaleString("en-IN")}
              </span>
              {finalUnitMRP > finalUnitPrice && (
                <span className="text-base font-semibold line-through text-slate-400">
                  ₹{finalUnitMRP.toLocaleString("en-IN")}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-xs">
                  {discountPercent}% OFF
                </span>
              )}
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-300">
            <div>
              {data.Tax_prefernce === "Taxable"
                ? `Inclusive of ${data.GST || 5}% GST`
                : "Tax Inclusive"}
            </div>
            <div className="text-emerald-400 font-medium flex items-center sm:justify-end gap-1 mt-0.5">
              <RocketOutlined /> Free Express Delivery
            </div>
          </div>
        </div>

        {/* Breakdown bar */}
        <div className="relative z-10 mt-3 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
          <span>
            Base ({defaultPages} pgs): <b>₹{baseUnitPrice}</b>
          </span>
          {extraPages > 0 ? (
            <span className="text-amber-300 font-medium">
              +{extraPages} Extra Pages: <b>+₹{extraPagesCost}</b> (₹
              {pricePerExtraPage}/pg)
            </span>
          ) : (
            <span className="text-slate-400">0 extra pages</span>
          )}
          <span>
            Selected Size: <b>{currentSize?.name}</b>
          </span>
        </div>
      </div>

      {/* ── 3. Photo Book Size Selector ───────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FaBookOpen className="text-indigo-600" />
            1. Select Album Size
          </label>
          <span className="text-xs text-slate-500">
            Inches & Centimeters available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {availableSizes.map((sz) => {
            const isSelected = currentSize?.name === sz.name;
            // find size price
            const matchedP = data.variants_price?.find(
              (vp) =>
                (vp.sizes &&
                  String(vp.sizes).trim().toLowerCase() ===
                    String(sz.name).trim().toLowerCase()) ||
                (vp.key &&
                  String(vp.key).trim().toLowerCase() ===
                    String(sz.name).trim().toLowerCase()),
            );
            const sizePrice =
              matchedP?.customer_product_price ||
              matchedP?.MRP_price ||
              data.customer_product_price ||
              data.MRP_price;

            return (
              <motion.button
                key={sz._id || sz.name}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectSize(sz)}
                className={`relative p-3.5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] shadow-xs">
                    <CheckOutlined />
                  </span>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base text-slate-900">
                      {sz.name}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Square
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    {sz.width_in}″ × {sz.height_in}″
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {sz.width_cm} × {sz.height_cm} cm
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500">From</span>
                  <span className="font-bold text-slate-900">
                    ₹{sizePrice || baseUnitPrice}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── 4. Dynamic Product Variants (e.g. Edition: Basic / Premium) ──────── */}
      {configVariants.length > 0 && (
        <div className="space-y-4 pt-1">
          {configVariants.map((v, vIdx) => {
            const activeVal = selectedVariantsState[v.title] || v.values?.[0];
            return (
              <div key={v._id || v.title || vIdx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FaLayerGroup className="text-indigo-600" />
                    {vIdx + 2}. Choose {v.title}
                  </label>
                  <span className="text-xs text-indigo-600 font-semibold">
                    Selected: {activeVal}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {(v.values || []).map((val) => {
                    const isSelected = activeVal === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() =>
                          handleSelectVariantOption(v.title, val)
                        }
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-2 border ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {isSelected && <CheckOutlined className="text-xs" />}
                        {val}
                        {val.toLowerCase().includes("premium") && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black rounded-sm ml-1 uppercase">
                            HD Foil
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 5. Page Count Stepper & Extra Cost ────────────────────────────────── */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-sm font-bold text-slate-900">
              Album Page Count
            </div>
            <div className="text-xs text-slate-500">
              Default includes {defaultPages} pages · Min {minPages} to Max{" "}
              {maxPages}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white px-2 py-1.5 rounded-xl border border-slate-300 shadow-xs">
            <button
              type="button"
              disabled={currentPages <= minPages}
              onClick={() => handlePagesChange(currentPages - pageIncrement)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <MinusOutlined />
            </button>
            <span className="w-14 text-center font-extrabold text-base text-slate-900">
              {currentPages}
            </span>
            <button
              type="button"
              disabled={currentPages >= maxPages}
              onClick={() => handlePagesChange(currentPages + pageIncrement)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <PlusOutlined />
            </button>
          </div>
        </div>

        {/* Page calculation status */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/80 text-slate-600">
          <span>
            {extraPages > 0 ? (
              <span className="text-amber-700 font-semibold">
                +{extraPages} additional pages (₹{pricePerExtraPage}/page)
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold">
                ✓ Included in base product price
              </span>
            )}
          </span>
          <span className="font-extrabold text-slate-900">
            {extraPages > 0 ? `+ ₹${extraPagesCost}` : "₹0 extra"}
          </span>
        </div>
      </div>

      {/* ── 6. Canva-Like Template Designer CTA ──────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 uppercase tracking-wider">
            ✨ Canva-Like Visual Editor
          </div>
          <div className="font-black text-base lg:text-lg">
            Create Your Custom Multi-Page Book
          </div>
          <div className="text-xs text-violet-100">
            Pick from pre-made wedding & travel layouts, drag & drop photos.
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDesignerModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-extrabold text-xs shadow-md hover:bg-violet-50 transition-all shrink-0 active:scale-95"
        >
          🎨 Open Template Designer
        </button>
      </div>

      {/* ── 7. Pincode & Delivery Estimator ───────────────────────────────────── */}
      <div className="space-y-2 pt-1">
        <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FaTruckFast className="text-indigo-600" />
          Delivery Availability & Timeline
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter 6-digit Pincode"
            maxLength={6}
            value={pincode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "").slice(0, 6);
              setPincode(val);
              setIsPinValid(null);
              if (val.length === 6) handleValidatePincode(val);
            }}
            className="!h-11 !rounded-xl !border-slate-300 font-medium"
            suffix={
              isValidatingPin ? (
                <Spin size="small" />
              ) : isPinValid === true ? (
                <CheckCircleOutlined className="text-emerald-500" />
              ) : isPinValid === false ? (
                <CloseCircleOutlined className="text-rose-500" />
              ) : null
            }
          />
          <Button
            type="primary"
            onClick={() => handleValidatePincode(pincode)}
            className="!h-11 !px-5 !rounded-xl !bg-slate-900 hover:!bg-slate-800 !font-bold"
          >
            Check
          </Button>
        </div>

        {isPinValid && deliveryEstimate && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-slate-700 bg-emerald-50 border border-emerald-200/80 p-2.5 rounded-xl flex items-center justify-between"
          >
            <span>
              Delivery to <b>{deliveryRegion}</b> by{" "}
              <b className="text-emerald-700">{deliveryEstimate}</b>
            </span>
            <span className="font-bold text-emerald-700">FREE Shipping</span>
          </motion.div>
        )}
      </div>

      {/* ── 8. Quantity & Final Action Buttons ────────────────────────────────── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-900">Quantity</span>
          <div className="flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <MinusOutlined />
            </button>
            <span className="w-8 text-center font-extrabold text-base text-slate-900">
              {quantity}
            </span>
            <button
              type="button"
              disabled={quantity >= 50}
              onClick={() => setQuantity((q) => Math.min(50, q + 1))}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <PlusOutlined />
            </button>
          </div>
        </div>

        {/* Action Button Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button
            type="default"
            size="large"
            loading={addingToCart}
            onClick={() => executeAddToCart(false)}
            icon={<ShoppingCartOutlined className="text-lg" />}
            className="!h-13 !rounded-2xl !font-extrabold !text-sm !border-2 !border-slate-900 !text-slate-900 hover:!bg-slate-900 hover:!text-white transition-all shadow-xs"
          >
            Add to Shopping Cart
          </Button>

          <Button
            type="primary"
            size="large"
            loading={buyingNow}
            onClick={() => executeAddToCart(true)}
            icon={<ThunderboltOutlined className="text-lg" />}
            className="!h-13 !rounded-2xl !font-extrabold !text-sm !bg-gradient-to-r !from-indigo-600 !to-blue-600 hover:!from-indigo-700 hover:!to-blue-700 !border-none !text-white shadow-lg hover:shadow-xl transition-all"
          >
            Instant Buy Now • ₹{totalPrice.toLocaleString("en-IN")}
          </Button>
        </div>

        {/* Share & Query Row */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <button
            type="button"
            onClick={() => setShareModalOpen(true)}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold"
          >
            <ShareAltOutlined /> Share this Photo Book
          </button>
          <span className="flex items-center gap-1 text-slate-400">
            <SafetyCertificateOutlined /> 100% Quality Satisfaction Guarantee
          </span>
        </div>
      </div>

      {/* ── 9. Bullet Points & Production Details ─────────────────────────────── */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
        <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Product Highlights
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
          {data.Point_one && (
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
              <span>{data.Point_one}</span>
            </div>
          )}
          {data.Point_two && (
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
              <span>{data.Point_two}</span>
            </div>
          )}
          {data.Point_three && (
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
              <span>{data.Point_three}</span>
            </div>
          )}
          {data.Point_four && (
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
              <span>{data.Point_four}</span>
            </div>
          )}
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
            <span>
              Production Time: <b>{data.Production_time || 120} Mins</b>
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
            <span>Premium 250 GSM Silk Coated Archival Paper</span>
          </div>
        </div>
      </div>

      {/* ── Designer Modal ────────────────────────────────────────────────────── */}
      <Modal
        open={designerModalOpen}
        onCancel={() => setDesignerModalOpen(false)}
        footer={null}
        width={620}
        centered
        className="rounded-2xl overflow-hidden"
      >
        <div className="p-4 text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-2xl shadow-inner">
            <BookOutlined />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Canva-Like Photo Book Visual Studio
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Our automated designer maps your photos directly into the
              admin's predefined {currentSize?.name} layout templates with
              smart cropping, filters, and high-definition print rendering.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
            <div className="font-bold text-slate-800">
              Selected Configuration:
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Size:</span>
              <span className="font-semibold text-slate-900">
                {currentSize?.name} ({currentSize?.width_in}″ ×{" "}
                {currentSize?.height_in}″)
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Pages:</span>
              <span className="font-semibold text-slate-900">
                {currentPages} Pages ({extraPages} extra)
              </span>
            </div>
            {Object.keys(selectedVariantsState).map((k) => (
              <div key={k} className="flex justify-between text-slate-600">
                <span>{k}:</span>
                <span className="font-semibold text-slate-900">
                  {selectedVariantsState[k]}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <Button
              type="default"
              onClick={() => setDesignerModalOpen(false)}
              className="!rounded-xl !h-10 !px-5"
            >
              Close
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setDesignerModalOpen(false);
                executeAddToCart(false);
              }}
              className="!rounded-xl !h-10 !px-6 !bg-indigo-600 !font-bold"
            >
              Save & Add to Cart
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Share Modal ───────────────────────────────────────────────────────── */}
      <Modal
        open={shareModalOpen}
        onCancel={() => setShareModalOpen(false)}
        footer={null}
        width={420}
        centered
      >
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-bold text-slate-900">
            Share Photo Book
          </h3>
          <p className="text-xs text-slate-500">
            Share this customizable photo book with friends or family.
          </p>

          <div className="flex gap-2">
            <Input
              readOnly
              value={window.location.href}
              className="!rounded-xl font-mono text-xs text-slate-600"
            />
            <Button
              type="primary"
              onClick={handleCopyLink}
              className="!rounded-xl !bg-slate-900 !font-bold"
            >
              {copiedLink ? "Copied!" : "Copy"}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `Check out this customizable Photo Book: ${window.location.href}`,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center text-lg hover:scale-105 transition-transform"
            >
              <FaWhatsapp />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                window.location.href,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg hover:scale-105 transition-transform"
            >
              <FaFacebook />
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PhotoBookDetails;
