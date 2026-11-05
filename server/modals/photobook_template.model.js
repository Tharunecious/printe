const mongoose = require("mongoose");

const elementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ["photo_frame", "text", "decoration"],
      required: true,
    },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    width: { type: Number, default: 200 },
    height: { type: Number, default: 200 },
    rotation: { type: Number, default: 0 },
    z_index: { type: Number, default: 1 },
    is_locked: { type: Boolean, default: false },
    is_hidden: { type: Boolean, default: false },

    // Photo frame specifics
    frame_id: { type: String },
    shape: {
      type: String,
      enum: ["rectangle", "circle", "heart", "star", "scallop", "hexagon", "arch"],
      default: "rectangle",
    },
    fit_mode: {
      type: String,
      enum: ["cover", "contain"],
      default: "cover",
    },
    border: {
      width: { type: Number, default: 0 },
      color: { type: String, default: "#000000" },
      radius: { type: Number, default: 0 },
    },
    shadow: {
      blur: { type: Number, default: 0 },
      color: { type: String, default: "rgba(0,0,0,0.15)" },
      offsetX: { type: Number, default: 0 },
      offsetY: { type: Number, default: 0 },
    },
    is_required: { type: Boolean, default: true },
    custom_svg_path: { type: String, default: "" },
    test_image_url: { type: String, default: "" },
    crop: {
      zoom: { type: Number, default: 1 },
      offsetX: { type: Number, default: 0 },
      offsetY: { type: Number, default: 0 },
    },

    // Text specifics
    content: { type: String, default: "" },
    font_family: { type: String, default: "Inter" },
    font_size: { type: Number, default: 24 },
    font_weight: { type: String, default: "normal" },
    font_style: { type: String, default: "normal" },
    color: { type: String, default: "#1f2937" },
    align: {
      type: String,
      enum: ["left", "center", "right"],
      default: "center",
    },
    is_customer_editable: { type: Boolean, default: true },
    letter_spacing: { type: Number, default: 0 },
    line_height: { type: Number, default: 1.2 },

    // Decoration specifics
    preset_id: { type: String, default: "" },
    name: { type: String, default: "" },
    svg: { type: String, default: "" },
    asset_url: { type: String, default: "" },
    asset_type: { type: String, enum: ["svg", "png"], default: "svg" },
    opacity: { type: Number, default: 1 },
    tint: { type: String, default: "" },
  },
  { _id: false, strict: false }
);

const targetingRuleSchema = new mongoose.Schema(
  {
    rule_type: {
      type: String,
      enum: [
        "exact_page",
        "odd_interior",
        "even_interior",
        "all_interior",
        "all_pages",
      ],
      default: "all_interior",
    },
    page_number: { type: Number, default: 1 },
  },
  { _id: false }
);

const backgroundSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["color", "image", "gradient"],
      default: "color",
    },
    value: { type: String, default: "#ffffff" },
    opacity: { type: Number, default: 1 },
    position_x: { type: Number, default: 50 },
    position_y: { type: Number, default: 50 },
    scale: { type: Number, default: 1 },
    fit_mode: { type: String, default: "cover" },
  },
  { _id: false, strict: false }
);

const pageSchema = new mongoose.Schema(
  {
    page_id: { type: String, required: true },
    name: { type: String, default: "Page" },
    page_type: {
      type: String,
      enum: ["front_cover", "back_cover", "interior", "blank"],
      default: "interior",
    },
    is_blank: { type: Boolean, default: false },
    targeting_rule: { type: targetingRuleSchema, default: () => ({}) },
    background: { type: backgroundSchema, default: () => ({}) },
    elements: [elementSchema],
  },
  { _id: false, strict: false }
);

const photoBookTemplateSchema = new mongoose.Schema(
  {
    template_name: { type: String, required: true, trim: true },
    template_id: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      default: "General",
    },
    badge: { type: String, default: "" },
    cover_image_url: { type: String, default: "" },
    thumbnail_url: { type: String, default: "" },
    storefront_visibility: { type: Boolean, default: true },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      default: null,
    },
    product_template_id: { type: String, default: "" },
    include_blank_page: { type: Boolean, default: false },
    is_giveaway: { type: Boolean, default: false },
    exact_pages: { type: Number, default: 0 },
    supported_sizes: {
      type: [String],
      default: ["8x8", "10x10", "12x12"],
    },
    page_config: {
      min_pages: { type: Number, default: 10 },
      max_pages: { type: Number, default: 60 },
      default_pages: { type: Number, default: 20 },
      aspect_ratio: { type: String, default: "1:1" },
      include_blank_page: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    version: { type: Number, default: 1 },
    published_version: { type: Number, default: 0 },
    published_snapshot: { type: mongoose.Schema.Types.Mixed, default: null },
    eligible_product_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
      },
    ],
    pages: [pageSchema],
  },
  {
    collection: "photobook_templates",
    timestamps: true,
  }
);

module.exports = mongoose.model("photobook_template", photoBookTemplateSchema);
