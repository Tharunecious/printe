/* eslint-disable no-empty */
const mongoose               = require("mongoose");
const { errorResponse,
        successResponse }    = require("../helper/response.helper");
const { ShoppingCardSchema } = require("./models_import");

// ─────────────────────────────────────────────────────────────────────────────
// Helper: resolve phone + email for a logged-in user
// ─────────────────────────────────────────────────────────────────────────────
const resolveUserContact = async (userData, bodyOverrides = {}) => {
  let phone = bodyOverrides.phone_number || bodyOverrides.phone || null;
  let email = bodyOverrides.email        || null;

  if (!phone) phone = userData.phone || userData.phoneNumber || userData.mobile || null;
  if (!email) email = userData.email  || null;

  if (!phone || !email) {
    try {
      let User;
      try { User = require("../models/user.model"); }
      catch { User = require("../modals/user.modal"); }

      const user = await User.findById(userData.id)
        .select("phone phoneNumber mobile email")
        .lean();

      if (user) {
        if (!phone) phone = user.phone || user.phoneNumber || user.mobile || null;
        if (!email) email = user.email || null;
      }
    } catch (err) {
      console.warn("[Cart] Could not fetch user contact info:", err.message);
    }
  }

  if (phone) {
    phone = String(phone).replace(/\D/g, "");
    if (phone.length === 10) phone = "91" + phone;
  }

  return { phone: phone || null, email: email || null };
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: recalculate price fields when quantity changes
// ─────────────────────────────────────────────────────────────────────────────
const recalcPriceFields = (existingItem, newQty) => {
  const oldQty = existingItem.quantity || existingItem.product_quantity || 1;

  const unitFinalTotal           = oldQty > 0 ? (existingItem.final_total            || 0) / oldQty : 0;
  const unitFinalTotalWithoutGst = oldQty > 0 ? (existingItem.final_total_withoutGst || 0) / oldQty : 0;
  const unitCgst                 = oldQty > 0 ? (existingItem.cgst                   || 0) / oldQty : 0;
  const unitSgst                 = oldQty > 0 ? (existingItem.sgst                   || 0) / oldQty : 0;
  const unitMrpSavings           = oldQty > 0 ? (existingItem.MRP_savings            || 0) / oldQty : 0;
  const unitTotalSavings         = oldQty > 0 ? (existingItem.TotalSavings           || 0) / oldQty : 0;

  return {
    final_total:            parseFloat((unitFinalTotal           * newQty).toFixed(2)),
    final_total_withoutGst: parseFloat((unitFinalTotalWithoutGst * newQty).toFixed(2)),
    cgst:                   parseFloat((unitCgst                 * newQty).toFixed(2)),
    sgst:                   parseFloat((unitSgst                 * newQty).toFixed(2)),
    MRP_savings:            parseFloat((unitMrpSavings           * newQty).toFixed(2)),
    TotalSavings:           parseFloat((unitTotalSavings         * newQty).toFixed(2)),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Add to Cart
//
// Stores TWO delivery charge fields every time:
//   DeliveryCharges   — charge for deliveries within Tamil Nadu
//   out_of_tn_charge  — charge for deliveries outside Tamil Nadu
//
// The frontend always sends both values regardless of where the user's pincode
// is, so the order system always has access to the correct rate for both zones.
// ─────────────────────────────────────────────────────────────────────────────
const addToShoppingCart = async (req, res) => {
  try {
    // ── Identify owner ────────────────────────────────────────────────────────
    let userIdentifier;
    let identifierField;
    let phone = null;
    let email = null;

    const authUserId = req.userData?.id || req.userData?._id || req.userData?.userId || req.user?._id || req.user?.id || req.body.user_id || null;

    if (authUserId) {
      userIdentifier  = String(authUserId);
      identifierField = "user_id";

      const contact = await resolveUserContact(req.userData || { id: authUserId }, req.body);
      phone = contact.phone;
      email = contact.email;
    } else {
      userIdentifier  = req.body.guestId || req.body.GuestId;
      identifierField = "guest_id";

      if (!userIdentifier) {
        return errorResponse(res, "Guest ID is required for guest users");
      }

      phone = req.body.phone_number || req.body.phone || null;
      if (phone) {
        phone = String(phone).replace(/\D/g, "");
        if (phone.length === 10) phone = "91" + phone;
      }
      email = req.body.email || null;
    }

    if (!req.body.product_id) {
      return errorResponse(res, "Product ID is required");
    }

    // ── Fetch Product & Validate ─────────────────────────────────────────────
    let Product;
    try { Product = require("../modals/product.models"); }
    catch { Product = require("../models/product.models"); }

    const product = await Product.findById(req.body.product_id);
    if (!product) {
      return errorResponse(res, "Product not found");
    }
    if (product.is_soldout) {
      return errorResponse(res, "This product is currently out of stock");
    }

    const isPhotoBook =
      product.product_type === "photo_book" ||
      Boolean(product.is_photobook) ||
      Boolean(req.body.is_photobook);

    let validatedDesign = null;

    if (isPhotoBook) {
      const designId =
        req.body.photobook_design_id ||
        req.body.design_id ||
        req.body.designId ||
        req.body.photobook_design_data?.design_id;

      if (!designId) {
        return errorResponse(
          res,
          "Photo Book customization is required. Please design your photo book before adding to cart.",
          400
        );
      }

      let PhotoBookDesign;
      try { PhotoBookDesign = require("../modals/photobook_design.model"); }
      catch { PhotoBookDesign = require("../models/photobook_design.model"); }

      validatedDesign = await PhotoBookDesign.findById(designId);
      if (!validatedDesign) {
        return errorResponse(
          res,
          "Photo Book design session not found. Please save your design first.",
          404
        );
      }

      const guestIdVal = req.body.guestId || req.body.GuestId;
      const callerUserId = authUserId ? String(authUserId) : null;
      const callerGuestId = guestIdVal ? String(guestIdVal).trim() : null;
      const designUserId = validatedDesign.user_id ? String(validatedDesign.user_id) : null;
      const designGuestId = validatedDesign.guest_id ? String(validatedDesign.guest_id) : null;

      // Ownership authorization check
      let isAuthorized = false;
      if (callerUserId && designUserId && callerUserId === designUserId) {
        isAuthorized = true;
      } else if (callerGuestId && designGuestId && callerGuestId === designGuestId) {
        isAuthorized = true;
      } else if (callerUserId && !designUserId) {
        // Logged-in user claiming a guest design
        validatedDesign.user_id = callerUserId;
        isAuthorized = true;
      } else if (callerGuestId && !designGuestId) {
        // Session with guestId matching design
        validatedDesign.guest_id = callerGuestId;
        isAuthorized = true;
      } else if (!callerUserId && !designUserId) {
        // Guest user creating/adding guest design
        isAuthorized = true;
      } else if (callerGuestId && designUserId && !callerUserId) {
        // Design was saved by user, and client browser is continuing with this design
        if (!designGuestId) {
          validatedDesign.guest_id = callerGuestId;
        }
        isAuthorized = true;
      }

      if (!isAuthorized) {
        return errorResponse(
          res,
          "Invalid or unauthorized Photo Book design session. Please save your design first.",
          403
        );
      }

      // Link any missing owner IDs
      if (callerUserId && !validatedDesign.user_id) {
        validatedDesign.user_id = callerUserId;
      }
      if (callerGuestId && !validatedDesign.guest_id) {
        validatedDesign.guest_id = callerGuestId;
      }
      await validatedDesign.save();

      // Re-validate design if not already marked ready_for_cart
      if (validatedDesign.status !== "ready_for_cart" || !validatedDesign.is_complete) {
        let validateDesignInternal;
        try {
          const pbCtrl = require("./photobook.controller");
          validateDesignInternal = pbCtrl.validateDesignInternal;
        } catch (e) {
          // Ignore import error if already present
        }

        if (validateDesignInternal) {
          const validation = validateDesignInternal(validatedDesign, product.photobook_config);
          if (validation.isValid) {
            validatedDesign.status = "ready_for_cart";
            validatedDesign.is_complete = true;
            validatedDesign.validation_errors = [];
            await validatedDesign.save();
          } else {
            const errList = validation.errors?.length
              ? validation.errors.join(". ")
              : "All required pages and photo frames must be designed.";
            return errorResponse(res, `Photo Book design is incomplete: ${errList}`, 400);
          }
        } else {
          const errList = validatedDesign.validation_errors?.length
            ? validatedDesign.validation_errors.join(". ")
            : "All required pages and photo frames must be designed.";
          return errorResponse(res, `Photo Book design is incomplete: ${errList}`, 400);
        }
      }

      // Backend price calculation: Authoritative calculation including GST
      const basePages = product.photobook_config?.default_pages || 20;
      const actualPages = validatedDesign.page_count || basePages;
      const extraPages = Math.max(0, actualPages - basePages);
      const extraPagePrice = Number(product.photobook_config?.price_per_extra_page || 15);
      const extraPagesCost = extraPages * extraPagePrice;
      const basePrice = Number(product.customer_product_price || product.price || 0);
      const unitPrice = basePrice + extraPagesCost;

      const requestedQty = parseInt(req.body.product_quantity || req.body.quantity) || 1;
      const taxableTotal = unitPrice * requestedQty;
      const gstRate = parseFloat(product.GST || product.gst || 18) || 18;
      const taxAmount = Number(((taxableTotal * gstRate) / 100).toFixed(2));
      const computedFinalTotal = Number((taxableTotal + taxAmount).toFixed(2));

      // Authoritative pricing: final_total includes GST, final_total_withoutGst is taxable amount
      req.body.product_price = unitPrice;
      req.body.cgst = Number((gstRate / 2).toFixed(2));
      req.body.sgst = Number((gstRate / 2).toFixed(2));
      req.body.final_total = computedFinalTotal;
      req.body.final_total_withoutGst = taxableTotal;
    }

    // ── Extract both delivery charges from request body ───────────────────────
    // DeliveryCharges  = inside Tamil Nadu rate (sent by frontend always)
    // out_of_tn_charge = outside Tamil Nadu rate (sent by frontend always)
    const incomingDeliveryChargesTN    = Number(req.body.DeliveryCharges   || 0);
    const incomingOutOfTNCharge        = Number(req.body.out_of_tn_charge  || 0);
    // Branding charges: flat, one-time per order for the selected quantity
    // tier (frontend always sends this, same as delivery charges).
    const incomingBrandingCharges      = Number(req.body.BrandingCharges   || 0);

    // ── Check for existing item (same product + variant/design) ──────────────
    const existingItemQuery = {
      [identifierField]: userIdentifier,
      product_id: new mongoose.Types.ObjectId(req.body.product_id),
    };

    if (isPhotoBook && validatedDesign) {
      existingItemQuery.photobook_design_id = validatedDesign._id;
    } else {
      if (req.body.size)  existingItemQuery.size  = req.body.size;
      if (req.body.color) existingItemQuery.color = req.body.color;
    }

    const existingItem = await ShoppingCardSchema.findOne(existingItemQuery);

    let result;

    // Compute photo book size resolution if photobook
    let pbResolvedSize = validatedDesign?.size || "";
    let pbRawSize = String(validatedDesign?.size || req.body.photobook_size || req.body.size || "").trim();
    if (isPhotoBook && validatedDesign) {
      const configSizes = product.photobook_config?.sizes || [];
      const matched = configSizes.find(
        (s) => String(s._id) === pbRawSize || String(s.id) === pbRawSize || String(s.name).toLowerCase() === pbRawSize.toLowerCase()
      );
      if (matched) {
        const w = matched.width_in || matched.width;
        const h = matched.height_in || matched.height;
        pbResolvedSize = (matched.name && w && h) ? `${matched.name} - ${w} x ${h} in` : (matched.name || pbRawSize);
      } else if (pbRawSize.startsWith("size-") || pbRawSize.toLowerCase().includes("a4")) {
        pbResolvedSize = "A4 - 8.27 x 11.69 in";
      } else if (req.body.photobook_size_name) {
        pbResolvedSize = req.body.photobook_size_name;
      }
    }

    if (existingItem) {
      // ── Update existing cart item ─────────────────────────────────────────
      const addedQty = parseInt(req.body.product_quantity || req.body.quantity) || 1;
      const newQty   = existingItem.quantity + addedQty;

      const recalculated = recalcPriceFields(existingItem, newQty);

      existingItem.quantity               = newQty;
      existingItem.product_quantity       = newQty;
      existingItem.final_total            = recalculated.final_total;
      existingItem.final_total_withoutGst = recalculated.final_total_withoutGst;
      existingItem.cgst                   = recalculated.cgst;
      existingItem.sgst                   = recalculated.sgst;
      existingItem.MRP_savings            = recalculated.MRP_savings;
      existingItem.TotalSavings           = recalculated.TotalSavings;
      existingItem.updated_at             = new Date();
      existingItem.reminder_count         = 0;
      existingItem.last_reminder_sent_at  = null;

      // Always update BOTH delivery charge fields so they reflect the latest
      // quantity-tier rates sent from the frontend.
      existingItem.DeliveryCharges   = incomingDeliveryChargesTN;
      existingItem.out_of_tn_charge  = incomingOutOfTNCharge;
      existingItem.BrandingCharges   = incomingBrandingCharges;

      if (phone) existingItem.phone_number = phone;
      if (email) existingItem.email        = email;

      if (req.body.selected_platforms) existingItem.selected_platforms = req.body.selected_platforms;
      if (req.body.platform_links)     existingItem.platform_links     = req.body.platform_links;
      if (req.body.is_photo_frame !== undefined) existingItem.is_photo_frame     = req.body.is_photo_frame;
      if (req.body.photo_frame_details)          existingItem.photo_frame_details = req.body.photo_frame_details;
      if (isPhotoBook && validatedDesign) {
        existingItem.is_photobook = true;
        existingItem.photobook_design_id = validatedDesign._id;
        existingItem.photobook_details = {
          design_id: validatedDesign._id,
          template_id: validatedDesign.template_id,
          template_name: validatedDesign.template_name,
          template_version: validatedDesign.template_version,
          size: pbResolvedSize,
          size_name: pbResolvedSize,
          size_id: pbRawSize,
          variant: validatedDesign.variant,
          page_count: validatedDesign.page_count,
          cover_image: validatedDesign.cover_image,
          total_photos_used: validatedDesign.uploaded_images?.length || 0,
          pricing: validatedDesign.pricing,
          status: validatedDesign.status,
        };
        if (req.body.photobook_design_data) {
          existingItem.photobook_design_data = req.body.photobook_design_data;
        }
      }

      result = await existingItem.save();

    } else {
      // ── Create new cart item ──────────────────────────────────────────────
      const cartItem = {
        [identifierField]:        userIdentifier,
        product_id:               new mongoose.Types.ObjectId(req.body.product_id),
        quantity:                 parseInt(req.body.product_quantity || req.body.quantity) || 1,
        product_quantity:         parseInt(req.body.product_quantity || req.body.quantity) || 1,
        product_price:            req.body.product_price          || 0,
        product_name:             req.body.product_name           || "Product",
        product_image:            (validatedDesign?.cover_image) || req.body.product_image || "",
        product_seo_url:          req.body.product_seo_url        || "",
        product_design_file:      (validatedDesign?.cover_image) || req.body.product_design_file || "",
        category_name:            req.body.category_name          || "",
        subcategory_name:         req.body.subcategory_name       || "",
        final_total:              req.body.final_total            || 0,
        final_total_withoutGst:   req.body.final_total_withoutGst || 0,
        cgst:                     req.body.cgst                   || 0,
        sgst:                     req.body.sgst                   || 0,
        MRP_savings:              req.body.MRP_savings            || 0,
        TotalSavings:             req.body.TotalSavings           || 0,
        FreeDelivery:             req.body.FreeDelivery           || false,
        noCustomtation:           req.body.noCustomtation         || false,
        // ── Dual delivery charges ─────────────────────────────────────────
        DeliveryCharges:          incomingDeliveryChargesTN,   // inside Tamil Nadu
        out_of_tn_charge:         incomingOutOfTNCharge,       // outside Tamil Nadu
        BrandingCharges:          incomingBrandingCharges,     // flat, one-time per order
        // ─────────────────────────────────────────────────────────────────
        is_photobook:             Boolean(isPhotoBook),
        photobook_design_id:      validatedDesign ? validatedDesign._id : null,
        photobook_details:        validatedDesign ? {
          design_id: validatedDesign._id,
          template_id: validatedDesign.template_id,
          template_name: validatedDesign.template_name,
          template_version: validatedDesign.template_version,
          size: pbResolvedSize,
          size_name: pbResolvedSize,
          size_id: pbRawSize,
          variant: validatedDesign.variant,
          page_count: validatedDesign.page_count,
          cover_image: validatedDesign.cover_image,
          total_photos_used: validatedDesign.uploaded_images?.length || 0,
          pricing: validatedDesign.pricing,
          status: validatedDesign.status,
        } : null,
        photobook_design_data:    req.body.photobook_design_data  || null,
        is_qr_product:            req.body.is_qr_product          || false,
        selected_platforms:       req.body.selected_platforms     || [],
        platform_links:           req.body.platform_links         || {},
        is_photo_frame:           req.body.is_photo_frame         || false,
        photo_frame_details:      req.body.photo_frame_details    || {},
        ...(req.body.size             && { size:             req.body.size }),
        ...(req.body.color            && { color:            req.body.color }),
        ...(req.body.instructions     && { instructions:     req.body.instructions }),
        ...(req.body.product_variants && { product_variants: req.body.product_variants }),
        phone_number:             phone,
        email:                    email,
        reminder_count:           0,
        last_reminder_sent_at:    null,
        created_at:               new Date(),
        updated_at:               new Date(),
      };

      result = await ShoppingCardSchema.create(cartItem);
    }

    const cartCount = await ShoppingCardSchema.countDocuments({
      [identifierField]: userIdentifier,
    });

    return successResponse(res, "Product added to cart successfully", {
      data: result,
      cartCount,
      guestId: !req.userData ? userIdentifier : undefined,
    });

  } catch (err) {
    console.error("Add to cart error:", err);
    return errorResponse(res, "Error adding to shopping cart");
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Get My Cart
// ─────────────────────────────────────────────────────────────────────────────
const getMyShoppingCart = async (req, res) => {
  try {
    let userIdentifier;
    let identifierField;

    if (req.userData && req.userData.id) {
      userIdentifier  = new mongoose.Types.ObjectId(req.userData.id);
      identifierField = "user_id";
    } else {
      userIdentifier  = req.query.guestId;
      identifierField = "guest_id";

      if (!userIdentifier) {
        return errorResponse(res, "Guest ID is required for guest users");
      }
    }

    const result = await ShoppingCardSchema.aggregate([
      { $match: { [identifierField]: userIdentifier } },
      {
        $lookup: {
          from:         "products",
          localField:   "product_id",
          foreignField: "_id",
          as:           "product_details",
        },
      },
      {
        $unwind: {
          path:                       "$product_details",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id:                    1,
          product_id:             1,
          product_design_file:    1,
          FreeDelivery:           1,
          noCustomtation:         1,
          DeliveryCharges:        1,   // inside TN
          out_of_tn_charge:       1,   // outside TN
          BrandingCharges:        1,   // flat, one-time per order
          product_image:          1,
          product_name:           1,
          category_name:          1,
          subcategory_name:       1,
          product_price:          1,
          MRP_savings:            1,
          TotalSavings:           1,
          product_quantity:       1,
          product_seo_url:        1,
          product_variants:       1,
          sgst:                   1,
          cgst:                   1,
          final_total:            1,
          final_total_withoutGst: 1,
          quantity:               1,
          size:                   1,
          color:                  1,
          instructions:           1,
          is_qr_product:          1,
          selected_platforms:     1,
          platform_links:         1,
          is_photo_frame:         1,
          photo_frame_details:    1,
          is_photobook:           1,
          photobook_design_id:    1,
          photobook_details:      1,
          photobook_design_data:  1,
          photobook_config:       "$product_details.photobook_config",
          phone_number:           1,
          email:                  1,
          createdAt:              "$created_at",
          updatedAt:              "$updated_at",
          __v:                    1,
        },
      },
    ]);

    const transformedResult = result.map((item) => {
      let photobookDetails = item.photobook_details || null;
      const configSizes = item.photobook_config?.sizes || [];
      if (photobookDetails && photobookDetails.size) {
        const rawSize = String(photobookDetails.size).trim();
        const matched = configSizes.find(
          (s) => String(s._id) === rawSize || String(s.id) === rawSize || String(s.name).toLowerCase() === rawSize.toLowerCase()
        );
        if (matched) {
          const w = matched.width_in || matched.width;
          const h = matched.height_in || matched.height;
          const formatted = (matched.name && w && h)
            ? `${matched.name} - ${w} x ${h} in`
            : (matched.name || rawSize);
          photobookDetails = {
            ...photobookDetails,
            size: formatted,
            size_name: formatted,
            size_id: rawSize,
          };
        } else if (rawSize.startsWith("size-") || rawSize.toLowerCase().includes("a4")) {
          const formatted = "A4 - 8.27 x 11.69 in";
          photobookDetails = {
            ...photobookDetails,
            size: formatted,
            size_name: formatted,
            size_id: rawSize,
          };
        }
      }

      let itemFinalTotal = Number(item.final_total || 0);
      let itemFinalTotalWithoutGst = Number(item.final_total_withoutGst || 0);
      let itemCgst = item.cgst !== undefined && item.cgst !== null ? Number(item.cgst) : 0;
      let itemSgst = item.sgst !== undefined && item.sgst !== null ? Number(item.sgst) : 0;

      if (item.is_photobook && (itemCgst === 0 || itemFinalTotal === itemFinalTotalWithoutGst)) {
        const gstRate = parseFloat(item.photobook_config?.GST || item.photobook_config?.gst || 18) || 18;
        const taxable = itemFinalTotalWithoutGst > 0 ? itemFinalTotalWithoutGst : itemFinalTotal > 0 ? itemFinalTotal : (Number(item.product_price || 0) * (item.quantity || 1));
        const tax = Number(((taxable * gstRate) / 100).toFixed(2));
        itemFinalTotalWithoutGst = taxable;
        itemFinalTotal = Number((taxable + tax).toFixed(2));
        itemCgst = Number((gstRate / 2).toFixed(2));
        itemSgst = Number((gstRate / 2).toFixed(2));
      }

      return {
        _id:                    item._id,
        product_id:             item.product_id,
        product_design_file:    item.product_design_file    || "",
        FreeDelivery:           item.FreeDelivery            || false,
        noCustomtation:         item.noCustomtation          || false,
        DeliveryCharges:        item.DeliveryCharges         || 0,    // inside TN
        out_of_tn_charge:       item.out_of_tn_charge        || 0,    // outside TN
        BrandingCharges:        item.BrandingCharges         || 0,    // flat, one-time per order
        product_image:          item.product_image           || "",
        product_name:           item.product_name            || "",
        category_name:          item.category_name           || "",
        subcategory_name:       item.subcategory_name        || "",
        product_price:          item.product_price           || 0,
        MRP_savings:            typeof item.MRP_savings  === "number" ? item.MRP_savings.toFixed(2)  : "0.00",
        TotalSavings:           typeof item.TotalSavings === "number" ? item.TotalSavings.toFixed(2) : "0.00",
        product_quantity:       item.product_quantity ? item.product_quantity.toString() : "1",
        product_seo_url:        item.product_seo_url         || "",
        product_variants:       item.product_variants        || [],
        sgst:                   itemSgst.toString(),
        cgst:                   itemCgst.toString(),
        final_total:            itemFinalTotal,
        final_total_withoutGst: itemFinalTotalWithoutGst,
        quantity:               item.quantity                || 1,
        size:                   item.size                    || null,
        color:                  item.color                   || null,
        instructions:           item.instructions            || null,
        is_qr_product:          item.is_qr_product           || false,
        selected_platforms:     item.selected_platforms      || [],
        platform_links:         item.platform_links          || {},
        is_photo_frame:         item.is_photo_frame          || false,
        photo_frame_details:    item.photo_frame_details     || {},
        is_photobook:           item.is_photobook           || false,
        photobook_design_id:    item.photobook_design_id    || null,
        photobook_details:      photobookDetails,
        photobook_design_data:  item.photobook_design_data  || null,
        photobook_config:       item.photobook_config       || null,
        phone_number:           item.phone_number            || null,
        email:                  item.email                   || null,
        createdAt:              item.createdAt,
        updatedAt:              item.updatedAt,
        __v:                    item.__v || 0,
      };
    });

    return res.status(200).json({ message: "", data: transformedResult });

  } catch (err) {
    console.error("Get cart error:", err);
    return res.status(500).json({ message: "Error fetching shopping cart", data: [] });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Remove Cart Items
// ─────────────────────────────────────────────────────────────────────────────
const removeMyShoppingCart = async (req, res) => {
  try {
    const { ids, guestId } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, "No cart items provided for removal");
    }

    let userIdentifier;
    let identifierField;

    if (req.userData && req.userData.id) {
      userIdentifier  = req.userData.id;
      identifierField = "user_id";
    } else {
      userIdentifier  = guestId;
      identifierField = "guest_id";
      if (!userIdentifier) return errorResponse(res, "Guest ID is required for guest users");
    }

    await ShoppingCardSchema.deleteMany({
      _id:               { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
      [identifierField]: userIdentifier,
    });

    return res.status(200).json({ message: "Products removed from shopping cart", data: [] });

  } catch (err) {
    console.error("Remove cart error:", err);
    return res.status(500).json({ message: "Failed to remove products from shopping cart", data: [] });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Update Cart Item Quantity
// ─────────────────────────────────────────────────────────────────────────────
const updateCartItemQuantity = async (req, res) => {
  try {
    const { itemId, quantity, guestId } = req.body;

    if (!itemId || quantity === undefined) {
      return res.status(400).json({ message: "Item ID and quantity are required", data: [] });
    }

    let userIdentifier;
    let identifierField;

    if (req.userData && req.userData.id) {
      userIdentifier  = req.userData.id;
      identifierField = "user_id";
    } else {
      userIdentifier  = guestId;
      identifierField = "guest_id";
      if (!userIdentifier) {
        return res.status(400).json({ message: "Guest ID is required for guest users", data: [] });
      }
    }

    if (quantity === 0) {
      await ShoppingCardSchema.findOneAndDelete({
        _id:               new mongoose.Types.ObjectId(itemId),
        [identifierField]: userIdentifier,
      });
      return res.status(200).json({ message: "Item removed from cart", data: [] });
    }

    const cartItem = await ShoppingCardSchema.findOne({
      _id:               new mongoose.Types.ObjectId(itemId),
      [identifierField]: userIdentifier,
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found", data: [] });
    }

    const safeQty      = Math.max(1, quantity);
    const recalculated = recalcPriceFields(cartItem, safeQty);

    // Note: delivery charges (DeliveryCharges + out_of_tn_charge) and
    // BrandingCharges are NOT recalculated here — they are per-order flat
    // rates, not per-unit. They were already set when the item was added /
    // last updated from frontend.
    const updatedItem = await ShoppingCardSchema.findByIdAndUpdate(
      cartItem._id,
      {
        quantity:               safeQty,
        product_quantity:       safeQty,
        final_total:            recalculated.final_total,
        final_total_withoutGst: recalculated.final_total_withoutGst,
        cgst:                   recalculated.cgst,
        sgst:                   recalculated.sgst,
        MRP_savings:            recalculated.MRP_savings,
        TotalSavings:           recalculated.TotalSavings,
        reminder_count:         0,
        last_reminder_sent_at:  null,
      },
      { new: true },
    );

    return res.status(200).json({ message: "Cart item updated successfully", data: [updatedItem] });

  } catch (err) {
    console.error("Update cart error:", err);
    return res.status(500).json({ message: "Error updating cart item", data: [] });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Merge Guest Cart → User Cart (after login)
// ─────────────────────────────────────────────────────────────────────────────
const mergeCartsAfterLogin = async (req, res) => {
  try {
    const userId      = req.userData?.id;
    const { guestId } = req.body;

    if (!userId)  return res.status(400).json({ message: "User ID is required",  data: [] });
    if (!guestId) return res.status(400).json({ message: "Guest ID is required", data: [] });

    const contact        = await resolveUserContact(req.userData, req.body);
    const guestCartItems = await ShoppingCardSchema.find({ guest_id: guestId });

    for (const guestItem of guestCartItems) {
      const existingQuery = { user_id: userId, product_id: guestItem.product_id };
      if (guestItem.size)  existingQuery.size  = guestItem.size;
      if (guestItem.color) existingQuery.color = guestItem.color;

      const existingUserItem = await ShoppingCardSchema.findOne(existingQuery);

      if (existingUserItem) {
        const newQty       = existingUserItem.quantity + guestItem.quantity;
        const recalculated = recalcPriceFields(existingUserItem, newQty);

        existingUserItem.quantity               = newQty;
        existingUserItem.product_quantity       = newQty;
        existingUserItem.final_total            = recalculated.final_total;
        existingUserItem.final_total_withoutGst = recalculated.final_total_withoutGst;
        existingUserItem.cgst                   = recalculated.cgst;
        existingUserItem.sgst                   = recalculated.sgst;
        existingUserItem.MRP_savings            = recalculated.MRP_savings;
        existingUserItem.TotalSavings           = recalculated.TotalSavings;
        existingUserItem.updated_at             = new Date();
        existingUserItem.reminder_count         = 0;
        existingUserItem.last_reminder_sent_at  = null;

        // Carry over both delivery charges from the guest item if they exist
        if (guestItem.DeliveryCharges  !== undefined) existingUserItem.DeliveryCharges  = guestItem.DeliveryCharges;
        if (guestItem.out_of_tn_charge !== undefined) existingUserItem.out_of_tn_charge = guestItem.out_of_tn_charge;
        if (guestItem.BrandingCharges  !== undefined) existingUserItem.BrandingCharges  = guestItem.BrandingCharges;

        if (contact.phone) existingUserItem.phone_number = contact.phone;
        if (contact.email) existingUserItem.email        = contact.email;

        if (guestItem.is_photo_frame)      existingUserItem.is_photo_frame      = guestItem.is_photo_frame;
        if (guestItem.photo_frame_details) existingUserItem.photo_frame_details = guestItem.photo_frame_details;

        await existingUserItem.save();
        await ShoppingCardSchema.findByIdAndDelete(guestItem._id);
      } else {
        await ShoppingCardSchema.findByIdAndUpdate(guestItem._id, {
          user_id:               userId,
          guest_id:              null,
          phone_number:          contact.phone || guestItem.phone_number,
          email:                 contact.email || guestItem.email,
          updated_at:            new Date(),
          reminder_count:        0,
          last_reminder_sent_at: null,
        });
      }
    }

    const updatedCart = await ShoppingCardSchema.find({ user_id: userId });
    return res.status(200).json({ message: "Cart merged successfully", data: updatedCart });

  } catch (err) {
    console.error("Merge cart error:", err);
    return res.status(500).json({ message: "Error merging carts", data: [] });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Backfill missing phone/email on existing cart items
// ─────────────────────────────────────────────────────────────────────────────
const backfillCartContacts = async (req, res) => {
  try {
    let User;
    try { User = require("../models/user.model"); }
    catch { User = require("../modals/user.modal"); }

    const itemsMissingContact = await ShoppingCardSchema.find({
      user_id: { $ne: null },
      $or: [
        { phone_number: null },
        { phone_number: { $exists: false } },
        { email: null },
        { email: { $exists: false } },
      ],
    }).lean();

    console.log(`[Backfill] Found ${itemsMissingContact.length} cart items missing contact info`);

    const userIds = [...new Set(itemsMissingContact.map((i) => String(i.user_id)))];
    let updated = 0;

    for (const userId of userIds) {
      try {
        const user = await User.findById(userId).select("phone phoneNumber mobile email").lean();
        if (!user) continue;

        let phone = user.phone || user.phoneNumber || user.mobile || null;
        let email = user.email || null;

        if (phone) {
          phone = String(phone).replace(/\D/g, "");
          if (phone.length === 10) phone = "91" + phone;
        }

        if (!phone && !email) continue;

        const updateFields = {};
        if (phone) updateFields.phone_number = phone;
        if (email) updateFields.email        = email;

        const r = await ShoppingCardSchema.updateMany(
          { user_id: userId, $or: [{ phone_number: null }, { email: null }] },
          { $set: updateFields },
        );
        updated += r.modifiedCount;
      } catch (err) {
        console.warn(`[Backfill] Failed for user ${userId}:`, err.message);
      }
    }

    return res.status(200).json({
      message: `Backfill complete. Updated ${updated} cart items across ${userIds.length} users.`,
      data:    { updated, usersProcessed: userIds.length },
    });

  } catch (err) {
    console.error("[Backfill] Error:", err);
    return res.status(500).json({ message: "Backfill failed", data: [] });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Guest ID Validation Middleware
// ─────────────────────────────────────────────────────────────────────────────
const validateGuestId = (req, res, next) => {
  if (!req.userData && !req.body.guestId && !req.query.guestId) {
    return res.status(400).json({ message: "Guest ID is required for guest operations", data: [] });
  }
  next();
};

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  addToShoppingCart,
  getMyShoppingCart,
  removeMyShoppingCart,
  updateCartItemQuantity,
  mergeCartsAfterLogin,
  backfillCartContacts,
  validateGuestId,
};