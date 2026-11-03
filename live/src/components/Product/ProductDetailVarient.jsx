/* eslint-disable no-empty */
/* eslint-disable react/prop-types */
import {
  Checkbox,
  Divider,
  Input,
  InputNumber,
  Select,
  Spin,
  Tag,
  Tooltip,
  Switch,
  Button,
  Card,
  Typography,
  Alert,
  Row,
  Col,
  Form,
  message,
} from "antd";
import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import ReactDOM from "react-dom";
import _ from "lodash";
import { useDispatch, useSelector } from "react-redux";
import UploadFileButton from "../UploadFileButton";
import { useNavigate } from "react-router-dom";
import { IconHelper } from "../../helper/IconHelper";
import { FacebookIcon, WhatsappIcon } from "react-share";
import { IoShareSocial } from "react-icons/io5";
import {
  addToShoppingCart,
  bulkOrder,
  resendOtp,
  verifyOtp,
  notifyWhenAvailable,
  savePhotoBookDesign,
  checkCustomerSavedPhotoBookDesign,
} from "../../helper/api_helper";
import Swal from "sweetalert2";
import { formatBookSizeInches } from "../../helper/photobookSizeHelper";
import { ADD_TO_CART } from "../../redux/slices/cart.slice";
import {
  DISCOUNT_HELPER,
  GST_DISCOUNT_HELPER,
  Gst_HELPER,
} from "../../helper/form_validation";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingCartOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  LoadingOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  BookOutlined,
  ClockCircleOutlined,
  LockOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import { FaMapMarkerAlt, FaTruck } from "react-icons/fa";

const { Title, Text, Paragraph } = Typography;

// ─────────────────────────────────────────────────────────────────────────────
// DesignPreviewPortal — rendered at document.body via createPortal so it is
// completely outside every stacking context on the page.
// ─────────────────────────────────────────────────────────────────────────────
const DesignPreviewPortal = ({ imageUrl, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 99999 }}
      className="flex items-center justify-center p-4"
    >
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)" }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.18 }}
        style={{ position: "relative", maxWidth: 700, width: "100%", maxHeight: "90vh" }}
        className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Design Preview</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close preview"
          >
            <CloseOutlined className="text-gray-500 text-base" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-gray-50">
          <img
            src={imageUrl}
            alt="Your design preview"
            style={{ maxHeight: "60vh", maxWidth: "100%", objectFit: "contain" }}
            className="rounded-lg shadow"
          />
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <Button onClick={onClose}>Close</Button>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CustomModal
// ─────────────────────────────────────────────────────────────────────────────
export const CustomModal = ({
  open,
  onClose,
  title,
  children,
  footer,
  width = 520,
  className = "",
  closable = true,
  topPosition = "top-0",
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!open) return null;
  return ReactDOM.createPortal(
    <div
      className={`fixed inset-0 flex justify-center p-2 ${topPosition} ${isMobile ? "items-end" : "items-center"
        }`}
      style={{ zIndex: 9000 }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}

      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: isMobile ? 100 : 20 }}


        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: isMobile ? 100 : 20 }}
        className={`relative bg-white rounded-lg shadow-xl ${isMobile ? "w-full h-full rounded-b-none" : "max-h-[90vh]"
          } overflow-hidden flex flex-col ${className}`}
        style={isMobile ? {} : { width }}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {closable && (
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <CloseOutlined className="text-gray-500" />
              </button>
            )}
          </div>
        )}
        <div className={`flex-1 overflow-auto ${isMobile ? "p-4" : "p-6"}`}>
          {children}
        </div>
        {footer && (
          <div className="flex justify-start gap-3 p-6 border-t border-gray-200">
            {footer}
          </div>
        )}
      </motion.div>
    </div>,
    document.body,
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CustomPopover
// ─────────────────────────────────────────────────────────────────────────────
export const CustomPopover = ({
  open,
  onClose,
  children,
  placement = "bottom-right",
  className = "",
}) => {
  if (!open) return null;

  const placementClasses = {
    "bottom-right": "top-full right-0 mt-2",
    "bottom-left": "top-full left-0 mt-2",
    "top-right": "bottom-full right-0 mb-2",
    "top-left": "bottom-full left-0 mb-2",
  };

  return (
    <div className="relative">
      <div className="fixed inset-0 z-40 md:hidden" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className={`fixed md:absolute z-50 ${placementClasses[placement]} ${className}`}
      >
        {children}
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const getProductImages = (data) => {
  let images;
  if (_.get(data, "variants[0].variant_type", []) === "image_variant") {
    images = _.get(data, "variants[0].options[0].image_names", []);
  } else {
    images = _.get(data, "images", []);
  }
  if (!images || images.length === 0) return [];
  return images
    .map((image) => {
      if (typeof image === "string") return image;
      if (image && image.path) return image.path;
      return "";
    })
    .filter(Boolean);
};

const getFirstProductImage = (data) => {
  const images = getProductImages(data);
  return images.length > 0 ? images[0] : "";
};

const getRoleFields = (role) => {
  switch (role) {
    case "Dealer":
      return {
        quantity: "Dealer_quantity",
        discount: "Dealer_discount",
        freeDelivery: "free_delivery_dealer",
        recommended: "recommended_stats_dealer",
        deliveryCharges: "delivery_charges_dealer",
        deliveryChargesOuterTN: "delivery_charges_dealer_outer_tn",
      };
    case "Corporate":
      return {
        quantity: "Corporate_quantity",
        discount: "Corporate_discount",
        freeDelivery: "free_delivery_corporate",
        recommended: "recommended_stats_corporate",
        deliveryCharges: "delivery_charges_corporate",
        deliveryChargesOuterTN: "delivery_charges_corporate_outer_tn",
      };
    default:
      return {
        quantity: "Customer_quantity",
        discount: "Customer_discount",
        freeDelivery: "free_delivery_customer",
        recommended: "recommended_stats_customer",
        deliveryCharges: "delivery_charges_customer",
        deliveryChargesOuterTN: "delivery_charges_customer_outer_tn",
      };
  }
};

const calculateUnitPrice = (basePrice, discountPercentage, userRole, gst = 0) => {
  if (userRole === "Corporate" || userRole === "Dealer" || userRole === "bni_user") {
    return DISCOUNT_HELPER(discountPercentage, basePrice);
  }
  return GST_DISCOUNT_HELPER(discountPercentage, basePrice, gst);
};

const calculateUnitPriceWithoutGst = (basePrice, discountPercentage) =>
  DISCOUNT_HELPER(discountPercentage, basePrice);

const calculateMRPUnitPrice = (basePrice, userRole, gst = 0) => {
  if (userRole === "Corporate" || userRole === "Dealer" || userRole === "bni_user") {
    return basePrice;
  }
  return basePrice * (1 + gst / 100);
};

// ─────────────────────────────────────────────────────────────────────────────
// Delivery charge resolver — returns BOTH inside-TN and outside-TN charges
// from the matched quantity tier in product data.
// ─────────────────────────────────────────────────────────────────────────────
const getBothDeliveryChargesFromProduct = (productData, userRole, currentQty = null) => {
  // Default fallback charges
  const defaults = { insideTN: 100, outsideTN: 150 };

  if (!productData) return defaults;

  const roleFields = getRoleFields(userRole);
  const quantityDiscounts = productData.quantity_discount_splitup || [];

  // Find the matching quantity tier
  let matchedTier = null;
  if (currentQty && quantityDiscounts.length > 0) {
    const sorted = [...quantityDiscounts]
      .filter((item) => item[roleFields.quantity] && Number(item[roleFields.quantity]) <= currentQty)
      .sort((a, b) => Number(b[roleFields.quantity]) - Number(a[roleFields.quantity]));
    matchedTier = sorted[0] || quantityDiscounts[0];
  } else {
    matchedTier =
      quantityDiscounts.find(
        (item) => item[roleFields.quantity] && Number(item[roleFields.quantity]) > 0,
      ) || quantityDiscounts[0];
  }

  if (!matchedTier) return defaults;

  // If free delivery applies, both are 0
  const isFreeDelivery = matchedTier[roleFields.freeDelivery] || false;
  if (isFreeDelivery) return { insideTN: 0, outsideTN: 0 };

  // Inside TN charge
  const insideTN = Number(matchedTier[roleFields.deliveryCharges] || 100);

  // Outside TN charge — use dedicated field if set, otherwise fall back to insideTN + 50
  const outerTNRaw = matchedTier[roleFields.deliveryChargesOuterTN];
  const outsideTN =
    outerTNRaw !== undefined && outerTNRaw !== null && outerTNRaw !== ""
      ? Number(outerTNRaw)
      : insideTN > 0
        ? insideTN + 50
        : 150;

  return { insideTN, outsideTN };
};

// ─────────────────────────────────────────────────────────────────────────────
// PincodeDeliveryCalculatorForModal
// Now calls onDeliveryChargeChange with { insideTN, outsideTN, active }
// where `active` is the charge for the detected state.
// ─────────────────────────────────────────────────────────────────────────────
const PincodeDeliveryCalculatorForModal = ({
  productData,
  userRole,
  currentQty = null,
  onDeliveryChargeChange,   // called with { insideTN, outsideTN, active, isOutsideTN }
  onPincodeChange,
  initialPincode = "",
}) => {
  const [pincode, setPincode] = useState(initialPincode);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [state, setState] = useState("");
  const [error, setError] = useState("");
  const [isValidatingPincode, setIsValidatingPincode] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isPincodeValid, setIsPincodeValid] = useState(null);
  // Store both charges for display
  const [bothCharges, setBothCharges] = useState({ insideTN: 0, outsideTN: 0 });
  const [isOutsideTN, setIsOutsideTN] = useState(false);

  const stateDeliveryDays = {
    maharashtra: { days: 2, name: "Maharashtra" },
    gujarat: { days: 3, name: "Gujarat" },
    karnataka: { days: 4, name: "Karnataka" },
    "tamil nadu": { days: 3, name: "Tamil Nadu" },
    kerala: { days: 6, name: "Kerala" },
    delhi: { days: 7, name: "Delhi" },
    default: { days: 3, name: "Other States" },
  };

  const pincodeToStateMap = useMemo(() => {
    const map = {};
    for (let i = 0; i < 50; i++) map[600 + i] = "tamil nadu";
    map[400] = "maharashtra";
    map[395] = "gujarat";
    map[560] = "karnataka";
    map[682] = "kerala";
    map[110] = "delhi";
    return map;
  }, []);

  const getStateFromPincode = (pin) =>
    pincodeToStateMap[parseInt(pin.substring(0, 3))] || "default";

  const productionDate = useMemo(() => {
    const prodDays = Number(_.get(productData, "Production_time", 2));
    const d = new Date();
    d.setDate(d.getDate() + prodDays);
    return d.toLocaleDateString("en-US", {
      weekday: "short", day: "numeric", month: "short", year: "numeric",
    });
  }, [productData]);

  const calculateDeliveryDate = (stateKey = "tamil nadu") => {
    const { days } = stateDeliveryDays[stateKey] || stateDeliveryDays.default;
    const d = new Date();
    d.setDate(d.getDate() + Number(days) + 2);
    return d.toLocaleDateString("en-US", {
      weekday: "short", day: "numeric", month: "short", year: "numeric",
    });
  };

  const validatePincode = useCallback(
    async (pin) => {
      setIsValidatingPincode(true);
      await new Promise((res) => setTimeout(res, 800));
      const isValid = /^\d{6}$/.test(pin);
      setIsPincodeValid(isValid);

      if (isValid) {
        const stateKey = getStateFromPincode(pin);
        const stateName = stateDeliveryDays[stateKey]?.name || stateDeliveryDays.default.name;
        setState(stateName);
        setDeliveryDate(calculateDeliveryDate(stateKey));

        const outsideFlag = stateKey !== "tamil nadu";
        setIsOutsideTN(outsideFlag);

        // Get BOTH delivery charges from product data
        const charges = getBothDeliveryChargesFromProduct(productData, userRole, currentQty);
        setBothCharges(charges);

        // Active charge = whichever applies to detected state
        const activeCharge = outsideFlag ? charges.outsideTN : charges.insideTN;

        if (onDeliveryChargeChange) {
          onDeliveryChargeChange({
            insideTN: charges.insideTN,
            outsideTN: charges.outsideTN,
            active: activeCharge,
            isOutsideTN: outsideFlag,
          });
        }
        if (onPincodeChange) onPincodeChange(pin);
        setError("");
      } else {
        setError("Please enter a valid 6-digit pincode");
        setDeliveryDate("");
        setState("");
        setBothCharges({ insideTN: 0, outsideTN: 0 });
        setIsOutsideTN(false);
        if (onDeliveryChargeChange) {
          onDeliveryChargeChange({ insideTN: 0, outsideTN: 0, active: 0, isOutsideTN: false });
        }
      }
      setIsValidatingPincode(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productData, userRole, currentQty],
  );

  // Re-validate when quantity tier changes so charges update
  useEffect(() => {
    if (isPincodeValid && pincode.length === 6) validatePincode(pincode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQty]);

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setPincode(value.slice(0, 6));
    setIsPincodeValid(null);
    setState("");
    setDeliveryDate("");
    setError("");
    setBothCharges({ insideTN: 0, outsideTN: 0 });
    setIsOutsideTN(false);
    if (value.length === 6) {
      validatePincode(value);
    } else {
      if (onDeliveryChargeChange) {
        onDeliveryChargeChange({ insideTN: 0, outsideTN: 0, active: 0, isOutsideTN: false });
      }
    }
  };

  const extractPincodeFromDisplayName = (displayName) => {
    const m = displayName.match(/\b\d{6}\b/);
    return m ? m[0] : null;
  };

  const getPincodeByGPS = async () => {
    setIsGettingLocation(true);
    setError("");
    try {
      if (!navigator.geolocation) throw new Error("Geolocation not supported");
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 15000, enableHighAccuracy: true, maximumAge: 300000,
        }),
      );
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=18&addressdetails=1`,
      );
      const d = await response.json();
      const detectedPincode =
        d.address?.postcode || extractPincodeFromDisplayName(d.display_name);
      if (detectedPincode) {
        setPincode(detectedPincode);
        validatePincode(detectedPincode);
        toast.success(`📍 Pincode detected: ${detectedPincode}`);
      } else {
        throw new Error("No pincode found");
      }
    } catch {
      toast.error("Failed to get location. Please enter pincode manually.");
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Derive the active charge for display
  const activeCharge = isOutsideTN ? bothCharges.outsideTN : bothCharges.insideTN;

  return (
    <div className="pincode-delivery-calculator-modal space-y-3">
      <div className="pincode-input-container">
        <div className="relative">
          <Input
            className="pincode-input !rounded-lg !border-gray-300 !h-11"
            value={pincode}
            onChange={handlePincodeChange}
            placeholder="Enter 6-digit Pincode for delivery estimate"
            maxLength={6}
            suffix={
              <div className="flex items-center gap-2">
                {isValidatingPincode && <Spin size="small" />}
                {isPincodeValid === true && <CheckCircleOutlined className="text-green-500" />}
                {isPincodeValid === false && <CloseCircleOutlined className="text-red-500" />}
              </div>
            }
          />
          <button
            onClick={getPincodeByGPS}
            disabled={isGettingLocation}
            className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
          >
            {isGettingLocation ? (
              <Spin size="small" />
            ) : (
              <>
                <FaMapMarkerAlt className="text-xs" />
                <span className="hidden sm:inline">Detect</span>
              </>
            )}
          </button>
        </div>

        {error && <div className="mt-1 text-red-500 text-sm">{error}</div>}

        {isPincodeValid && deliveryDate ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircleOutlined className="text-green-500" />
                <span className="font-medium">Delivery available to {state}</span>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                <span className="flex items-center gap-1.5 text-gray-700">
                  <FaTruck className="text-blue-500" />
                  Expected Delivery: <strong>{deliveryDate}</strong>
                </span>
                <span className="flex items-center gap-1.5 text-gray-700">
                  <FaMapMarkerAlt className="text-red-400" />
                  Pincode: <strong>{pincode}</strong>
                </span>
              </div>

              {/* ── Delivery charge display — shows both rates ── */}
              <div className="mt-1 pt-2 border-t border-green-200 space-y-2">
                {/* Active charge for detected state */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Delivery Charge for {state}:</span>
                  <span className="font-bold text-green-700 text-base">
                    {activeCharge === 0 ? "Free" : `₹${activeCharge}`}
                  </span>
                  {activeCharge === 0 && (
                    <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded-full">
                      Free Delivery
                    </span>
                  )}
                  {!isOutsideTN && activeCharge > 0 && (
                    <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-0.5 rounded-full">
                      Within Tamil Nadu
                    </span>
                  )}
                  {isOutsideTN && activeCharge > 0 && (
                    <span className="text-xs text-orange-600 font-medium bg-orange-100 px-2 py-0.5 rounded-full">
                      Outside Tamil Nadu
                    </span>
                  )}
                </div>

                {/* Always show both rates side-by-side for transparency */}
                <div className="flex flex-wrap gap-4 text-xs text-gray-500 bg-white border border-gray-100 rounded-lg px-3 py-2">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
                    Inside Tamil Nadu:&nbsp;
                    <strong className="text-gray-700">
                      {bothCharges.insideTN === 0 ? "Free" : `₹${bothCharges.insideTN}`}
                    </strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>
                    Outside Tamil Nadu:&nbsp;
                    <strong className="text-gray-700">
                      {bothCharges.outsideTN === 0 ? "Free" : `₹${bothCharges.outsideTN}`}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-gray-600">
                Expected Dispatch by <strong>{productionDate}</strong>
              </span>
              <span className="text-xs text-gray-500">Enter pincode for delivery date & charges</span>
              {bothCharges.insideTN === 0 && (
                <span className="text-xs text-green-600 font-medium">🎉 Free Delivery on this product!</span>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ProductDetailVarient — main component
// ─────────────────────────────────────────────────────────────────────────────
const ProductDetailVarient = ({
  data = {
    _id: "", name: "", desc: "", images: [],
    variants: [], variants_price: [], type: "Variable Product",
  },
  onVariantChange,
  selectedVariants: propSelectedVariants = {},
  onSizeChange,
  onPagesChange,
}) => {
  const { user } = useSelector((state) => state.authSlice);
  const [form] = Form.useForm();
  const [notifyForm] = Form.useForm();
  const [showWelcomeBackModal, setShowWelcomeBackModal] = useState(false);
  const [savedDesignData, setSavedDesignData] = useState(null);
  const [isCheckingSavedDesign, setIsCheckingSavedDesign] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Product constants
  const stockCount = _.get(data, "stock_count", 0);
  const productionTime = _.get(data, "Production_time", "2");
  const arrangeTime = _.get(data, "Stock_Arrangement_time", "3");
  const processing_item =
    stockCount === 0
      ? Number(productionTime) + Number(arrangeTime)
      : Number(productionTime);
  const productType = _.get(data, "type", "Variable Product");
  const quantityDiscounts = _.get(data, "quantity_discount_splitup", []);
  const dropdownGap = _.get(data, "dropdown_gap", 100);
  const quantityType = _.get(data, "quantity_type", "dropdown");
  const maxQuantity = _.get(data, "max_quantity", 10000);
  const unit = _.get(data, "unit", "pcs");
  const gst = _.get(data, "GST", 18);

  // ── Photo Book config resolution ──────────────────────────────────────────
  const isPhotoBook = useMemo(() => {
    if (!data) return false;
    if (data.is_photobook === true || data.is_photobook === "true") return true;
    if (data.photobook_config && (data.photobook_config.templates?.length > 0 || data.photobook_config.sizes?.length > 0)) return true;

    const subCat = data.sub_category_details;
    const subId = typeof subCat === "object" ? subCat?._id : subCat;
    if (String(subId) === "6ad078790ec48c46f0bb521a") return true;
    const subCategoryName = (
      (typeof subCat === "object" ? (subCat?.sub_category_name || subCat?.name || subCat?.slug) : "") || ""
    ).toLowerCase();
    return (
      subCategoryName.includes("photo book") ||
      subCategoryName.includes("photobook")
    );
  }, [data]);

  const photobookConfig = useMemo(() => data?.photobook_config || {}, [data]);

  // State
  const [selectedVariants, setSelectedVariants] = useState({});

  // Dynamic templates list from admin (ONLY storefront visible templates)
  const templatesList = useMemo(() => {
    return (photobookConfig.templates || [])
      .filter((t) => t.storefront_visibility !== false && t.is_active !== false)
      .map((t) => ({
        ...t,
        template_name: (t.template_name || t.name || "").trim(),
      }));
  }, [photobookConfig.templates]);
  const activeTemplate = useMemo(() => {
    if (templatesList.length === 0) return null;
    const curVal = String(selectedVariants["Template"] || "").trim().toLowerCase();
    return (
      templatesList.find(
        (t) =>
          (t.template_name || "").trim().toLowerCase() === curVal ||
          (t.slug || "").trim().toLowerCase() === curVal ||
          (t.template_id || "").trim().toLowerCase() === curVal ||
          String(t._id || "").trim().toLowerCase() === curVal
      ) || templatesList[0]
    );
  }, [templatesList, selectedVariants]);

  const activeEdition = useMemo(() => {
    const eds = activeTemplate?.editions || [];
    if (eds.length === 0) return null;
    const curVal = String(selectedVariants["Edition"] || "").trim().toLowerCase();
    return (
      eds.find((e) => (e.edition_name || "").trim().toLowerCase() === curVal) || eds[0]
    );
  }, [activeTemplate, selectedVariants]);

  const userManuallyChangedPages = useRef(false);
  const defaultPages = Number(
    activeEdition?.default_pages ||
    activeTemplate?.default_pages ||
    activeTemplate?.page_config?.default_pages ||
    photobookConfig.default_pages ||
    20
  );
  const minPages = Number(
    activeEdition?.min_pages ||
    activeTemplate?.min_pages ||
    activeTemplate?.page_config?.min_pages ||
    photobookConfig.min_pages ||
    10
  );
  const maxPages = Number(
    activeEdition?.max_pages ||
    activeTemplate?.max_pages ||
    activeTemplate?.page_config?.max_pages ||
    photobookConfig.max_pages ||
    60
  );
  const pageIncrement = Number(photobookConfig.page_increment || 2);

  const [photoBookPages, setPhotoBookPages] = useState(defaultPages);
  useEffect(() => {
    if (isPhotoBook) {
      if (!userManuallyChangedPages.current) {
        setPhotoBookPages(Math.min(maxPages, Math.max(minPages, defaultPages)));
      } else {
        if (photoBookPages > maxPages) setPhotoBookPages(maxPages);
        if (photoBookPages < minPages) setPhotoBookPages(minPages);
      }
    }
  }, [isPhotoBook, defaultPages, maxPages, minPages]);

  const photoBookPageOptions = useMemo(() => {
    if (!isPhotoBook) return [];
    const list = [];
    for (let p = minPages; p <= maxPages; p += pageIncrement) {
      list.push(p);
    }
    return list;
  }, [isPhotoBook, minPages, maxPages, pageIncrement]);

  const currentSizeName = selectedVariants.sizes || selectedVariants.size;
  const currentSizeObj = useMemo(() => {
    return (photobookConfig.sizes || []).find(
      (s) =>
        (s.name && String(s.name).toLowerCase() === String(currentSizeName).toLowerCase()) ||
        (s._id && String(s._id) === String(currentSizeName)),
    );
  }, [photobookConfig.sizes, currentSizeName]);
  const currentSizeId = currentSizeObj?._id || currentSizeName;

  const [currentPriceSplitup, setCurrentPriceSplitup] = useState({});

  // Dynamically calculate pricePerExtraPage for current size and active edition/template
  // Priority: Size-specific surcharge in edition -> Edition surcharge -> Size-specific in template -> Size obj -> Config
  const pricePerExtraPage = useMemo(() => {
    if (!isPhotoBook) return 0;
    // 1. From size-specific pricing inside active edition
    const edPricing = currentSizeId && (activeEdition?.size_pricing?.[currentSizeId] || activeEdition?.pricing_by_size?.[currentSizeId]);
    if (edPricing?.extra_page_price !== undefined && edPricing.extra_page_price !== null && edPricing.extra_page_price !== "") {
      const ep = Number(edPricing.extra_page_price);
      if (!isNaN(ep) && ep > 0) return ep;
    }
    // 2. From active edition level default
    if (activeEdition?.price_per_extra_page !== undefined && activeEdition.price_per_extra_page !== null && activeEdition.price_per_extra_page !== "") {
      const ep = Number(activeEdition.price_per_extra_page);
      if (!isNaN(ep) && ep > 0) return ep;
    }
    // 3. From active template size pricing
    const tplPricing = currentSizeId && (activeTemplate?.size_pricing?.[currentSizeId] || activeTemplate?.pricing_by_size?.[currentSizeId]);
    if (tplPricing?.extra_page_price !== undefined && tplPricing.extra_page_price !== null && tplPricing.extra_page_price !== "") {
      const ep = Number(tplPricing.extra_page_price);
      if (!isNaN(ep) && ep > 0) return ep;
    }
    // 4. From current size obj
    if (currentSizeObj?.extra_page_price !== undefined && currentSizeObj?.extra_page_price !== null && currentSizeObj?.extra_page_price !== "") {
      const ep = Number(currentSizeObj.extra_page_price);
      if (!isNaN(ep) && ep > 0) return ep;
    }
    // 5. From currentPriceSplitup
    if (currentPriceSplitup?.extra_page_price !== undefined && currentPriceSplitup.extra_page_price !== null) {
      const ep = Number(currentPriceSplitup.extra_page_price);
      if (!isNaN(ep) && ep > 0) return ep;
    }
    return Number(photobookConfig.price_per_extra_page || 15);
  }, [isPhotoBook, currentSizeId, activeEdition, activeTemplate, currentSizeObj, currentPriceSplitup, photobookConfig]);

  const extraPages = isPhotoBook ? Math.max(0, photoBookPages - defaultPages) : 0;
  const extraPagesCost = isPhotoBook ? extraPages * pricePerExtraPage : 0;

  // Merge Photo Book configured templates, editions, sizes and custom variants into availableVariants
  const availableVariants = useMemo(() => {
    let vars = [...(data?.variants || [])];
    if (isPhotoBook) {
      // 1. Merge templates from photobookConfig.templates
      if (templatesList.length > 0) {
        vars.unshift({
          variant_name: "Template",
          variant_type: "dropdown",
          options: templatesList.map((tpl) => ({
            value: tpl.template_name,
            label: tpl.template_name,
          })),
        });

        // 2. Merge editions from the active template
        const editions = activeTemplate?.editions || [];
        if (editions.length > 0) {
          vars.splice(1, 0, {
            variant_name: "Edition",
            variant_type: "dropdown",
            options: editions.map((ed) => ({
              value: ed.edition_name,
              label: ed.edition_name,
            })),
          });
        }
      }

      // 3. Merge ALL sizes created in photobook_config.sizes
      const cfgSizes = photobookConfig.sizes || [];
      if (cfgSizes.length > 0) {
        const sizeVarIdx = vars.findIndex((v) =>
          (v.variant_name || "").toLowerCase().includes("size")
        );

        const formatSizeLabel = (sz) => {
          return formatBookSizeInches(sz);
        };

        const sizeOptions = cfgSizes.map((sz) => ({
          value: sz.name,
          label: formatSizeLabel(sz),
          variant_type: "dropdown",
          image_names: [],
        }));

        if (sizeVarIdx !== -1) {
          vars[sizeVarIdx] = { ...vars[sizeVarIdx], options: sizeOptions };
        } else {
          vars.push({
            variant_name: "sizes",
            variant_type: "dropdown",
            options: sizeOptions,
          });
        }
      }

      // 4. Merge custom variants from photobook_config.variants
      const customVars = photobookConfig.variants || [];
      customVars.forEach((cv) => {
        if (cv.title && cv.values?.length > 0) {
          const exists = vars.some(
            (v) => (v.variant_name || "").toLowerCase() === cv.title.toLowerCase()
          );
          if (!exists) {
            vars.push({
              variant_name: cv.title,
              variant_type: "dropdown",
              options: cv.values.map((val) => ({ value: val, label: val })),
            });
          }
        }
      });
    }
    return vars;
  }, [data?.variants, isPhotoBook, photobookConfig, templatesList, activeTemplate]);

  // Sync size changes to slider / parent
  useEffect(() => {
    if (isPhotoBook && onSizeChange) {
      if (currentSizeObj) onSizeChange(currentSizeObj);
      else if (currentSizeName) onSizeChange({ name: currentSizeName });
    }
  }, [isPhotoBook, currentSizeObj, currentSizeName, onSizeChange]);

  // Sync pages changes to slider / parent
  useEffect(() => {
    if (isPhotoBook && onPagesChange) {
      onPagesChange(photoBookPages);
    }
  }, [isPhotoBook, photoBookPages, onPagesChange]);

  const [quantity, setQuantity] = useState(null);
  const [discountPercentage, setDiscountPercentage] = useState({ uuid: "", percentage: 0 });
  const [checked, setChecked] = useState(false);
  const [freeDelivery, setFreeDelivery] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stock, setStockCount] = useState(0);
  const [designPreviewVisible, setDesignPreviewVisible] = useState(false);
  const [quantityDropdownVisible, setQuantityDropdownVisible] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [noDesignUpload, setNoDesignUpload] = useState(false);
  const [needDesignUpload, setNeedDesignUpload] = useState(true);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [instructionsVisible, setInstructionsVisible] = useState(false);
  const [showBulkOrderForm, setShowBulkOrderForm] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const [photoBookDesignData, setPhotoBookDesignData] = useState(null);

  // ── Dual delivery charges state ───────────────────────────────────────────
  // DeliveryCharges   = inside Tamil Nadu charge (always stored)
  // out_of_tn_charge  = outside Tamil Nadu charge (always stored)
  // Both come from pincode calculator; we send both to backend regardless of
  // which state the user's pincode is in, so the backend/order system always
  // has access to both rates.
  const [deliveryCharges, setDeliveryCharges] = useState(100); // inside TN
  const [outOfTNCharge, setOutOfTNCharge] = useState(150); // outside TN
  const [pincodeIsOutsideTN, setPincodeIsOutsideTN] = useState(false);

  const [checkOutState, setCheckOutState] = useState({
    product_image: getFirstProductImage(data),
    product_design_file: "",
    product_name: _.get(data, "name", ""),
    category_name: _.get(data, "category_details.main_category_name", ""),
    subcategory_name: _.get(data, "sub_category_details.sub_category_name", ""),
    product_price: 0,
    product_variants: {},
    product_quantity: 0,
    product_seo_url: _.get(data, "seo_url", ""),
    product_id: _.get(data, "_id", ""),
    MRP_savings: 0,
    TotalSavings: 0,
    FreeDelivery: false,
    DeliveryCharges: 100,   // inside TN
    out_of_tn_charge: 150,   // outside TN
  });

  const { isGettingVariantPrice } = useSelector((state) => state.publicSlice);

  // ── Price helpers ──────────────────────────────────────────────────────────
  const getRoleBasedPrice = useCallback(
    (variantData) => {
      const source = variantData && Object.keys(variantData).length > 0 ? variantData : data;
      if (!source) return 0;
      if (user?.role === "Dealer")
        return Number(_.get(source, "Deler_product_price", _.get(source, "Dealer_product_price", _.get(source, "dealer_price", _.get(source, "price", _.get(source, "customer_product_price", _.get(source, "customer_price", 0)))))));
      if (user?.role === "Corporate")
        return Number(_.get(source, "corporate_product_price", _.get(source, "corporate_price", _.get(source, "price", _.get(source, "customer_product_price", _.get(source, "customer_price", 0))))));
      if (user?.role === "bni_user") {
        const Del_price = Number(_.get(source, "Deler_product_price", _.get(source, "Dealer_product_price", _.get(source, "dealer_price", _.get(source, "price", 0)))));
        const cus_price = Number(_.get(source, "customer_product_price", _.get(source, "customer_price", _.get(source, "price", 0))));
        return cus_price - Math.abs((cus_price - Del_price) / 2);
      }
      return Number(_.get(source, "customer_product_price", _.get(source, "customer_price", _.get(source, "price", 0))));
    },
    [user?.role, data],
  );

  const findMatchingVariantPrice = useCallback(
    (variants) => {
      // For Photo Book: check if edition or template has specific size pricing
      if (isPhotoBook) {
        const sizeVal = variants.sizes || variants.size || variants.Sizes;
        const sizeObj = (photobookConfig.sizes || []).find(
          (s) =>
            (s.name && String(s.name).toLowerCase() === String(sizeVal).toLowerCase()) ||
            (s._id && String(s._id) === String(sizeVal)),
        );
        const sId = sizeObj?._id || sizeVal;

        const curTplName = String(variants["Template"] || "").trim().toLowerCase();
        const curTpl =
          (photobookConfig.templates || []).find(
            (t) =>
              (t.template_name || "").trim().toLowerCase() === curTplName ||
              (t.slug || "").trim().toLowerCase() === curTplName ||
              (t.template_id || "").trim().toLowerCase() === curTplName
          ) || photobookConfig.templates?.[0];

        const curEdName = String(variants["Edition"] || "").trim().toLowerCase();
        const curEd =
          (curTpl?.editions || []).find(
            (e) => (e.edition_name || "").trim().toLowerCase() === curEdName
          ) || curTpl?.editions?.[0];

        // Search edition pricing_by_size or size_pricing
        let matchedPricing = null;
        if (curEd?.pricing_by_size) {
          matchedPricing =
            (sId && curEd.pricing_by_size[sId]) ||
            (sizeObj?.name && curEd.pricing_by_size[sizeObj.name]) ||
            (sizeVal && curEd.pricing_by_size[sizeVal]);
        }
        if (!matchedPricing && curEd?.size_pricing) {
          matchedPricing =
            (sId && curEd.size_pricing[sId]) ||
            (sizeObj?.name && curEd.size_pricing[sizeObj.name]) ||
            (sizeVal && curEd.size_pricing[sizeVal]);
        }
        // Fallback to template pricing
        if (!matchedPricing && curTpl?.pricing_by_size) {
          matchedPricing =
            (sId && curTpl.pricing_by_size[sId]) ||
            (sizeObj?.name && curTpl.pricing_by_size[sizeObj.name]) ||
            (sizeVal && curTpl.pricing_by_size[sizeVal]);
        }
        if (!matchedPricing && curTpl?.size_pricing) {
          matchedPricing =
            (sId && curTpl.size_pricing[sId]) ||
            (sizeObj?.name && curTpl.size_pricing[sizeObj.name]) ||
            (sizeVal && curTpl.size_pricing[sizeVal]);
        }

        if (matchedPricing) {
          const custPrice = Number(
            matchedPricing.customer_price ??
            matchedPricing.customer_product_price ??
            matchedPricing.price ??
            data.customer_product_price ??
            0,
          );
          const delerPrice = Number(
            matchedPricing.dealer_price ??
            matchedPricing.Deler_product_price ??
            matchedPricing.Dealer_product_price ??
            custPrice,
          );
          const corpPrice = Number(
            matchedPricing.corporate_price ??
            matchedPricing.corporate_product_price ??
            custPrice,
          );
          const mrpPrice = Number(
            matchedPricing.mrp ??
            matchedPricing.MRP_price ??
            data.MRP_price ??
            custPrice,
          );

          return {
            ...matchedPricing,
            sizes: sizeVal,
            customer_product_price: custPrice,
            customer_price: custPrice,
            price: custPrice,
            Deler_product_price: delerPrice,
            Dealer_product_price: delerPrice,
            corporate_product_price: corpPrice,
            MRP_price: mrpPrice,
            extra_page_price:
              curEd?.price_per_extra_page ??
              matchedPricing.extra_page_price ??
              photobookConfig.price_per_extra_page,
            product_code: matchedPricing.product_code || data.product_code || "",
          };
        }
      }

      if (!data.variants_price || data.variants_price.length === 0) return null;
      // 1. Exact match across all variant keys
      const exact = data.variants_price.find((vp) =>
        Object.keys(variants).every((k) => vp[k] === variants[k]),
      );
      if (exact) return exact;

      // 2. Partial/size match for Photo Book or when some variants (e.g. Edition) don't have separate price rows
      const sizeVal = variants.sizes || variants.size || variants.Sizes;
      if (sizeVal) {
        const sizeMatch = data.variants_price.find(
          (vp) =>
            (vp.sizes && String(vp.sizes).toLowerCase() === String(sizeVal).toLowerCase()) ||
            (vp.key && String(vp.key).toLowerCase() === String(sizeVal).toLowerCase()),
        );
        if (sizeMatch) return sizeMatch;
      }

      // 3. Fallback
      return data.variants_price[0];
    },
    [data.variants_price, data.MRP_price, isPhotoBook, photobookConfig],
  );

  const updateVariantData = useCallback(
    (variantData) => {
      if (!variantData) return;
      setCurrentPriceSplitup(variantData);
      const price = getRoleBasedPrice(variantData);
      setCheckOutState((prev) => ({ ...prev, product_price: price, product_variants: variantData }));
      setStockCount(_.get(variantData, "stock_count", _.get(variantData, "stock", 0)));
    },
    [getRoleBasedPrice],
  );

  const hasInitializedRef = useRef(false);
  const currentProductIdRef = useRef(data?._id);
  if (currentProductIdRef.current !== data?._id) {
    currentProductIdRef.current = data?._id;
    hasInitializedRef.current = false;
  }

  // ── Initialization (runs only once per product) ───────────────────────────
  useEffect(() => {
    if (hasInitializedRef.current) return;
    if (availableVariants.length === 0 && !data.variants_price?.length) return;

    if ((productType === "Variable Product" && data.variants_price?.length > 0) || isPhotoBook) {
      const initialSelectedVariants = {};
      availableVariants.forEach((variant) => {
        if (variant.options?.length > 0) {
          initialSelectedVariants[variant.variant_name] = variant.options[0].value;
          if (isPhotoBook && (variant.variant_name.toLowerCase().includes("size") || variant.variant_name === "sizes")) {
            localStorage.setItem("photobook_selected_size", variant.options[0].value);
          }
        }
      });
      hasInitializedRef.current = true;
      setSelectedVariants(initialSelectedVariants);
      const matchingVariant = findMatchingVariantPrice(initialSelectedVariants);
      if (matchingVariant) {
        updateVariantData(matchingVariant);
        if (onVariantChange) onVariantChange(initialSelectedVariants);
      }
    } else {
      hasInitializedRef.current = true;
      updateVariantData(data.variants_price?.[0] || {});
    }
    initializeQuantity();
  }, [data.variants_price, availableVariants, productType, findMatchingVariantPrice, updateVariantData, onVariantChange]);

  // Dynamically reconcile missing or invalid variant keys when availableVariants changes,
  // without resetting valid user selections (e.g. keeping user's chosen Template).
  useEffect(() => {
    if (!hasInitializedRef.current) return;
    if (!isPhotoBook) return;

    setSelectedVariants((prev) => {
      let changed = false;
      const next = { ...prev };
      availableVariants.forEach((v) => {
        const currentVal = next[v.variant_name];
        const isValid = (v.options || []).some(
          (opt) =>
            opt.value === currentVal ||
            String(opt.value || "").trim().toLowerCase() === String(currentVal || "").trim().toLowerCase()
        );
        if (!isValid && v.options?.length > 0) {
          next[v.variant_name] = v.options[0].value;
          changed = true;
        }
      });
      if (changed) {
        const mv = findMatchingVariantPrice(next);
        if (mv) updateVariantData(mv);
        if (onVariantChange) onVariantChange(next);
        return next;
      }
      return prev;
    });
  }, [availableVariants, isPhotoBook, findMatchingVariantPrice, updateVariantData, onVariantChange]);

  useEffect(() => {
    if (propSelectedVariants && Object.keys(propSelectedVariants).length > 0) {
      setSelectedVariants((prev) => {
        const merged = { ...prev, ...propSelectedVariants };
        const isDifferent = Object.keys(merged).some(
          (k) => merged[k] !== prev[k]
        );
        if (isDifferent) {
          const mv = findMatchingVariantPrice(merged);
          if (mv) updateVariantData(mv);
          return merged;
        }
        return prev;
      });
    }
  }, [propSelectedVariants, findMatchingVariantPrice, updateVariantData]);

  const initializeQuantity = useCallback(() => {
    // For Photo Book: strictly default to 1 quantity and hide quantity selection
    if (isPhotoBook) {
      const defaultQty = 1;
      const charges = getBothDeliveryChargesFromProduct(data, user?.role, defaultQty);
      setDiscountPercentage({ uuid: "", percentage: 0 });
      setFreeDelivery(false);
      setDeliveryCharges(charges.insideTN || 100);
      setOutOfTNCharge(charges.outsideTN || 150);
      setQuantity(defaultQty);
      setCheckOutState((prev) => ({
        ...prev,
        product_quantity: defaultQty,
        DeliveryCharges: charges.insideTN || 100,
        out_of_tn_charge: charges.outsideTN || 150,
        FreeDelivery: false,
      }));
      return;
    }

    const roleFields = getRoleFields(user?.role);
    if (quantityType !== "textbox" && quantityDiscounts.length > 0) {
      const first =
        quantityDiscounts.find(
          (item) => item[roleFields.quantity] && Number(item[roleFields.quantity]) > 0,
        ) || quantityDiscounts[0];
      if (first) {
        const q = Number(first[roleFields.quantity]);
        const d = Number(first[roleFields.discount] || 0);
        const fd = first[roleFields.freeDelivery] || false;

        // Initialise both delivery charges from the first tier
        const charges = getBothDeliveryChargesFromProduct(data, user?.role, q);
        const inTN = fd ? 0 : charges.insideTN;
        const outTN = fd ? 0 : charges.outsideTN;

        setQuantity(q);
        setDiscountPercentage({ uuid: _.get(first, "uniqe_id", ""), percentage: d });
        setFreeDelivery(fd);
        setDeliveryCharges(inTN);
        setOutOfTNCharge(outTN);
        setCheckOutState((prev) => ({
          ...prev,
          product_quantity: q,
          DeliveryCharges: inTN,
          out_of_tn_charge: outTN,
          FreeDelivery: fd,
        }));
        return;
      }
    }

    // Default fallback (e.g., Photo Book or single quantity products)
    const defaultQty = 1;
    const charges = getBothDeliveryChargesFromProduct(data, user?.role, defaultQty);
    setDiscountPercentage({ uuid: "", percentage: 0 });
    setFreeDelivery(false);
    setDeliveryCharges(charges.insideTN || 100);
    setOutOfTNCharge(charges.outsideTN || 150);
    setQuantity(defaultQty);
    setCheckOutState((prev) => ({
      ...prev,
      product_quantity: defaultQty,
      DeliveryCharges: charges.insideTN || 100,
      out_of_tn_charge: charges.outsideTN || 150,
      FreeDelivery: false,
    }));
  }, [user?.role, quantityType, quantityDiscounts, data]);

  // ── Variant change ─────────────────────────────────────────────────────────
  const handleVariantChange = useCallback(
    async (variantName, selectedValue) => {
      try {
        const updatedVariants = { ...selectedVariants, [variantName]: selectedValue };

        // For Photo Book: if size changed, store in localStorage
        if (isPhotoBook && (variantName.toLowerCase().includes("size") || variantName === "sizes")) {
          localStorage.setItem("photobook_selected_size", selectedValue);
        }

        // For Photo Book: if Template changed, automatically switch Edition to the first edition of that template
        // AND immediately reset photoBookPages to that template's default pages!
        if (isPhotoBook && variantName === "Template") {
          const cleanVal = String(selectedValue || "").trim().toLowerCase();
          const newTpl = (photobookConfig.templates || []).find(
            (t) =>
              (t.template_name || "").trim().toLowerCase() === cleanVal ||
              (t.slug || "").trim().toLowerCase() === cleanVal ||
              (t.template_id || "").trim().toLowerCase() === cleanVal
          );
          if (newTpl?.editions?.length > 0) {
            updatedVariants["Edition"] = newTpl.editions[0].edition_name;
          }
          userManuallyChangedPages.current = false;
          const newTplDefaultPages = Number(
            newTpl?.editions?.[0]?.default_pages ||
            newTpl?.default_pages ||
            newTpl?.page_config?.default_pages ||
            photobookConfig.default_pages ||
            20
          );
          setPhotoBookPages(newTplDefaultPages);
        }

        // For Photo Book: if Edition changed, use edition's default pages if user hasn't manually adjusted
        if (isPhotoBook && variantName === "Edition") {
          const cleanEd = String(selectedValue || "").trim().toLowerCase();
          const edObj = (activeTemplate?.editions || []).find(
            (e) => (e.edition_name || "").trim().toLowerCase() === cleanEd
          );
          if (edObj && !userManuallyChangedPages.current) {
            const edDefaultPages = Number(
              edObj.default_pages ||
              activeTemplate?.default_pages ||
              photobookConfig.default_pages ||
              20
            );
            setPhotoBookPages(edDefaultPages);
          }
        }

        setSelectedVariants(updatedVariants);
        const vd = findMatchingVariantPrice(updatedVariants);
        if (vd) {
          updateVariantData(vd);
        }
        if (onVariantChange) onVariantChange(updatedVariants);
      } catch (err) {
        console.error("Failed to change variant:", err);
        toast.error("Failed to change variant");
      }
    },
    [selectedVariants, findMatchingVariantPrice, updateVariantData, onVariantChange, isPhotoBook, photobookConfig],
  );

  // ── Quantity ───────────────────────────────────────────────────────────────
  const generateQuantityOptions = useCallback(() => {
    const roleFields = getRoleFields(user?.role);
    if (quantityType === "textbox") {
      const options = [];
      for (let i = dropdownGap; i <= maxQuantity; i += dropdownGap)
        options.push({ value: i, label: i.toString() });
      return options;
    }
    const filtered = quantityDiscounts
      .filter((item) => item[roleFields.quantity])
      .map((item) => ({
        value: Number(item[roleFields.quantity]),
        label: `${item[roleFields.quantity]}`,
        Free_Delivery: item[roleFields.freeDelivery] || false,
        discount: Number(item[roleFields.discount] || 0),
        uuid: item.uniqe_id,
        stats: item[roleFields.recommended] || "No comments",
        deliveryCharges: Number(item[roleFields.deliveryCharges] || 100),
      }))
      .sort((a, b) => a.value - b.value);

    if (filtered.length > 0) return filtered;

    // Fallback options for Photo Book or when no tier splitup exists
    const defaultQtyList = [1, 2, 3, 4, 5, 10, 20, 50];
    return defaultQtyList.map((q) => ({
      value: q,
      label: `${q}`,
      Free_Delivery: false,
      discount: 0,
      uuid: `qty-${q}`,
      stats: "No comments",
      deliveryCharges: 100,
    }));
  }, [user?.role, quantityType, quantityDiscounts, dropdownGap, maxQuantity]);

  const quantityOptions = generateQuantityOptions();

  const handleQuantitySelect = useCallback(
    (selectedQuantity) => {
      const roleFields = getRoleFields(user?.role);
      let selectedDiscount;

      if (quantityType === "textbox") {
        selectedDiscount = [...quantityDiscounts]
          .filter((item) => item[roleFields.quantity] && Number(item[roleFields.quantity]) <= selectedQuantity)
          .sort((a, b) => Number(b[roleFields.quantity]) - Number(a[roleFields.quantity]))[0];
      } else {
        selectedDiscount = quantityDiscounts.find(
          (item) => Number(item[roleFields.quantity]) === selectedQuantity,
        );
      }

      setQuantity(selectedQuantity);
      setCheckOutState((prev) => ({ ...prev, product_quantity: selectedQuantity }));

      if (selectedDiscount) {
        const fd = selectedDiscount[roleFields.freeDelivery] || false;

        // Recalculate both delivery charges for new quantity tier
        const charges = getBothDeliveryChargesFromProduct(data, user?.role, selectedQuantity);
        const inTN = fd ? 0 : charges.insideTN;
        const outTN = fd ? 0 : charges.outsideTN;

        setDiscountPercentage({
          uuid: selectedDiscount.uniqe_id,
          percentage: Number(selectedDiscount[roleFields.discount] || 0),
        });
        setFreeDelivery(fd);
        setDeliveryCharges(inTN);
        setOutOfTNCharge(outTN);
        setCheckOutState((prev) => ({
          ...prev,
          DeliveryCharges: inTN,
          out_of_tn_charge: outTN,
          FreeDelivery: fd,
        }));
      } else {
        setDiscountPercentage({ uuid: "", percentage: 0 });
        setFreeDelivery(false);
        setDeliveryCharges(100);
        setOutOfTNCharge(150);
        setCheckOutState((prev) => ({
          ...prev,
          DeliveryCharges: 100,
          out_of_tn_charge: 150,
          FreeDelivery: false,
        }));
      }
      setQuantityDropdownVisible(false);
    },
    [user?.role, quantityType, quantityDiscounts, data],
  );

  // ── Price computations ─────────────────────────────────────────────────────
  const formatPrice = useCallback(
    (price) =>
      `₹${parseFloat(price || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
    [],
  );
  const formatMRPPrice = useCallback((price) => `₹${parseFloat(price || 0).toFixed(2)}`, []);

  const getUnitPrice = useMemo(() => {
    const basePrice = Number(_.get(checkOutState, "product_price", 0));
    const unit = calculateUnitPrice(basePrice, discountPercentage.percentage, user?.role, gst);
    return unit + (isPhotoBook ? extraPagesCost : 0);
  }, [checkOutState.product_price, discountPercentage.percentage, user?.role, gst, isPhotoBook, extraPagesCost]);

  const getMRPUnitPrice = useMemo(() => {
    const basePrice = Number(_.get(checkOutState, "product_price", 0));
    const mrp = calculateMRPUnitPrice(basePrice, user?.role, gst);
    return mrp + (isPhotoBook ? extraPagesCost : 0);
  }, [checkOutState.product_price, user?.role, gst, isPhotoBook, extraPagesCost]);

  const getOriginalUnitPrice = useMemo(() => {
    const basePrice = Number(_.get(checkOutState, "product_price", 0));
    let orig = 0;
    if (user?.role === "Corporate" || user?.role === "Dealer" || user?.role === "bni_user")
      orig = basePrice;
    else
      orig = basePrice * (1 + gst / 100);
    return orig + (isPhotoBook ? extraPagesCost : 0);
  }, [checkOutState.product_price, user?.role, gst, isPhotoBook, extraPagesCost]);

  const getUnitPricewithoutGst = () => {
    const basePrice = Number(_.get(checkOutState, "product_price", 0));
    return Math.round(calculateUnitPriceWithoutGst(basePrice, discountPercentage.percentage)) + (isPhotoBook ? extraPagesCost : 0);
  };

  const calculateTotalPrice = useCallback(() => (!quantity ? 0 : (getUnitPrice * quantity).toFixed(2)), [getUnitPrice, quantity]);
  const calculateTotalPricewithoutGst = () => (!quantity ? 0 : (getUnitPricewithoutGst() * quantity).toFixed(2));
  const calculateGstPrice = useCallback(() => (!quantity ? 0 : Number(getUnitPrice).toFixed(2)), [getUnitPrice, quantity]);
  const calculateMRPTotalPrice = useCallback(() => { if (!quantity) return 0; const mrp = Number(_.get(currentPriceSplitup, "MRP_price", 0)) + (isPhotoBook ? extraPagesCost : 0); return (mrp * quantity).toFixed(2); }, [currentPriceSplitup, quantity, isPhotoBook, extraPagesCost]);
  const calculateOriginalTotalPrice = useCallback(() => (!quantity ? 0 : (getOriginalUnitPrice * quantity).toFixed(2)), [getOriginalUnitPrice, quantity]);
  const calculateMRPSavings = useCallback(() => { if (!quantity) return 0; const mrp = Number(_.get(currentPriceSplitup, "MRP_price", 0)); return ((mrp - getMRPUnitPrice) * quantity).toFixed(2); }, [currentPriceSplitup, getMRPUnitPrice, quantity]);
  const calculateDiscountSavings = useCallback(() => (!quantity ? 0 : ((getOriginalUnitPrice - getUnitPrice) * quantity).toFixed(2)), [getOriginalUnitPrice, getUnitPrice, quantity]);
  const calculateTotalSavings = useCallback(() => (parseFloat(calculateMRPSavings()) + parseFloat(calculateDiscountSavings())).toFixed(2), [calculateMRPSavings, calculateDiscountSavings]);
  const calculateDealPercentageDiscount = useCallback(() => {
    if (!quantity) return 0;
    const mrpTotal = parseFloat(calculateMRPTotalPrice());
    const dealTotal = parseFloat(calculateTotalPrice());
    if (mrpTotal === 0 || dealTotal >= mrpTotal) return 0;
    return Math.round(((mrpTotal - dealTotal) / mrpTotal) * 100);
  }, [calculateMRPTotalPrice, calculateTotalPrice, quantity]);
  const calculateTotalSavingsPercentage = useCallback(() => {
    const ts = parseFloat(calculateTotalSavings());
    const ot = parseFloat(calculateOriginalTotalPrice());
    return ot === 0 ? 0 : ((ts / ot) * 100).toFixed(1);
  }, [calculateTotalSavings, calculateOriginalTotalPrice]);

  // ── Variant selector renderer ──────────────────────────────────────────────
  const renderVariantSelector = useCallback(
    (variant) => {
      const { variant_name, variant_type, options } = variant;
      if (!options || options.length === 0) return null;

      const isSizeVariant = (variant_name || "").toLowerCase().includes("size");
      const isTemplateVariant = (variant_name || "").toLowerCase().includes("template");
      const isEditionVariant = (variant_name || "").toLowerCase().includes("edition");

      // ── Template selector: Image + Template Name with unique active state ──
      if (isTemplateVariant) {
        return (
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-6">
            <Text
              strong
              className="block capitalize md:shrink-0 md:pt-3"
            >
              {variant_name}:
            </Text>

            <div className="min-w-0 flex-1">
              <div className="flex flex-nowrap items-stretch gap-3 overflow-x-auto overflow-y-hidden pb-3 scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-yellow-100">
                {options.map((option, optIdx) => {
                  const isSelected =
                    String(selectedVariants[variant_name] || "")
                      .trim()
                      .toLowerCase() ===
                    String(option.value || "").trim().toLowerCase();

                  const tplObj = (photobookConfig.templates || []).find(
                    (t) =>
                      (t.template_name || t.name || "").trim().toLowerCase() ===
                      String(option.value || "").trim().toLowerCase() ||
                      (t.slug || "").trim().toLowerCase() ===
                      String(option.value || "").trim().toLowerCase() ||
                      (t.template_id || "").trim().toLowerCase() ===
                      String(option.value || "").trim().toLowerCase() ||
                      String(t._id || "").trim().toLowerCase() ===
                      String(option.value || "").trim().toLowerCase()
                  );

                  let thumbUrl =
                    tplObj?.cover_image_url || tplObj?.thumbnail_url || "";

                  if (!thumbUrl && tplObj?.size_images) {
                    const firstImgList = Object.values(tplObj.size_images).find(
                      (imgs) => Array.isArray(imgs) && imgs.length > 0
                    );

                    thumbUrl =
                      firstImgList?.[0]?.url || firstImgList?.[0]?.path || "";
                  }

                  if (!thumbUrl) {
                    thumbUrl =
                      data.images?.[0]?.url || data.images?.[0]?.path || "";
                  }

                  return (
                    <div
                      key={optIdx}
                      onClick={() =>
                        handleVariantChange(variant_name, option.value)
                      }
                      className={`group flex flex-col shrink-0 cursor-pointer w-[160px] items-center gap-3 rounded-xl border-2 p-2.5 transition-all duration-200 ${isSelected
                        ? "border-yellow-500 bg-yellow-50/70 shadow-md ring-2 ring-yellow-400/30"
                        : "border-gray-200 bg-white hover:border-yellow-300 hover:shadow-sm"
                        }`}
                    >
                      {/* Template thumbnail */}
                      <div className="relative h-16 w-full shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-100">
                        <img
                          src={(thumbUrl || "").trim()}
                          alt={option.value}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "https://via.placeholder.com/80?text=Template";
                          }}
                        />

                        {isSelected && (
                          <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-black shadow">
                            ✓
                          </div>
                        )}
                      </div>

                      {/* Template name */}
                      <div className="min-w-0">
                        <span
                          className={`block whitespace-normal break-words text-sm text-center leading-snug ${isSelected
                            ? "font-bold text-gray-900"
                            : "font-medium text-gray-700"
                            }`}
                        >
                          {option.value}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }
      // ── Sizes selector: Buttons with name only, NO image, unique active UI ──
      if (isSizeVariant) {
        return (
          <div className="flex flex-col md:flex-row md:items-center gap-2 space-y-2 md:space-y-0">
            <Text strong className="block mb-2 md:mb-0 md:w-24 capitalize">{variant_name}:</Text>
            <div className="flex flex-wrap gap-2.5">
              {options.map((option, optIdx) => {
                const isSelected =
                  selectedVariants[variant_name] === option.value ||
                  String(selectedVariants[variant_name] || "").trim().toLowerCase() ===
                  String(option.value || "").trim().toLowerCase();
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleVariantChange(variant_name, option.value)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 border ${isSelected
                      ? "bg-yellow-400 text-black border-yellow-500 font-bold shadow-sm ring-2 ring-yellow-400/40"
                      : "bg-white text-gray-700 border-gray-300 hover:border-yellow-400 hover:bg-gray-50 font-medium"
                      }`}
                  >
                    {option.label || option.value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      // ── Edition selector: Buttons with name, unique active UI ──
      if (isEditionVariant) {
        return (
          <div className="flex flex-col md:flex-row md:items-center gap-2 space-y-2 md:space-y-0">
            <Text strong className="block mb-2 md:mb-0 md:w-24 capitalize">{variant_name}:</Text>
            <div className="flex flex-wrap gap-2.5">
              {options.map((option, optIdx) => {
                const isSelected =
                  selectedVariants[variant_name] === option.value ||
                  String(selectedVariants[variant_name] || "").trim().toLowerCase() ===
                  String(option.value || "").trim().toLowerCase();
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleVariantChange(variant_name, option.value)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 border ${isSelected
                      ? "bg-yellow-400 text-black border-yellow-500 font-bold shadow-sm ring-2 ring-yellow-400/40"
                      : "bg-white text-gray-700 border-gray-300 hover:border-yellow-400 hover:bg-gray-50 font-medium"
                      }`}
                  >
                    {option.value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      if (variant_type === "color_variant") {
        return (
          <div className="flex flex-col md:flex-row md:items-center gap-8 space-y-2 md:space-y-0">
            <Text strong className="block mb-2 md:mb-0 md:w-24 !capitalize">{variant_name}:</Text>
            <div className="flex flex-wrap gap-2">
              {options.map((option, index) => (
                <Tooltip key={index} title={option.value}>
                  <div
                    className={`flex flex-col items-center cursor-pointer transition-all duration-200 p-1 ${selectedVariants[variant_name] === option.value
                      ? "ring-2 ring-blue-500 rounded-lg"
                      : "border border-gray-200 rounded-lg hover:border-blue-300"
                      }`}
                    onClick={() => handleVariantChange(variant_name, option.value)}
                  >
                    <div
                      className="w-12 h-12 rounded-md overflow-hidden border border-gray-300"
                      style={{ backgroundColor: option.color_code || "#f0f0f0" }}
                    >
                      {!option.color_code && (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-xs text-gray-500">{option.value}</span>
                        </div>
                      )}
                    </div>
                    <Text className="text-xs mt-1 text-center capitalize max-w-[60px] truncate">
                      {option.value}
                    </Text>
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
        );
      }

      if (variant_type === "image_variant") {
        return (
          <div className="flex flex-col md:flex-row md:items-center gap-2 space-y-2 md:space-y-0">
            <Text strong className="block mb-2 md:mb-0 md:w-24 capitalize">{variant_name}:</Text>
            <div className="flex flex-wrap gap-2">
              {options.map((option, optionIndex) => {
                const imgSrc = option.image_names?.[0]?.path || option.image_names?.[0] || data.images?.[0]?.url || data.images?.[0]?.path;
                return (
                  <div key={optionIndex} className="flex flex-col items-center">
                    <div
                      onClick={() => handleVariantChange(variant_name, option.value)}
                      className={`cursor-pointer border-2 p-1 rounded transition duration-200 ${selectedVariants[variant_name] === option.value
                        ? "border-blue-500 shadow-md"
                        : "border-gray-300 hover:border-blue-400"
                        }`}
                      style={{ minWidth: "60px", minHeight: "60px" }}
                    >
                      <img
                        fetchpriority="high"
                        loading="eager"
                        src={imgSrc}
                        className="w-full h-12 object-contain"
                        alt={option.value}
                        onError={(e) => { e.target.src = "https://via.placeholder.com/60x60?text=No+Image"; }}
                      />
                    </div>
                    <Text className="text-xs mt-1 text-center font-medium">{option.value}</Text>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      return (
        <div className="flex flex-col md:flex-row md:items-center gap-2 space-y-2 md:space-y-0">
          <Text strong className="block mb-2 md:mb-0 md:w-24 capitalize">{variant_name}:</Text>
          <Select
            value={selectedVariants[variant_name]}
            onChange={(value) => handleVariantChange(variant_name, value)}
            className="w-full md:w-[30vw]"
            placeholder={`Select ${variant_name}`}
          >
            {options.map((option, index) => (
              <Select.Option key={index} value={option.value}>{option.label || option.value}</Select.Option>
            ))}
          </Select>
        </div>
      );
    },
    [selectedVariants, handleVariantChange, data?.images, photobookConfig.templates],
  );

  // ── Misc helpers ───────────────────────────────────────────────────────────
  const scrollToProductDetails = useCallback(() => {
    const el = document.getElementById("overview");
    if (el)
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.pageYOffset - 180,
        behavior: "smooth",
      });
  }, []);

  const handleUploadImage = useCallback((fileString) => {
    setCheckOutState((prev) => ({ ...prev, product_design_file: fileString }));
  }, []);

  const goToShoppingCart = useCallback(() => navigate("/shopping-cart"), [navigate]);

  // ── Quantity dropdown renderer ─────────────────────────────────────────────
  const quantityDropdownRender = useCallback(
    (menu) => (
      <div
        className="p-2 rounded-lg shadow-xl bg-white"
        onMouseLeave={() => setQuantityDropdownVisible(false)}
      >
        <div className="overflow-y-auto max-h-80 space-y-3">
          {quantityOptions.map((item) => {
            const itemUnitPrice = calculateUnitPrice(
              Number(_.get(checkOutState, "product_price", 0)),
              quantityType === "dropdown" ? item.discount : discountPercentage.percentage,
              user?.role,
              gst,
            );
            const itemTotalPrice = itemUnitPrice * item.value;
            const isSelected = quantity === item.value;
            return (
              <div
                key={item.value}
                className={`flex justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 border-2 ${isSelected
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-gray-100 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                onClick={() => handleQuantitySelect(item.value)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-base font-medium ${isSelected ? "text-blue-700" : "text-gray-800"}`}>
                      {item.value} {unit}
                    </span>
                    {item.stats && item.stats !== "No comments" && (
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
                        {item.stats}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quantityType === "dropdown" && item.discount > 0 && (
                      <span className="text-green-600 text-sm font-medium inline-flex items-center">
                        <CheckCircleOutlined className="mr-1" />{item.discount}% discount
                      </span>
                    )}
                    {quantityType === "dropdown" && item.Free_Delivery && (
                      <span className="text-blue-600 text-sm font-medium inline-flex items-center">
                        Free Delivery
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${isSelected ? "text-blue-700" : "text-gray-900"}`}>
                    {formatPrice(itemTotalPrice)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{formatPrice(itemUnitPrice)}/{unit}</p>
                </div>
              </div>
            );
          })}
        </div>
        {quantityOptions.length === 0 && (
          <div className="text-center py-4 text-gray-500">No quantity options available</div>
        )}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => setShowBulkOrderForm(true)}
            className="w-full py-2 px-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold text-sm hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <PlusOutlined />Bulk Order Inquiry
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">Prices include all applicable taxes •</p>
        </div>
      </div>
    ),
    [quantityOptions, checkOutState.product_price, quantity, unit, handleQuantitySelect, formatPrice, quantityType, discountPercentage.percentage, user?.role, gst],
  );

  // ── Cart ───────────────────────────────────────────────────────────────────
  const handleDesignerAddToCart = async (designData) => {
    try {
      setLoading(true);
      setPhotoBookDesignData(designData);
      const currentQty = quantity || 1;
      if (_.isEmpty(user)) {
        localStorage.setItem("redirect_url", _.get(data, "seo_url", ""));
        toast.error("Please Login");
        return navigate("/login");
      }
      const getGuestId = () => {
        let g = localStorage.getItem("guestId");
        if (!g) {
          g = "guest_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
          localStorage.setItem("guestId", g);
        }
        return g;
      };

      const finalTot = calculateTotalPrice();
      const finalTotNoGst = calculateTotalPricewithoutGst();

      const updatedCheckoutState = {
        ...checkOutState,
        product_quantity: currentQty,
        product_design_file: designData?.cover_image || checkOutState.product_image,
        guestId: getGuestId(),
        userRole: localStorage.getItem("userData") || "guest",
        sgst: Number(gst / 2),
        cgst: Number(gst / 2),
        MRP_savings: calculateMRPSavings(),
        TotalSavings: calculateTotalSavings(),
        FreeDelivery: freeDelivery,
        DeliveryCharges: deliveryCharges,
        out_of_tn_charge: outOfTNCharge,
        noCustomtation: false,
        final_total: Number(finalTot),
        final_total_withoutGst: Number(finalTotNoGst),
        is_photobook: true,
        photobook_pages: photoBookPages,
        photobook_size: selectedVariants.sizes || selectedVariants.size || "8x8",
        photobook_extra_pages: extraPages,
        photobook_extra_page_price: pricePerExtraPage,
        photobook_extra_pages_cost: extraPagesCost,
        photobook_variants: selectedVariants,
        photobook_template_id: activeTemplate?._id || "",
        photobook_template_name: selectedVariants["Template"] || "",
        photobook_edition_id: activeEdition?._id || "",
        photobook_edition_name: selectedVariants["Edition"] || "",
        photobook_selected_template: selectedVariants["Template"] || "",
        photobook_design_data: designData,
      };

      const result = await addToShoppingCart(updatedCheckoutState);
      Swal.fire({
        title: "Photo Book Added To Cart!",
        text: `Your ${photoBookPages}-page custom photo book (${designData.total_photos_used} photos) has been added to cart.`,
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Go to Shopping Cart",
        cancelButtonText: "Stay Here",
      }).then((r) => {
        if (r.isConfirmed) goToShoppingCart();
      });
      dispatch(ADD_TO_CART(_.get(result, "data.data.data", "")));
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.setItem("redirect_url", _.get(data, "seo_url", ""));
        toast.error("Login to place order");
        navigate("/sign-up");
      } else {
        toast.error(err.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const startNewPhotoBookDesign = async (chosenSize, chosenTemplateId, chosenTemplateName) => {
    try {
      setLoading(true);
      const payload = {
        product_id: data._id,
        size: chosenSize,
        variant: selectedVariants["Edition"] || selectedVariants.variant || "Standard",
        page_count: photoBookPages,
        template_id: chosenTemplateId,
        template_name: chosenTemplateName,
        uploaded_images: [],
        pages: [],
      };
      const res = await savePhotoBookDesign(payload);
      const designId = res.data?.data?.design_id || res.data?.data?.design?._id;
      if (designId) {
        const prodSlug = encodeURIComponent(data.seo_url || data.name || data._id);
        navigate(`/product/${prodSlug}/${designId}?step=1&new=true&template_id=${encodeURIComponent(chosenTemplateId)}&template_name=${encodeURIComponent(chosenTemplateName)}`);
      } else {
        toast.error("Could not initiate design session");
      }
    } catch (err) {
      console.error("Error creating new design session:", err);
      toast.error("Failed to initialize new book session.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartDesigning = async () => {
    try {
      setLoading(true);

      const chosenTemplateName =
        String(selectedVariants["Template"] || activeTemplate?.template_name || templatesList[0]?.template_name || "").trim() ||
        "Vintage Wedding Book";
      const chosenTemplateId =
        activeTemplate?.template_id ||
        activeTemplate?._id ||
        templatesList[0]?.template_id ||
        templatesList[0]?._id ||
        "vintage-wedding-book";

      const chosenSize =
        selectedVariants.sizes ||
        selectedVariants.size ||
        (photobookConfig.sizes && photobookConfig.sizes[0]?.name) ||
        "A4";
      localStorage.setItem("photobook_selected_size", chosenSize);

      const token = localStorage.getItem("authToken");

      // 1. Check whether customer is authenticated
      if (!token || _.isEmpty(user)) {
        localStorage.setItem("redirect_url", `${window.location.pathname}?resumePhotoBook=true`);
        sessionStorage.setItem("resume_photobook", "true");
        toast.error("Please log in to customize and save your photo book.");
        navigate("/login");
        return;
      }

      // 2. Validate customer identity on backend and check for existing saved design
      try {
        setIsCheckingSavedDesign(true);
        const res = await checkCustomerSavedPhotoBookDesign(data._id);
        const checkData = res.data?.data || res.data;

        if (checkData?.has_saved_design && checkData.design) {
          // Saved design exists: show Welcome Back Modal
          setSavedDesignData(checkData.design);
          setShowWelcomeBackModal(true);
          return;
        } else {
          // No saved design: directly initialize a new photo book
          await startNewPhotoBookDesign(chosenSize, chosenTemplateId, chosenTemplateName);
        }
      } catch (authErr) {
        if (authErr.response?.status === 401 || authErr.response?.status === 403) {
          localStorage.setItem("redirect_url", `${window.location.pathname}?resumePhotoBook=true`);
          sessionStorage.setItem("resume_photobook", "true");
          toast.error("Please log in to customize and save your photo book.");
          navigate("/login");
          return;
        }
        console.error("Saved design check failed:", authErr);
        toast.error("Could not verify saved designs. Please try again.");
      } finally {
        setIsCheckingSavedDesign(false);
      }
    } catch (err) {
      console.error("Failed to start photo book design:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to start design session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueSavedBook = () => {
    if (!savedDesignData?._id) return;
    setShowWelcomeBackModal(false);
    const prodSlug = encodeURIComponent(data.seo_url || data.name || data._id);
    navigate(`/product/${prodSlug}/${savedDesignData._id}?step=3&resume=true`);
  };

  const handleStartNewBookFromModal = async () => {
    setShowWelcomeBackModal(false);
    const chosenTemplateName =
      String(selectedVariants["Template"] || activeTemplate?.template_name || templatesList[0]?.template_name || "").trim() ||
      "Vintage Wedding Book";
    const chosenTemplateId =
      activeTemplate?.template_id ||
      activeTemplate?._id ||
      templatesList[0]?.template_id ||
      templatesList[0]?._id ||
      "vintage-wedding-book";
    const chosenSize =
      selectedVariants.sizes ||
      selectedVariants.size ||
      (photobookConfig.sizes && photobookConfig.sizes[0]?.name) ||
      "A4";

    await startNewPhotoBookDesign(chosenSize, chosenTemplateId, chosenTemplateName);
  };



  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const shouldResume =
      searchParams.get("resumePhotoBook") === "true" ||
      sessionStorage.getItem("resume_photobook") === "true";

    if (shouldResume && !_.isEmpty(user)) {
      sessionStorage.removeItem("resume_photobook");
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      handleStartDesigning();
    }
  }, [user]);

  const handleBuy = async () => {
    try {
      if (isPhotoBook) {
        return handleStartDesigning();
      }
      setLoading(true);
      if (!quantity) { toast.error("Please select quantity first"); return; }
      if (!isPhotoBook && needDesignUpload && !checkOutState.product_design_file) { toast.error("Please upload your design file first"); return; }
      if (!isPhotoBook && needDesignUpload && !checked) { toast.error("Please Confirm Your Designs"); return; }
      if (_.isEmpty(user)) {
        localStorage.setItem("redirect_url", _.get(data, "seo_url", ""));
        toast.error("Please Login");
        return navigate("/login");
      }
      const getGuestId = () => {
        let g = localStorage.getItem("guestId");
        if (!g) {
          g = "guest_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
          localStorage.setItem("guestId", g);
        }
        return g;
      };

      const updatedCheckoutState = {
        ...checkOutState,
        guestId: getGuestId(),
        userRole: localStorage.getItem("userData") || "guest",
        sgst: Number(gst / 2),
        cgst: Number(gst / 2),
        MRP_savings: calculateMRPSavings(),
        TotalSavings: calculateTotalSavings(),
        FreeDelivery: freeDelivery,
        // ── Both delivery charges sent to backend ──────────────────────────
        DeliveryCharges: deliveryCharges,    // inside Tamil Nadu
        out_of_tn_charge: outOfTNCharge,      // outside Tamil Nadu
        // ──────────────────────────────────────────────────────────────────
        noCustomtation: noDesignUpload,
        final_total: Number(calculateTotalPrice()),
        final_total_withoutGst: Number(calculateTotalPricewithoutGst()),
        ...(isPhotoBook && {
          is_photobook: true,
          photobook_pages: photoBookPages,
          photobook_size: selectedVariants.sizes || selectedVariants.size || "8x8",
          photobook_extra_pages: extraPages,
          photobook_extra_page_price: pricePerExtraPage,
          photobook_extra_pages_cost: extraPagesCost,
          photobook_variants: selectedVariants,
          photobook_template_id: activeTemplate?._id || "",
          photobook_template_name: selectedVariants["Template"] || "",
          photobook_edition_id: activeEdition?._id || "",
          photobook_edition_name: selectedVariants["Edition"] || "",
          photobook_selected_template: selectedVariants["Template"] || "",
          photobook_design_data: photoBookDesignData,
          photobook_cover_image: photoBookDesignData?.cover_image || checkOutState.product_image,
        }),
      };

      const result = await addToShoppingCart(updatedCheckoutState);
      Swal.fire({
        title: "Product Added To Cart",
        text: "Choose an option: Go to the shopping cart page or stay here.",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Go to Shopping Cart",
        cancelButtonText: "Stay Here",
      }).then((r) => { if (r.isConfirmed) goToShoppingCart(); });
      dispatch(ADD_TO_CART(_.get(result, "data.data.data", "")));
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.setItem("redirect_url", _.get(data, "seo_url", ""));
        toast.error("Login to place order");
        navigate("/sign-up");
      } else {
        toast.error(err.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Notify ─────────────────────────────────────────────────────────────────
  const handleNotify = () => {
    if (user && user.email) {
      sendNotification({ email: user.email, phone: user.phone || "", name: user.name || "" });
    } else {
      setShowNotifyModal(true);
      notifyForm.resetFields();
    }
  };
  const sendNotification = async (userData) => {
    try {
      setSendingNotification(true);
      const result = await notifyWhenAvailable({
        productName: _.get(data, "name", ""),
        productId: _.get(data, "Vendor_Code", data._id),
        productUrl: window.location.href,
        userEmail: userData.email,
        userPhone: userData.phone,
        userName: userData.name,
        timestamp: new Date().toISOString(),
      });
      if (result.data.success) {
        toast.success("We'll notify you when this product is available!");
        setShowNotifyModal(false);
        notifyForm.resetFields();
      } else {
        toast.error("Failed to submit notification request");
      }
    } catch { toast.error("Failed to submit notification request"); }
    finally { setSendingNotification(false); }
  };
  const handleNotifySubmit = async (values) => sendNotification(values);

  // ── Share ──────────────────────────────────────────────────────────────────
  const shareProduct = useCallback((platform) => {
    const productUrl = encodeURIComponent(window.location.href);
    const productName = encodeURIComponent(data.name);
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${productUrl}`,
      whatsapp: `https://api.whatsapp.com/send?text=Check out this product: ${productName} ${productUrl}`,
    };
    if (urls[platform]) window.open(urls[platform], "_blank");
    setShowShareMenu(false);
  }, [data.name]);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: data.name, text: "Check out this amazing product!", url: window.location.href }); }
      catch { setShowShareMenu(!showShareMenu); }
    } else { setShowShareMenu(!showShareMenu); }
  };

  // ── Bulk order ─────────────────────────────────────────────────────────────
  const handleBulkOrderSubmit = async (values) => {
    try {
      await bulkOrder(values);
      message.success("Bulk order inquiry submitted successfully!");
      setShowBulkOrderForm(false);
      form.resetFields();
    } catch { message.error("Failed to submit bulk order inquiry"); }
  };
  const handleSendOtp = async (email) => {
    if (emailVerified) return;
    setSendingOtp(true);
    try { await resendOtp({ email }); setOtpSent(true); message.success("OTP sent to your email"); }
    catch { message.error("Failed to send OTP"); }
    finally { setSendingOtp(false); }
  };
  const handleVerifyOtp = async (otp) => {
    try {
      await verifyOtp({ email: form.getFieldValue("email"), otp });
      setEmailVerified(true);
      message.success("Email verified successfully");
    } catch {
      message.error("Invalid OTP");
      form.setFields([{ name: "otp", errors: ["Invalid OTP"] }]);
    }
  };
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const handleNoCustomization = (e) => { setNoDesignUpload(e.target.checked); setNeedDesignUpload(!e.target.checked); };
  const handleDesignRemove = () => setCheckOutState((prev) => ({ ...prev, product_design_file: "" }));

  const ProcessingTimeInfo = () => (
    <div className="max-h-[400px] overflow-y-auto text-gray-700">
      <Paragraph>After our <b>designing team</b> completes your design, you'll receive a <b>WhatsApp message</b> from us. You just need to reply "Yes" — and we'll immediately start processing your order to the next step.</Paragraph>
      <Paragraph>Please note that <b>delivery time may delay</b>, but don't worry — your order is <b>100% safe and secure</b> and will reach your <b>doorstep</b>.</Paragraph>
      <Paragraph>However, kindly note that <b>returns or exchanges are not applicable for customized products</b> due to their personalized nature. So please share your <b>expectations clearly</b> — we'll make sure your order is prepared <b>perfectly</b>.</Paragraph>
      <Alert message="If you place an order without a custom design, it will be delivered within 3–4 working days." type="info" showIcon className="!py-2" />
    </div>
  );

  const generateLabel = (label) => {
    switch (label) {
      case "new": return <Tag color="green">New</Tag>;
      case "popular": return <Tag color="purple">Popular</Tag>;
      case "only-for-today": return <Tag color="red">Only For Today</Tag>;
      default: return <></>;
    }
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <Spin spinning={loading} indicator={<IconHelper.CIRCLELOADING_ICON className="animate-spin !text-yellow-500" />}>

      <AnimatePresence>
        {designPreviewVisible && checkOutState.product_design_file && (
          <DesignPreviewPortal
            imageUrl={checkOutState.product_design_file}
            onClose={() => setDesignPreviewVisible(false)}
          />
        )}
      </AnimatePresence>

      <div className="font-primary w-full space-y-2 relative">

        {/* ── Product Header ─────────────────────────────────────────────── */}
        <div className="space-y-1 flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1 w-full md:w-auto">
            <h1 className="text-gray-900 font-bold mb-2 text-xl md:text-2xl leading-tight w-full md:w-[80%]">
              {data.name}
            </h1>
            <div className="flex flex-wrap gap-2">
              {data.label?.map((label, index) => <span key={index}>{generateLabel(label)}</span>)}
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col md:flex-row items-start md:items-center gap-3 md:relative">
            <div className="md:hidden flex flex-row-reverse items-center gap-3 w-full justify-between my-2">
              <button
                onClick={handleNativeShare}
                className="bg-[#f2c41a] text-black p-3 rounded-full shadow-md transition-all duration-300"
              >
                <IoShareSocial />
              </button>
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
                className="bg-gradient-to-br from-green-500 to-green-600 rounded-md px-4 py-2 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-white/70 text-xs line-through leading-tight whitespace-nowrap">
                      {formatPrice(Number(_.get(currentPriceSplitup, "MRP_price", _.get(data, "MRP_price", 0))))}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <h3 className="text-white text-base font-semibold leading-tight">
                      {quantity ? formatPrice(getUnitPrice) : formatPrice(getUnitPrice)}
                    </h3>
                    <span className="text-white/85 text-[10px] leading-none font-medium mt-0.5">
                      Inclusive of GST
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
                className="bg-gradient-to-br from-green-500 to-green-600 rounded-md px-4 py-2 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-white/70 text-xs line-through leading-tight whitespace-nowrap">
                      {formatPrice(Number(_.get(currentPriceSplitup, "MRP_price", _.get(data, "MRP_price", 0))))}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <h3 className="text-white text-base font-semibold leading-tight">
                      {quantity ? formatPrice(getUnitPrice) : formatPrice(getUnitPrice)}
                    </h3>
                    <span className="text-white/85 text-[10px] leading-none font-medium mt-0.5">
                      Inclusive of GST
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
            <AnimatePresence>
              {showShareMenu && (
                <CustomPopover
                  open={showShareMenu}
                  onClose={() => setShowShareMenu(false)}
                  className="w-48 bg-white rounded-lg shadow-xl z-50 p-2 border border-gray-200"
                >
                  <p className="text-xs text-gray-500 font-semibold p-2">Share via</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => shareProduct("facebook")}
                      className="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-500 transition-all"
                    >
                      <FacebookIcon size={35} round /><span className="text-xs mt-1">Facebook</span>
                    </button>
                    <button
                      onClick={() => shareProduct("whatsapp")}
                      className="flex flex-col items-center justify-center p-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-500 transition-all"
                    >
                      <WhatsappIcon size={35} round /><span className="text-xs mt-1">WhatsApp</span>
                    </button>
                  </div>
                </CustomPopover>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Description ────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-md font-semibold w-full md:w-[70%]">
            {_.get(data, "product_description_tittle", "")}
          </h2>
          <ul className="grid grid-cols-1 my-2 gap-2 text-md list-disc pl-5">
            <li>{_.get(data, "Point_one", "")}</li>
            <li>{_.get(data, "Point_two", "")}</li>
            <li>{_.get(data, "Point_three", "")}</li>
            <li>{_.get(data, "Point_four", "")}</li>
            <li className="list-none text-blue-600 cursor-pointer" onClick={scrollToProductDetails}>
              read more
            </li>
          </ul>
        </div>

        {/* ── Quantity & Variants ──────────────────────────────────── */}
        <div className="w-full flex flex-col space-y-4">
          {!isPhotoBook && (
            <div className="flex flex-col md:flex-row md:items-center gap-2 space-y-2 md:space-y-0">
              <Text strong className="block mb-2 md:mb-0 md:w-24">Quantity:</Text>
              <Select
                value={quantity}
                onChange={handleQuantitySelect}
                options={quantityOptions}
                className="w-full md:w-[30vw]"
                placeholder="Select quantity"
                dropdownRender={quantityDropdownRender}
                open={quantityDropdownVisible}
                onDropdownVisibleChange={setQuantityDropdownVisible}
              />
            </div>
          )}

          {/* Variants */}
          {availableVariants.length > 0 &&
            availableVariants.map((variant, index) => (
              <div key={index}>{renderVariantSelector(variant)}</div>
            ))}

          {/* Photo Book Pages: Increase / Decrease control + minimal info */}
          {isPhotoBook && (
            <div className="flex flex-col md:flex-row md:items-center gap-2 space-y-2 md:space-y-0">
              <Text strong className="block mb-2 md:mb-0 md:w-24 capitalize">Pages:</Text>
              <div className="flex flex-wrap items-center gap-3">
                {/* Stepper counter */}
                <div className="inline-flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden shadow-sm">
                  <button
                    type="button"
                    disabled={photoBookPages <= minPages}
                    onClick={() => {
                      userManuallyChangedPages.current = true;
                      const next = Math.max(minPages, photoBookPages - pageIncrement);
                      setPhotoBookPages(next);
                      if (onPagesChange) onPagesChange(next);
                    }}
                    className="w-10 h-10 flex items-center justify-center text-lg font-bold text-gray-700 hover:bg-yellow-50 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    −
                  </button>
                  <span className="w-24 text-center text-sm font-bold text-gray-900 select-none">
                    {photoBookPages} Pages
                  </span>
                  <button
                    type="button"
                    disabled={photoBookPages >= maxPages}
                    onClick={() => {
                      userManuallyChangedPages.current = true;
                      const next = Math.min(maxPages, photoBookPages + pageIncrement);
                      setPhotoBookPages(next);
                      if (onPagesChange) onPagesChange(next);
                    }}
                    className="w-10 h-10 flex items-center justify-center text-lg font-bold text-gray-700 hover:bg-yellow-50 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Minimal info for customer */}
                {extraPages > 0 ? (
                  <span className="text-xs text-amber-800 font-medium bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                    +{extraPages} extra pages (+₹{extraPagesCost}) • ₹{pricePerExtraPage}/extra page
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 font-medium bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
                    ({defaultPages} pages included)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Pricing card ───────────────────────────────────────────────── */}
        <Card className="bg-blue-50 rounded-lg border-0">
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <Text strong className="text-gray-800">Deal Price:</Text>
              <div className="text-right flex flex-col md:flex-row md:items-baseline gap-1">
                <Text delete className="text-md text-gray-500 md:mr-2">
                  {formatMRPPrice(calculateMRPTotalPrice())}
                </Text>
                <Title level={4} className="!m-0 !text-green-600">
                  {quantity ? formatPrice(calculateTotalPrice()) : formatPrice(0)}
                </Title>
              </div>
            </div>

            <div className="space-y-2">
              {calculateTotalSavings() > 0 && (
                <Alert
                  message={
                    <div>
                      <div className="font-semibold">
                        You Saved: {formatPrice(calculateMRPSavings())} &nbsp;(
                        {user.role === "Dealer" || user.role === "Corporate" || user.role === "bni_user"
                          ? <>{calculateDealPercentageDiscount()}% Discount</>
                          : <>{calculateTotalSavingsPercentage()}% Discount</>}
                        )
                      </div>
                      {calculateDiscountSavings() > 0 && (
                        <div className="text-sm mt-2">
                          Kudos! Additionally you saved {formatPrice(calculateDiscountSavings())} ({discountPercentage.percentage}% Discount)
                        </div>
                      )}
                      {!isPhotoBook && discountPercentage.percentage === 0 && quantity && (
                        <div className="mt-2 text-base text-amber-600">
                          💡 Select higher quantity to get extra discounts
                        </div>
                      )}
                      <div className="font-semibold text-green-700 text-lg mt-1">
                        🎉 You saved {formatPrice(calculateTotalSavings())} ({calculateTotalSavingsPercentage()}% OFF)
                      </div>
                    </div>
                  }
                  type="success"
                  showIcon
                  className="!py-3"
                />
              )}
            </div>

            {!isPhotoBook && (user.role === "Corporate" || user.role === "Dealer" || user.role === "bni_user") && (
              <div className="!text-[12px] text-gray-600">
                Exclusive of all taxes for <strong>{quantity}</strong> Qty (
                <strong>
                  {formatPrice(DISCOUNT_HELPER(discountPercentage.percentage, Number(_.get(checkOutState, "product_price", 0))))}
                </strong>/ piece)
              </div>
            )}

            {!isPhotoBook && quantity && (
              <div className="!text-[14px] text-gray-600">
                Inclusive of all taxes for <span>{quantity}</span> Qty
                <strong>
                  &nbsp;(
                  {user.role === "Dealer" || user.role === "Corporate" || user.role === "bni_user"
                    ? <>{formatPrice(Gst_HELPER(18, getUnitPrice))}</>
                    : <>{formatPrice(calculateGstPrice())}</>}
                  / piece)
                </strong>
              </div>
            )}
          </div>

          <div className="flex flex-col w-full justify-between mt-4">
            <div className="flex items-center gap-2">
              <Text strong className="text-gray-700">Processing Time:</Text>
              <Tooltip title="Learn more about processing time">
                <Button type="text" icon={<IconHelper.QUESTION_MARK />} size="small" onClick={() => setIsModalOpen(true)} />
              </Tooltip>
              <span className="font-bold">{processing_item} days</span>
            </div>
            <CustomModal
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Once you confirm, your order will get the green signal for processing"
              width={700}
              topPosition="!top-[-500px]"
            >
              <ProcessingTimeInfo />
            </CustomModal>
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
            className="mt-4"
          >
            <Text strong className="block mb-2 text-gray-700">Estimated Delivery</Text>
            {/*
              PincodeDeliveryCalculatorForModal now calls onDeliveryChargeChange
              with { insideTN, outsideTN, active, isOutsideTN } so we always
              have BOTH rates available to send to the backend.
            */}
            <PincodeDeliveryCalculatorForModal
              productData={data}
              userRole={user?.role}
              currentQty={quantity}
              onDeliveryChargeChange={({ insideTN, outsideTN, active, isOutsideTN: outside }) => {
                setDeliveryCharges(insideTN);
                setOutOfTNCharge(outsideTN);
                setPincodeIsOutsideTN(outside);
                setCheckOutState((prev) => ({
                  ...prev,
                  DeliveryCharges: insideTN,
                  out_of_tn_charge: outsideTN,
                }));
              }}
            />
          </motion.div>
        </Card>

        {/* ── File upload / Customization ─────────────────────────────────── */}
        <div className="space-y-3">
          {isPhotoBook ? null : (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <Checkbox checked={noDesignUpload} onChange={handleNoCustomization}>
                  Proceed without Design
                </Checkbox>
                {!noDesignUpload && (
                  <div className="flex items-center gap-2">
                    <Text>Already have a Design</Text>
                    <Switch
                      checked={needDesignUpload}
                      onChange={(checked) => {
                        setNeedDesignUpload(checked);
                        if (!checked) {
                          setCheckOutState((prev) => ({ ...prev, product_design_file: "" }));
                          setChecked(false);
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              {!noDesignUpload && (
                <div>
                  {needDesignUpload ? (
                    <>
                      <UploadFileButton
                        handleUploadImage={handleUploadImage}
                        buttonText="Drag & Drop Files Here or Browse Files"
                        className="w-full border-dotted rounded-lg flex flex-col items-center justify-center transition-colors"
                      />
                      {checkOutState.product_design_file && (
                        <div className="mt-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="md:order-1">
                            <Button
                              type="link"
                              icon={<EyeOutlined />}
                              onClick={() => setDesignPreviewVisible(true)}
                            >
                              View Design
                            </Button>
                            <Button type="link" onClick={handleDesignRemove}>Remove</Button>
                          </div>
                          <Checkbox
                            checked={checked}
                            onChange={(e) => setChecked(e.target.checked)}
                            className="md:order-2"
                          >
                            I confirm this design
                          </Checkbox>
                        </div>
                      )}
                    </>
                  ) : (
                    <Alert
                      message="Our Designing Team will contact you within 24 Hours After Booking"
                      type="info"
                      showIcon
                    />
                  )}
                </div>
              )}
            </>
          )}

          {/* Instructions */}
          <div>
            <div className="flex gap-3 mb-2">
              <Text className="text-gray-800 font-bold">Instructions</Text>
              <Switch checked={instructionsVisible} onChange={setInstructionsVisible} />
            </div>
            {instructionsVisible && (
              <Input.TextArea
                rows={4}
                placeholder="Please provide the instructions for this product. Your response should be clear, concise, and must not exceed 180 words"
                maxLength={180}
                onChange={(e) =>
                  setCheckOutState((prev) => ({ ...prev, instructions: e.target.value }))
                }
              />
            )}
          </div>

          {/* Add to Cart */}
          <div className="w-full">
            {isGettingVariantPrice ? (
              <div className="center_div py-6"><Spin size="large" /></div>
            ) : (
              <>
                {_.get(data, "is_soldout", false) ? (
                  <Button
                    type="primary"
                    size="large"
                    icon={<MailOutlined />}
                    className="!h-12 !bg-gray-600 text-white hover:!bg-gray-700 hover:!text-white font-semibold w-full"
                    onClick={handleNotify}
                    loading={sendingNotification}
                  >
                    Notify When Available
                  </Button>
                ) : isPhotoBook ? (
                  <Button
                    type="primary"
                    size="large"
                    icon={<BookOutlined />}
                    className="!h-12 !bg-yellow-400 text-black hover:!bg-yellow-500 hover:!text-black font-semibold w-full text-base shadow-sm"
                    onClick={handleStartDesigning}
                    loading={loading}
                  >
                    Customize & Add to Cart
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    className="!h-12 !bg-yellow-400 text-black hover:!bg-yellow-500 hover:!text-black font-semibold w-full"
                    onClick={handleBuy}
                    loading={loading}
                  >
                    Add To Cart
                  </Button>
                )}
              </>
            )}
          </div>
          <Divider className="!my-4" />
        </div>

        {/* Product meta */}
        <div className="space-y-2 z-0 relative">
          <div className="flex items-center">
            <Text strong className="!text-gray-800 !w-20">Categories:</Text>
            <Text className="text-gray-600">
              {_.get(data, "category_details.main_category_name", "")}
              {_.get(data, "sub_category_details.sub_category_name", "") &&
                `, ${_.get(data, "sub_category_details.sub_category_name", "")}`}
            </Text>
          </div>
        </div>

        {/* ── Notify Modal ───────────────────────────────────────────────── */}
        <CustomModal
          open={showNotifyModal}
          onClose={() => { setShowNotifyModal(false); notifyForm.resetFields(); }}
          title="Notify When Available"
          width={500}
        >
          <Form form={notifyForm} layout="vertical" onFinish={handleNotifySubmit}>
            <div className="space-y-4">
              <div className="mb-4">
                <Text className="text-gray-600">
                  We'll notify you when <strong>{data.name}</strong> is back in stock.
                </Text>
              </div>
              <Form.Item label="Name" name="name" rules={[{ required: true, message: "Please enter your name" }, { min: 2, message: "Name must be at least 2 characters" }]}>
                <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Your full name" />
              </Form.Item>
              <Form.Item label="Email Address" name="email" rules={[{ required: true, message: "Please enter your email" }, { type: "email", message: "Please enter a valid email" }]}>
                <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="your@email.com" />
              </Form.Item>
              <Form.Item label="Phone Number" name="phone" rules={[{ required: true, message: "Please enter your phone number" }, { pattern: /^[0-9]{10}$/, message: "Please enter a valid 10-digit phone number" }]}>
                <Input prefix={<PhoneOutlined className="text-gray-400" />} placeholder="9876543210" maxLength={10} />
              </Form.Item>
              <div className="flex gap-3">
                <Button onClick={() => { setShowNotifyModal(false); notifyForm.resetFields(); }} className="flex-1">Cancel</Button>
                <Button type="primary" htmlType="submit" className="flex-1 bg-blue-500" loading={sendingNotification}>Notify Me</Button>
              </div>
            </div>
          </Form>
        </CustomModal>

        {/* ── Bulk Order Modal ───────────────────────────────────────────── */}
        <CustomModal
          open={showBulkOrderForm}
          onClose={() => setShowBulkOrderForm(false)}
          title="Bulk Order Inquiry"
          width={600}
        >
          <Form form={form} layout="vertical" onFinish={handleBulkOrderSubmit}>
            <div className="space-y-4">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Product Name" name="product_name" initialValue={_.get(data, "name", "")}>
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Quantity" name="quantity" rules={[{ required: true, message: "Please enter quantity" }]}>
                    <InputNumber min={1} className="w-full" addonAfter={unit} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="Email Address" name="email" rules={[{ required: true, message: "Please enter email" }, { type: "email", message: "Invalid email" }]}>
                <Input
                  placeholder="your@email.com"
                  suffix={
                    emailVerified
                      ? <CheckCircleOutlined style={{ color: "#52c41a" }} />
                      : <LoadingOutlined spin={sendingOtp} />
                  }
                  onBlur={(e) => {
                    if (e.target.value && validateEmail(e.target.value)) handleSendOtp(e.target.value);
                  }}
                />
              </Form.Item>
              {otpSent && !emailVerified && (
                <Form.Item label="Enter OTP" name="otp" rules={[{ required: true, message: "Please enter OTP" }, { len: 6, message: "OTP must be 6 digits" }]}>
                  <div className="flex items-center gap-3">
                    <Input.OTP
                      length={6}
                      onChange={(otp) => { if (otp.length === 6) handleVerifyOtp(otp); }}
                      disabled={emailVerified}
                    />
                    <Button type="link" onClick={() => handleSendOtp(form.getFieldValue("email"))} disabled={sendingOtp}>
                      Resend OTP
                    </Button>
                  </div>
                </Form.Item>
              )}
              <Form.Item label="Mobile Number" name="mobile" rules={[{ required: true, message: "Please enter mobile number" }]}>
                <Input placeholder="+91 12345 67890" />
              </Form.Item>
              <Form.Item label="Additional Requirements" name="additional_requirements">
                <Input.TextArea rows={3} placeholder="Any special requirements or notes..." />
              </Form.Item>
              <div className="flex gap-3">
                <Button onClick={() => setShowBulkOrderForm(false)} className="flex-1">Cancel</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="flex-1 bg-yellow-500"
                  disabled={!emailVerified}
                >
                  Submit Inquiry
                </Button>
              </div>
            </div>
          </Form>
        </CustomModal>



        {/* ── Photo Book Welcome Back Modal ── */}
        <CustomModal
          open={showWelcomeBackModal}
          onClose={() => setShowWelcomeBackModal(false)}
          title="Welcome Back!"
          width={540}
        >
          <div className="flex flex-col gap-5 p-1 select-none">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Welcome Back!
              </h3>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                You have a photo book in progress. Would you like to continue where you left off or start a new book?
              </p>
            </div>

            {/* Saved Design Card Preview */}
            {savedDesignData && (
              <div className="bg-gray-50/80 border border-gray-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 shadow-2xs">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-200 shrink-0 border border-gray-200 shadow-xs flex items-center justify-center">
                  {savedDesignData.template_thumbnail || savedDesignData.cover_image ? (
                    <img
                      src={savedDesignData.template_thumbnail || savedDesignData.cover_image}
                      alt={savedDesignData.template_name || "Saved Photo Book"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                      <BookOutlined className="text-3xl text-[#00a896]" />
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col gap-1 text-center sm:text-left">
                  <span className="text-[11px] font-bold text-[#00a896] uppercase tracking-wider">
                    Saved Design In-Progress
                  </span>
                  <h4 className="text-base font-bold text-gray-900 leading-snug">
                    {savedDesignData.template_name || activeTemplate?.template_name || "Custom Photo Book"}
                  </h4>
                  <p className="text-xs text-gray-600">
                    Size: <span className="font-semibold text-gray-800">{formatBookSizeInches(savedDesignData.size, photobookConfig.sizes) || "Standard"}</span> • Pages:{" "}
                    <span className="font-semibold text-gray-800">{savedDesignData.page_count || 20}</span>
                  </p>
                  <p className="text-xs text-teal-700 font-medium">
                    {savedDesignData.uploaded_images?.length || 0} photos uploaded
                  </p>
                  {savedDesignData.updatedAt && (
                    <p className="text-[11px] text-gray-400 mt-1 flex items-center justify-center sm:justify-start gap-1">
                      <ClockCircleOutlined className="text-[10px]" />
                      Last saved: {new Date(savedDesignData.updatedAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="primary"
                size="large"
                className="flex-1 !h-12 !bg-[#00a896] hover:!bg-[#008f80] text-white font-bold rounded-xl text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-2"
                onClick={handleContinueSavedBook}
              >
                <BookOutlined /> Continue My Book
              </Button>
              <Button
                size="large"
                className="flex-1 !h-12 border-gray-300 hover:border-gray-400 hover:!bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm flex items-center justify-center gap-2"
                onClick={handleStartNewBookFromModal}
                loading={loading}
              >
                <PlusOutlined /> Start a New Book
              </Button>
            </div>
          </div>
        </CustomModal>
      </div>
    </Spin>
  );
};

export default ProductDetailVarient;