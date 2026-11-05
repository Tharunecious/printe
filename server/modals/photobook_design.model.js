const mongoose = require("mongoose");

const photoPlacementSchema = new mongoose.Schema(
  {
    frame_id: { type: String, required: true },
    photo_url: { type: String, default: "" },
    photo_name: { type: String, default: "" },
    shape: {
      type: String,
      enum: ["rectangle", "circle", "heart", "star", "scallop", "hexagon", "arch"],
      default: "rectangle",
    },
    fit_mode: { type: String, enum: ["cover", "contain"], default: "cover" },
    crop: {
      zoom: { type: Number, default: 1 },
      offsetX: { type: Number, default: 0 },
      offsetY: { type: Number, default: 0 },
    },
    rotation: { type: Number, default: 0 },
    is_required: { type: Boolean, default: true },
  },
  { _id: false }
);

const textPlacementSchema = new mongoose.Schema(
  {
    element_id: { type: String, required: true },
    content: { type: String, default: "" },
    font_family: { type: String, default: "Inter" },
    font_size: { type: Number, default: 24 },
    color: { type: String, default: "#1f2937" },
    align: { type: String, default: "center" },
    is_required: { type: Boolean, default: false },
  },
  { _id: false }
);

const pageDesignSchema = new mongoose.Schema(
  {
    page_number: { type: mongoose.Schema.Types.Mixed, default: 0 },
    page_id: { type: String },
    name: { type: String },
    display_label: { type: String },
    page_type: {
      type: String,
      default: "interior",
    },
    is_blank: { type: Boolean, default: false },
    layout_id: { type: String, default: "1-full" },
    background: { type: mongoose.Schema.Types.Mixed, default: () => ({}) },
    photo_frames: [photoPlacementSchema],
    text_elements: [textPlacementSchema],
    elements: [mongoose.Schema.Types.Mixed],
    is_complete: { type: Boolean, default: false },
  },
  { _id: false, strict: false }
);

const photoBookDesignSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
      index: true,
    },
    guest_id: { type: String, default: null, index: true },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
      index: true,
    },

    // Selected options
    size: { type: String, default: "8x8" },
    variant: { type: String, default: "Standard" },
    cover_finish: { type: String, default: "Matte" },
    options: { type: mongoose.Schema.Types.Mixed, default: {} },
    page_count: { type: Number, required: true, default: 20 },
    is_giveaway: { type: Boolean, default: false },
    target_photo_count: { type: Number, default: 0 },
    photos_per_page_mode: { type: String, default: "template" },

    // Template reference
    template_id: { type: String, default: "" },
    template_name: { type: String, default: "" },
    template_version: { type: Number, default: 1 },

    // Uploaded images inventory (urls stored on S3)
    uploaded_images: [
      {
        url: { type: String, required: true },
        fileName: { type: String, default: "" },
        uploaded_at: { type: Date, default: Date.now },
      },
    ],

    // Complete page designs
    pages: [pageDesignSchema],

    // Separate cover designs
    front_cover: { type: mongoose.Schema.Types.Mixed, default: null },
    back_cover: { type: mongoose.Schema.Types.Mixed, default: null },

    // Lifecycle: draft -> editing -> ready_for_cart
    status: {
      type: String,
      enum: ["draft", "editing", "ready_for_cart"],
      default: "draft",
      index: true,
    },
    is_complete: { type: Boolean, default: false },
    validation_errors: [{ type: String }],

    // Cover image preview for cart/order thumbnail
    cover_image: { type: String, default: "" },

    // Price snapshot computed at design save time
    pricing: {
      base_pages: { type: Number, default: 20 },
      base_price: { type: Number, default: 0 },
      extra_pages: { type: Number, default: 0 },
      price_per_extra_page: { type: Number, default: 0 },
      extra_pages_cost: { type: Number, default: 0 },
      calculated_total: { type: Number, default: 0 },
    },
  },
  {
    collection: "photobook_designs",
    timestamps: true,
  }
);

// Compound index for user/guest lookups
photoBookDesignSchema.index({ user_id: 1, product_id: 1, status: 1 });
photoBookDesignSchema.index({ guest_id: 1, product_id: 1, status: 1 });

module.exports = mongoose.model("photobook_design", photoBookDesignSchema);
