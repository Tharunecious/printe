const mongoose = require("mongoose");
const PhotoBookTemplate = require("../modals/photobook_template.model");
const PhotoBookLayout = require("../modals/photobook_layout.model");
const PhotoBookDesign = require("../modals/photobook_design.model");
const Product = require("../modals/product.models");
const { successResponse, errorResponse } = require("../helper/response.helper");
const { v4: uuidv4 } = require("uuid");

// Default initial pages for a new template
const createInitialPages = () => [
  {
    page_id: uuidv4(),
    name: "Front Cover",
    page_type: "front_cover",
    targeting_rule: { rule_type: "exact_page", page_number: 1 },
    background: { type: "color", value: "#1e1e2d", opacity: 1 },
    elements: [
      {
        id: uuidv4(),
        type: "photo_frame",
        frame_id: "cover_frame_1",
        shape: "rectangle",
        x: 100,
        y: 100,
        width: 800,
        height: 600,
        rotation: 0,
        z_index: 1,
        fit_mode: "cover",
        border: { width: 0, color: "#ffffff", radius: 8 },
        shadow: { blur: 16, color: "rgba(0,0,0,0.25)", offsetX: 0, offsetY: 8 },
        is_required: true,
        crop: { zoom: 1, offsetX: 0, offsetY: 0 },
      },
      {
        id: uuidv4(),
        type: "text",
        content: "OUR BEAUTIFUL MEMORIES",
        font_family: "Playfair Display",
        font_size: 42,
        font_weight: "bold",
        font_style: "normal",
        color: "#ffffff",
        align: "center",
        x: 100,
        y: 750,
        width: 800,
        height: 70,
        rotation: 0,
        z_index: 2,
        is_customer_editable: true,
        placeholder: "Book Title",
      },
      {
        id: uuidv4(),
        type: "text",
        content: "A Story of Love & Joy",
        font_family: "Inter",
        font_size: 22,
        font_weight: "normal",
        font_style: "italic",
        color: "#cbd5e1",
        align: "center",
        x: 100,
        y: 830,
        width: 800,
        height: 40,
        rotation: 0,
        z_index: 3,
        is_customer_editable: true,
        placeholder: "Subtitle",
      },
    ],
  },
  {
    page_id: uuidv4(),
    name: "Interior - All Pages Default",
    page_type: "interior",
    targeting_rule: { rule_type: "all_interior", page_number: 2 },
    background: { type: "color", value: "#f8fafc", opacity: 1 },
    elements: [
      {
        id: uuidv4(),
        type: "photo_frame",
        frame_id: "interior_frame_1",
        shape: "rectangle",
        x: 80,
        y: 80,
        width: 840,
        height: 750,
        rotation: 0,
        z_index: 1,
        fit_mode: "cover",
        border: { width: 1, color: "#e2e8f0", radius: 6 },
        shadow: { blur: 8, color: "rgba(0,0,0,0.08)", offsetX: 0, offsetY: 4 },
        is_required: true,
        crop: { zoom: 1, offsetX: 0, offsetY: 0 },
      },
      {
        id: uuidv4(),
        type: "text",
        content: "Special Moment Captured",
        font_family: "Inter",
        font_size: 20,
        font_weight: "normal",
        font_style: "normal",
        color: "#64748b",
        align: "center",
        x: 100,
        y: 870,
        width: 800,
        height: 40,
        rotation: 0,
        z_index: 2,
        is_customer_editable: true,
        placeholder: "Caption text...",
      },
    ],
  },
  {
    page_id: uuidv4(),
    name: "Interior - 2 Photo Collage",
    page_type: "interior",
    targeting_rule: { rule_type: "odd_interior", page_number: 3 },
    background: { type: "color", value: "#ffffff", opacity: 1 },
    elements: [
      {
        id: uuidv4(),
        type: "photo_frame",
        frame_id: "interior_frame_left",
        shape: "rectangle",
        x: 60,
        y: 100,
        width: 410,
        height: 600,
        rotation: 0,
        z_index: 1,
        fit_mode: "cover",
        border: { width: 0, color: "#ffffff", radius: 4 },
        shadow: { blur: 10, color: "rgba(0,0,0,0.1)", offsetX: 0, offsetY: 4 },
        is_required: true,
        crop: { zoom: 1, offsetX: 0, offsetY: 0 },
      },
      {
        id: uuidv4(),
        type: "photo_frame",
        frame_id: "interior_frame_right",
        shape: "rectangle",
        x: 530,
        y: 100,
        width: 410,
        height: 600,
        rotation: 0,
        z_index: 2,
        fit_mode: "cover",
        border: { width: 0, color: "#ffffff", radius: 4 },
        shadow: { blur: 10, color: "rgba(0,0,0,0.1)", offsetX: 0, offsetY: 4 },
        is_required: true,
        crop: { zoom: 1, offsetX: 0, offsetY: 0 },
      },
      {
        id: uuidv4(),
        type: "text",
        content: "Cherished Memories Together",
        font_family: "Playfair Display",
        font_size: 24,
        font_weight: "bold",
        font_style: "normal",
        color: "#334155",
        align: "center",
        x: 100,
        y: 780,
        width: 800,
        height: 50,
        rotation: 0,
        z_index: 3,
        is_customer_editable: true,
        placeholder: "Story caption...",
      },
    ],
  },
  {
    page_id: uuidv4(),
    name: "Back Cover",
    page_type: "back_cover",
    targeting_rule: { rule_type: "exact_page", page_number: 20 },
    background: { type: "color", value: "#1e1e2d", opacity: 1 },
    elements: [
      {
        id: uuidv4(),
        type: "photo_frame",
        frame_id: "back_frame_1",
        shape: "circle",
        x: 350,
        y: 280,
        width: 300,
        height: 300,
        rotation: 0,
        z_index: 1,
        fit_mode: "cover",
        border: { width: 4, color: "#ffffff", radius: 150 },
        shadow: { blur: 16, color: "rgba(0,0,0,0.3)", offsetX: 0, offsetY: 8 },
        is_required: false,
        crop: { zoom: 1, offsetX: 0, offsetY: 0 },
      },
      {
        id: uuidv4(),
        type: "text",
        content: "Until Next Time",
        font_family: "Playfair Display",
        font_size: 32,
        font_weight: "bold",
        font_style: "italic",
        color: "#ffffff",
        align: "center",
        x: 100,
        y: 650,
        width: 800,
        height: 60,
        rotation: 0,
        z_index: 2,
        is_customer_editable: true,
        placeholder: "Closing Words",
      },
      {
        id: uuidv4(),
        type: "text",
        content: "Crafted with love • Printe Books",
        font_family: "Inter",
        font_size: 16,
        font_weight: "normal",
        font_style: "normal",
        color: "#94a3b8",
        align: "center",
        x: 100,
        y: 880,
        width: 800,
        height: 30,
        rotation: 0,
        z_index: 3,
        is_customer_editable: false,
        placeholder: "Publisher",
      },
    ],
  },
];

// System layout presets for bootstrapping
const SYSTEM_LAYOUT_PRESETS = [
  {
    layout_id: "layout_1_full",
    layout_name: "1 Full Photo",
    category: "1-photo",
    photo_count: 1,
    supported_sizes: ["8x8", "10x10", "12x12", "8.5x11"],
    page_types: ["interior", "front_cover", "back_cover"],
    is_system_preset: true,
    frames: [
      {
        id: "frame_1",
        shape: "rectangle",
        x: 60,
        y: 60,
        width: 880,
        height: 880,
        rotation: 0,
        fit_mode: "cover",
        border: { width: 0, color: "#ffffff", radius: 4 },
      },
    ],
  },
  {
    layout_id: "layout_2_vertical",
    layout_name: "2 Side-by-Side Photos",
    category: "2-photo",
    photo_count: 2,
    supported_sizes: ["8x8", "10x10", "12x12"],
    page_types: ["interior"],
    is_system_preset: true,
    frames: [
      {
        id: "frame_1",
        shape: "rectangle",
        x: 50,
        y: 80,
        width: 420,
        height: 840,
        rotation: 0,
        fit_mode: "cover",
        border: { width: 0, color: "#ffffff", radius: 4 },
      },
      {
        id: "frame_2",
        shape: "rectangle",
        x: 530,
        y: 80,
        width: 420,
        height: 840,
        rotation: 0,
        fit_mode: "cover",
        border: { width: 0, color: "#ffffff", radius: 4 },
      },
    ],
  },
  {
    layout_id: "layout_2_horizontal",
    layout_name: "2 Stacked Photos",
    category: "2-photo",
    photo_count: 2,
    supported_sizes: ["8x8", "10x10", "12x12"],
    page_types: ["interior"],
    is_system_preset: true,
    frames: [
      {
        id: "frame_1",
        shape: "rectangle",
        x: 80,
        y: 50,
        width: 840,
        height: 420,
        rotation: 0,
        fit_mode: "cover",
        border: { width: 0, color: "#ffffff", radius: 4 },
      },
      {
        id: "frame_2",
        shape: "rectangle",
        x: 80,
        y: 530,
        width: 840,
        height: 420,
        rotation: 0,
        fit_mode: "cover",
        border: { width: 0, color: "#ffffff", radius: 4 },
      },
    ],
  },
  {
    layout_id: "layout_3_mixed",
    layout_name: "1 Hero + 2 Stacked",
    category: "3-photo",
    photo_count: 3,
    supported_sizes: ["8x8", "10x10", "12x12"],
    page_types: ["interior"],
    is_system_preset: true,
    frames: [
      {
        id: "frame_1",
        shape: "rectangle",
        x: 50,
        y: 60,
        width: 500,
        height: 880,
        rotation: 0,
        fit_mode: "cover",
        border: { width: 0, color: "#ffffff", radius: 4 },
      },
      {
        id: "frame_2",
        shape: "rectangle",
        x: 580,
        y: 60,
        width: 370,
        height: 420,
        rotation: 0,
        fit_mode: "cover",
        border: { width: 0, color: "#ffffff", radius: 4 },
      },
      {
        id: "frame_3",
        shape: "rectangle",
        x: 580,
        y: 520,
        width: 370,
        height: 420,
        rotation: 0,
        fit_mode: "cover",
        border: { width: 0, color: "#ffffff", radius: 4 },
      },
    ],
  },
  {
    layout_id: "layout_4_grid",
    layout_name: "4 Photo Grid",
    category: "4-photo",
    photo_count: 4,
    supported_sizes: ["8x8", "10x10", "12x12"],
    page_types: ["interior"],
    is_system_preset: true,
    frames: [
      {
        id: "frame_1",
        shape: "rectangle",
        x: 60,
        y: 60,
        width: 410,
        height: 410,
        rotation: 0,
        fit_mode: "cover",
        border: { width: 0, color: "#ffffff", radius: 4 },
      },
      {
        id: "frame_2",
        shape: "rectangle",
        x: 530,
        y: 60,
        width: 410,
        height: 410,
        rotation: 0,
        fit_mode: "cover",
        border: { width: 0, color: "#ffffff", radius: 4 },
      },
      {
        id: "frame_3",
        shape: "rectangle",
        x: 60,
        y: 530,
        width: 410,
        height: 410,
        rotation: 0,
        fit_mode: "cover",
        border: { width: 0, color: "#ffffff", radius: 4 },
      },
      {
        id: "frame_4",
        shape: "rectangle",
        x: 530,
        y: 530,
        width: 410,
        height: 410,
        rotation: 0,
        fit_mode: "cover",
        border: { width: 0, color: "#ffffff", radius: 4 },
      },
    ],
  },
  {
    layout_id: "layout_heart_hero",
    layout_name: "Heart Centerpiece",
    category: "1-photo",
    photo_count: 1,
    supported_sizes: ["8x8", "10x10", "12x12"],
    page_types: ["interior", "front_cover"],
    is_system_preset: true,
    frames: [
      {
        id: "frame_heart",
        shape: "heart",
        x: 150,
        y: 150,
        width: 700,
        height: 700,
        rotation: 0,
        fit_mode: "cover",
        border: { width: 2, color: "#f43f5e", radius: 0 },
      },
    ],
  },
  {
    layout_id: "layout_circle_hero",
    layout_name: "Circular Portrait",
    category: "1-photo",
    photo_count: 1,
    supported_sizes: ["8x8", "10x10", "12x12"],
    page_types: ["interior", "front_cover", "back_cover"],
    is_system_preset: true,
    frames: [
      {
        id: "frame_circle",
        shape: "circle",
        x: 200,
        y: 200,
        width: 600,
        height: 600,
        rotation: 0,
        fit_mode: "cover",
        border: { width: 6, color: "#ffffff", radius: 300 },
      },
    ],
  },
];

// Helper to seed layouts if missing
const ensureSystemLayouts = async () => {
  try {
    const count = await PhotoBookLayout.countDocuments();
    if (count === 0) {
      await PhotoBookLayout.insertMany(SYSTEM_LAYOUT_PRESETS);
    }
  } catch (err) {
    console.warn("Could not seed photobook layouts:", err.message);
  }
};

// Validation Engine
const validateTemplateDefinition = (template) => {
  const errors = [];
  const warnings = [];

  if (!template.template_name || template.template_name.trim() === "") {
    errors.push({ field: "template_name", message: "Template name is required." });
  }

  if (!template.template_id || template.template_id.trim() === "") {
    errors.push({ field: "template_id", message: "Unique template identifier is required." });
  }

  if (!template.supported_sizes || template.supported_sizes.length === 0) {
    errors.push({ field: "supported_sizes", message: "At least one supported size must be selected." });
  }

  const pages = template.pages || [];
  if (pages.length === 0) {
    errors.push({ field: "pages", message: "Template must contain at least one page." });
    return { isValid: false, errors, warnings };
  }

  const hasFrontCover = pages.some((p) => p.page_type === "front_cover");
  const hasBackCover = pages.some((p) => p.page_type === "back_cover");
  const hasInterior = pages.some((p) => p.page_type === "interior");

  if (!hasFrontCover) {
    errors.push({ field: "pages", message: "Template is missing a Front Cover design." });
  }
  if (!hasBackCover) {
    warnings.push({ field: "pages", message: "Template has no Back Cover design defined." });
  }
  if (!hasInterior) {
    errors.push({ field: "pages", message: "Template must contain at least one interior page design." });
  }

  // Check rule conflicts among interior pages
  const exactRules = {};
  pages.forEach((page, index) => {
    const pageLabel = page.name || `Page ${index + 1}`;
    const rule = page.targeting_rule || {};

    if (page.page_type === "interior" && rule.rule_type === "exact_page") {
      if (exactRules[rule.page_number]) {
        errors.push({
          field: `pages[${index}].targeting_rule`,
          message: `Conflict: "${pageLabel}" and "${exactRules[rule.page_number]}" both target exact page ${rule.page_number}.`,
        });
      } else {
        exactRules[rule.page_number] = pageLabel;
      }
    }

    // Check elements
    const elements = page.elements || [];
    elements.forEach((el, elIndex) => {
      if (el.width <= 0 || el.height <= 0) {
        errors.push({
          field: `pages[${index}].elements[${elIndex}]`,
          message: `Element "${el.id}" in "${pageLabel}" has invalid dimensions (width: ${el.width}, height: ${el.height}).`,
        });
      }
      if (el.type === "photo_frame") {
        if (!el.frame_id) {
          errors.push({
            field: `pages[${index}].elements[${elIndex}].frame_id`,
            message: `Photo frame in "${pageLabel}" is missing a stable Frame ID.`,
          });
        }
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// ==================== TEMPLATE CONTROLLERS ====================

// List templates
const getAllTemplates = async (req, res) => {
  try {
    const { search, category, status, size } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { template_name: { $regex: search, $options: "i" } },
        { template_id: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    if (status && status !== "All") {
      filter.status = status;
    }

    if (size) {
      filter.supported_sizes = size;
    }

    const templates = await PhotoBookTemplate.find(filter)
      .populate("eligible_product_ids", "name product_code images")
      .sort({ updatedAt: -1 });

    return successResponse(res, "Templates fetched successfully", templates);
  } catch (err) {
    console.error("Error in getAllTemplates:", err);
    return errorResponse(res, err.message);
  }
};

// Get single template by ID
const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    let template = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      template = await PhotoBookTemplate.findById(id).populate(
        "eligible_product_ids",
        "name product_code images"
      );
    }
    if (!template) {
      template = await PhotoBookTemplate.findOne({
        $or: [
          { template_id: id },
          { slug: id },
          { template_name: id },
          { product_template_id: id }
        ]
      }).populate(
        "eligible_product_ids",
        "name product_code images"
      );
    }

    if (!template) {
      return errorResponse(res, "Template not found");
    }

    return successResponse(res, "Template retrieved successfully", template);
  } catch (err) {
    console.error("Error in getTemplateById:", err);
    return errorResponse(res, err.message);
  }
};

// Create template
const createTemplate = async (req, res) => {
  try {
    const body = req.body;

    // Requirement: A valid product template configuration must be selected
    if (!body.product_template_id) {
      return errorResponse(res, "Please select an available template configuration from the Custom Photo Book product.");
    }

    // Check for duplicate active design for the same template configuration
    const duplicate = await PhotoBookTemplate.findOne({
      product_template_id: String(body.product_template_id),
      status: { $ne: "archived" },
    });
    if (duplicate) {
      return errorResponse(
        res,
        `A visual design is already assigned to this template configuration ("${duplicate.template_name}"). Only one visual design is permitted per template configuration.`
      );
    }

    // Check unique template_id
    if (body.template_id) {
      const existing = await PhotoBookTemplate.findOne({ template_id: body.template_id });
      if (existing) {
        return errorResponse(res, `Template ID "${body.template_id}" already exists. Please choose another.`);
      }
    } else {
      body.template_id = `pb_${Date.now()}`;
    }

    // Default pages if not provided
    if (!body.pages || body.pages.length === 0) {
      body.pages = createInitialPages();
    }

    const newTemplate = new PhotoBookTemplate(body);
    await newTemplate.save();

    // If assigned to a product, sync design_id and status onto product's photobook_config.templates
    if (body.product_id && mongoose.Types.ObjectId.isValid(body.product_id)) {
      try {
        const prod = await Product.findById(body.product_id);
        if (prod && prod.photobook_config?.templates) {
          const tpls = (prod.photobook_config.templates || []).map((t) => {
            if (
              (body.product_template_id && String(t._id) === String(body.product_template_id)) ||
              (body.template_id && (t.slug === body.template_id || t.template_id === body.template_id))
            ) {
              return {
                ...t,
                design_id: newTemplate._id,
                design_status: "draft",
              };
            }
            return t;
          });
          await Product.findByIdAndUpdate(body.product_id, {
            $set: { "photobook_config.templates": tpls },
          });
        }
      } catch (syncErr) {
        console.warn("Product template link sync error:", syncErr);
      }
    }

    return successResponse(res, "Photo Book Template created successfully", newTemplate);
  } catch (err) {
    console.error("Error in createTemplate:", err);
    return errorResponse(res, err.message);
  }
};

// Update template (save draft or edit)
const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const existing = await PhotoBookTemplate.findById(id);
    if (!existing) {
      return errorResponse(res, "Template not found");
    }

    // Check template_id uniqueness if modified
    if (body.template_id && body.template_id !== existing.template_id) {
      const idTaken = await PhotoBookTemplate.findOne({
        template_id: body.template_id,
        _id: { $ne: id },
      });
      if (idTaken) {
        return errorResponse(res, `Template ID "${body.template_id}" is already used by another template.`);
      }
    }

    // Check duplicate assignment if product_template_id is changed/set
    if (body.product_template_id !== undefined && body.product_template_id) {
      const duplicateAssignment = await PhotoBookTemplate.findOne({
        product_template_id: String(body.product_template_id),
        _id: { $ne: id },
        status: { $ne: "archived" },
      });
      if (duplicateAssignment) {
        return errorResponse(
          res,
          `Another visual design ("${duplicateAssignment.template_name}") is already linked to this template configuration.`
        );
      }
    }

    // If template was published, saving updates creates an updated draft or new working version
    const updated = await PhotoBookTemplate.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    // Sync product link if product or product_template_id changed
    if (
      existing.product_id &&
      (String(existing.product_id) !== String(body.product_id) ||
        String(existing.product_template_id) !== String(body.product_template_id))
    ) {
      try {
        const oldProd = await Product.findById(existing.product_id);
        if (oldProd?.photobook_config?.templates) {
          const updatedOldTpls = oldProd.photobook_config.templates.map((t) => {
            if (
              String(t._id) === String(existing.product_template_id) ||
              t.slug === existing.template_id ||
              String(t.design_id) === String(id)
            ) {
              return { ...t, design_id: null, design_status: "none" };
            }
            return t;
          });
          await Product.findByIdAndUpdate(existing.product_id, {
            $set: { "photobook_config.templates": updatedOldTpls },
          });
        }
      } catch (err) {
        console.warn("Error unlinking old product template:", err);
      }
    }

    if (body.product_id && body.product_template_id) {
      try {
        const newProd = await Product.findById(body.product_id);
        if (newProd?.photobook_config?.templates) {
          const updatedNewTpls = newProd.photobook_config.templates.map((t) => {
            if (
              String(t._id) === String(body.product_template_id) ||
              t.slug === (body.template_id || existing.template_id) ||
              t.template_id === (body.template_id || existing.template_id)
            ) {
              return {
                ...t,
                design_id: id,
                design_status: existing.status || "draft",
              };
            }
            return t;
          });
          await Product.findByIdAndUpdate(body.product_id, {
            $set: { "photobook_config.templates": updatedNewTpls },
          });
        }
      } catch (err) {
        console.warn("Error syncing new product template link:", err);
      }
    }

    return successResponse(res, "Template saved successfully", updated);
  } catch (err) {
    console.error("Error in updateTemplate:", err);
    return errorResponse(res, err.message);
  }
};

// Duplicate template
const duplicateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const source = await PhotoBookTemplate.findById(id).lean();

    if (!source) {
      return errorResponse(res, "Source template not found");
    }

    delete source._id;
    delete source.createdAt;
    delete source.updatedAt;

    const timestamp = Date.now().toString().slice(-4);
    source.template_name = `${source.template_name} (Copy)`;
    source.template_id = `${source.template_id}_copy_${timestamp}`;
    source.status = "draft";
    source.version = 1;
    source.published_version = 0;
    source.published_snapshot = null;

    // Refresh page & element IDs to ensure uniqueness
    source.pages = (source.pages || []).map((page) => ({
      ...page,
      page_id: uuidv4(),
      elements: (page.elements || []).map((el) => ({
        ...el,
        id: uuidv4(),
      })),
    }));

    const cloned = new PhotoBookTemplate(source);
    await cloned.save();

    return successResponse(res, "Template duplicated successfully", cloned);
  } catch (err) {
    console.error("Error in duplicateTemplate:", err);
    return errorResponse(res, err.message);
  }
};

// Publish template (with validation and immutable snapshot)
const publishTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await PhotoBookTemplate.findById(id);

    if (!template) {
      return errorResponse(res, "Template not found");
    }

    // Requirement: Must have a linked template configuration before publishing
    if (!template.product_template_id) {
      return errorResponse(
        res,
        "Cannot publish a visual template design without a linked template configuration. Please select a template configuration first."
      );
    }

    // Prevent duplicate published assignment for the same template configuration
    const duplicatePublished = await PhotoBookTemplate.findOne({
      product_template_id: String(template.product_template_id),
      _id: { $ne: id },
      status: "published",
    });
    if (duplicatePublished) {
      return errorResponse(
        res,
        `Another published visual design ("${duplicatePublished.template_name}") is already linked to this template configuration.`
      );
    }

    // Run validation
    const validation = validateTemplateDefinition(template);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Template validation failed. Please fix all errors before publishing.",
        validation,
      });
    }

    // Increment version & create immutable snapshot
    const nextVersion = (template.version || 1) + (template.status === "published" ? 1 : 0);

    const snapshot = {
      template_id: template.template_id,
      template_name: template.template_name,
      version: nextVersion,
      published_at: new Date(),
      category: template.category,
      supported_sizes: template.supported_sizes,
      page_config: template.page_config,
      pages: JSON.parse(JSON.stringify(template.pages)),
    };

    template.status = "published";
    template.version = nextVersion;
    template.published_version = nextVersion;
    template.published_snapshot = snapshot;

    await template.save();

    // If template has product_id or eligible_product_ids, update product photobook_config.templates
    const productIdsToUpdate = [
      template.product_id,
      ...(template.eligible_product_ids || []),
    ].filter(Boolean);

    for (const pid of productIdsToUpdate) {
      try {
        const prod = await Product.findById(pid);
        if (prod && prod.photobook_config?.templates) {
          const tpls = (prod.photobook_config.templates || []).map((t) => {
            if (
              (template.product_template_id && String(t._id) === String(template.product_template_id)) ||
              (template.template_id && (t.slug === template.template_id || t.template_id === template.template_id))
            ) {
              return {
                ...t,
                design_id: template._id,
                design_status: "published",
              };
            }
            return t;
          });
          await Product.findByIdAndUpdate(pid, {
            $set: {
              is_photobook: true,
              "photobook_config.templates": tpls,
            },
            $addToSet: { "photobook_config.eligible_template_ids": template.template_id },
          });
        } else if (prod) {
          await Product.findByIdAndUpdate(pid, {
            $set: { is_photobook: true },
            $addToSet: { "photobook_config.eligible_template_ids": template.template_id },
          });
        }
      } catch (prodErr) {
        console.warn("Product publish sync error:", prodErr);
      }
    }

    return successResponse(res, `Template published successfully as version ${nextVersion}!`, {
      template,
      validation,
    });
  } catch (err) {
    console.error("Error in publishTemplate:", err);
    return errorResponse(res, err.message);
  }
};

// Archive / Unarchive template
const archiveTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await PhotoBookTemplate.findById(id);

    if (!template) {
      return errorResponse(res, "Template not found");
    }

    const newStatus = template.status === "archived" ? "draft" : "archived";
    template.status = newStatus;
    await template.save();

    return successResponse(
      res,
      `Template ${newStatus === "archived" ? "archived" : "restored to draft"} successfully`,
      template
    );
  } catch (err) {
    console.error("Error in archiveTemplate:", err);
    return errorResponse(res, err.message);
  }
};

// Delete template
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PhotoBookTemplate.findByIdAndDelete(id);

    if (!deleted) {
      return errorResponse(res, "Template not found");
    }

    return successResponse(res, "Template deleted successfully", deleted);
  } catch (err) {
    console.error("Error in deleteTemplate:", err);
    return errorResponse(res, err.message);
  }
};

// Standalone validate endpoint
const validateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = id ? await PhotoBookTemplate.findById(id) : req.body;

    if (!template) {
      return errorResponse(res, "Template not found");
    }

    const validation = validateTemplateDefinition(template);
    return successResponse(res, "Validation check completed", validation);
  } catch (err) {
    console.error("Error in validateTemplate:", err);
    return errorResponse(res, err.message);
  }
};

// ==================== LAYOUT CONTROLLERS ====================

// Get all reusable layouts
const getLayouts = async (req, res) => {
  try {
    await ensureSystemLayouts();

    const { category, size } = req.query;
    const filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }
    if (size) {
      filter.supported_sizes = size;
    }

    const layouts = await PhotoBookLayout.find(filter).sort({
      is_system_preset: -1,
      createdAt: -1,
    });

    return successResponse(res, "Layouts fetched successfully", layouts);
  } catch (err) {
    console.error("Error in getLayouts:", err);
    return errorResponse(res, err.message);
  }
};

// Create a reusable layout (e.g., from admin designer)
const createLayout = async (req, res) => {
  try {
    const body = req.body;
    if (!body.layout_id) {
      body.layout_id = `layout_${Date.now()}`;
    }

    const newLayout = new PhotoBookLayout(body);
    await newLayout.save();

    return successResponse(res, "Layout saved successfully", newLayout);
  } catch (err) {
    console.error("Error in createLayout:", err);
    return errorResponse(res, err.message);
  }
};

// Delete a reusable layout
const deleteLayout = async (req, res) => {
  try {
    const { id } = req.params;
    const layout = await PhotoBookLayout.findById(id);

    if (!layout) {
      return errorResponse(res, "Layout not found");
    }
    if (layout.is_system_preset) {
      return errorResponse(res, "System preset layouts cannot be deleted");
    }

    await PhotoBookLayout.findByIdAndDelete(id);
    return successResponse(res, "Layout deleted successfully");
  } catch (err) {
    console.error("Error in deleteLayout:", err);
    return errorResponse(res, err.message);
  }
};

// ==================== PRODUCT INTEGRATION CONTROLLER ====================

// Get all available product templates created in the Product section
const getAvailableProductTemplates = async (req, res) => {
  try {
    const products = await Product.find(
      {
        $or: [
          { is_photobook: true },
          { "photobook_config.templates.0": { $exists: true } },
        ],
      },
      "name product_code is_photobook photobook_config images"
    ).lean();

    // Fetch existing active (non-archived) visual designs to annotate status
    const existingDesigns = await PhotoBookTemplate.find(
      { status: { $ne: "archived" } },
      "template_id template_name status version product_id product_template_id thumbnail_url updatedAt"
    ).lean();

    const designByTemplateId = new Map();
    const designByProdTplId = new Map();
    existingDesigns.forEach((d) => {
      if (d.template_id) designByTemplateId.set(d.template_id.toLowerCase(), d);
      if (d.product_template_id) designByProdTplId.set(String(d.product_template_id), d);
    });

    const result = [];
    products.forEach((prod) => {
      const templates = prod.photobook_config?.templates || [];
      templates.forEach((tpl) => {
        const slug = tpl.slug || tpl.template_id || tpl.template_code || tpl._id;
        const matchedDesign =
          (tpl._id && designByProdTplId.get(String(tpl._id))) ||
          (slug && designByTemplateId.get(slug.toLowerCase())) ||
          null;

        result.push({
          product_id: prod._id,
          product_name: prod.name,
          product_template_id: tpl._id || tpl.template_id,
          template_id: slug,
          slug,
          template_name: tpl.template_name || "Untitled Template",
          category: tpl.category || "General",
          badge: tpl.badge || "",
          cover_image_url: tpl.thumbnail_url || tpl.cover_image_url || "",
          thumbnail_url: tpl.thumbnail_url || tpl.cover_image_url || "",
          description: tpl.description || "",
          supported_sizes: tpl.supported_sizes || [],
          editions: tpl.editions || [],
          default_pages: Number(tpl.default_pages || tpl.page_config?.default_pages || 20),
          min_pages: Number(tpl.min_pages || tpl.page_config?.min_pages || 10),
          max_pages: Number(tpl.max_pages || tpl.page_config?.max_pages || 60),
          price_per_extra_page: Number(tpl.price_per_extra_page ?? tpl.page_config?.price_per_extra_page ?? 15),
          storefront_visibility: tpl.storefront_visibility !== false && tpl.is_active !== false,
          is_active: tpl.is_active !== false && tpl.storefront_visibility !== false,
          has_design: Boolean(matchedDesign),
          design_id: matchedDesign?._id || null,
          design_status: matchedDesign?.status || "none",
          design_version: matchedDesign?.version || 0,
        });
      });
    });

    return successResponse(res, "Available product templates fetched successfully", result);
  } catch (err) {
    console.error("Error in getAvailableProductTemplates:", err);
    return errorResponse(res, err.message);
  }
};

// Get Storefront Templates for a Product (ONLY visible and published)
const getStorefrontProductTemplates = async (req, res) => {
  try {
    const { productId } = req.params;
    let product = null;

    if (mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId).lean();
    }
    if (!product) {
      product = await Product.findOne({
        $or: [{ seo_url: productId }, { name: productId }],
      }).lean();
    }

    if (!product) {
      return errorResponse(res, "Product not found", 404);
    }

    const rawTemplates = product.photobook_config?.templates || [];

    // Filter by storefront visibility
    const visibleTemplates = rawTemplates.filter(
      (t) => t.storefront_visibility !== false && t.is_active !== false
    );

    // Fetch published visual designs
    const publishedDesigns = await PhotoBookTemplate.find({
      status: "published",
      $or: [
        { product_id: product._id },
        { eligible_product_ids: product._id },
        { template_id: { $in: visibleTemplates.map((t) => t.slug || t.template_id).filter(Boolean) } },
      ],
    }).lean();

    const designMap = new Map();
    publishedDesigns.forEach((d) => {
      if (d.template_id) designMap.set(d.template_id.toLowerCase(), d);
      if (d.product_template_id) designMap.set(String(d.product_template_id), d);
      if (d._id) designMap.set(String(d._id), d);
    });

    // Only return templates that have a published visual design
    const storefrontTemplates = [];
    visibleTemplates.forEach((tpl) => {
      const slug = (tpl.slug || tpl.template_id || "").toLowerCase();
      const matchedDesign =
        (tpl._id && designMap.get(String(tpl._id))) ||
        (slug && designMap.get(slug)) ||
        (tpl.design_id && designMap.get(String(tpl.design_id))) ||
        null;

      if (matchedDesign) {
        storefrontTemplates.push({
          _id: tpl._id || matchedDesign._id,
          template_id: tpl.slug || tpl.template_id || matchedDesign.template_id,
          slug: tpl.slug || tpl.template_id || matchedDesign.template_id,
          template_name: tpl.template_name || matchedDesign.template_name,
          category: tpl.category || matchedDesign.category || "General",
          badge: tpl.badge || matchedDesign.badge || "",
          cover_image_url: tpl.cover_image_url || tpl.thumbnail_url || matchedDesign.thumbnail_url || "",
          thumbnail_url: tpl.thumbnail_url || tpl.cover_image_url || matchedDesign.thumbnail_url || "",
          description: tpl.description || matchedDesign.description || "",
          storefront_visibility: true,
          is_active: true,
          design_id: matchedDesign._id,
          status: "published",
          version: matchedDesign.published_version || matchedDesign.version || 1,
          page_config: matchedDesign.page_config || product.photobook_config?.page_config || {},
          supported_sizes: matchedDesign.supported_sizes || product.photobook_config?.supported_sizes || [],
          editions: tpl.editions || [],
          size_pricing: tpl.size_pricing || {},
          size_images: tpl.size_images || {},
          published_snapshot: matchedDesign.published_snapshot,
        });
      }
    });

    return successResponse(res, "Storefront templates retrieved successfully", storefrontTemplates);
  } catch (err) {
    console.error("Error in getStorefrontProductTemplates:", err);
    return errorResponse(res, err.message);
  }
};

// Get eligible photobook products
const getEligibleProducts = async (req, res) => {
  try {
    const products = await Product.find({}, "name product_code is_photobook photobook_config images variants price MRP_price")
      .sort({ updatedAt: -1 });

    return successResponse(res, "Products fetched successfully", products);
  } catch (err) {
    console.error("Error in getEligibleProducts:", err);
    return errorResponse(res, err.message);
  }
};

// Associate templates with a product
const associateProductWithTemplates = async (req, res) => {
  try {
    const { productId } = req.params;
    const { is_photobook, photobook_config } = req.body;

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        $set: {
          is_photobook: Boolean(is_photobook),
          photobook_config: photobook_config || {},
        },
      },
      { new: true }
    );

    if (!product) {
      return errorResponse(res, "Product not found");
    }

    return successResponse(res, "Product Photo Book settings updated successfully", product);
  } catch (err) {
    console.error("Error in associateProductWithTemplates:", err);
    return errorResponse(res, err.message);
  }
};

// ==================== CUSTOMER PHOTOBOOK DESIGN CONTROLLER ====================

// Helper to validate a design
const validateDesignInternal = (design, productConfig) => {
  const errors = [];

  if (!design.uploaded_images || design.uploaded_images.length === 0) {
    errors.push("No photos have been uploaded yet.");
  }

  const minPages = productConfig?.min_pages || 10;
  const maxPages = productConfig?.max_pages || 60;
  if (design.page_count < minPages || design.page_count > maxPages) {
    errors.push(`Page count must be between ${minPages} and ${maxPages} pages.`);
  }

  // Helper to extract photo frames from page
  const getPagePhotoFrames = (pg) => {
    if (Array.isArray(pg?.photo_frames) && pg.photo_frames.length > 0) {
      return pg.photo_frames;
    }
    if (Array.isArray(pg?.elements)) {
      return pg.elements.filter((el) => el.type === "photo_frame");
    }
    return [];
  };

  // Cover check
  const coverPage = design.front_cover || (design.pages || []).find((p) => p.page_type === "front_cover" || p.page_id === "front-cover");
  if (!coverPage) {
    errors.push("Front Cover design is required.");
  } else {
    const coverFrames = getPagePhotoFrames(coverPage);
    const requiredFrames = coverFrames.filter((f) => f.is_required !== false);
    const emptyFrames = requiredFrames.filter((f) => !f.photo_url);
    if (requiredFrames.length > 0 && emptyFrames.length > 0) {
      errors.push("Front Cover has empty required photo frames.");
    }
  }

  // Interior pages check
  const interiorPages = (design.pages || []).filter((p) => p.page_type === "interior" || (p.page_type !== "front_cover" && p.page_type !== "back_cover" && p.page_id !== "front-cover" && p.page_id !== "back-cover"));
  if (interiorPages.length === 0) {
    errors.push("Interior pages must be designed.");
  } else {
    interiorPages.forEach((page, index) => {
      const pageNum = page.page_number || index + 1;
      const pageFrames = getPagePhotoFrames(page);
      const requiredFrames = pageFrames.filter((f) => f.is_required !== false);
      const emptyFrames = requiredFrames.filter((f) => !f.photo_url);
      if (requiredFrames.length > 0 && emptyFrames.length === requiredFrames.length) {
        errors.push(`Page ${pageNum} is empty. Please place at least one photo.`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const saveCustomerDesign = async (req, res) => {
  try {
    const {
      design_id,
      product_id,
      guest_id,
      size,
      variant,
      cover_finish,
      options,
      page_count,
      target_photo_count,
      photos_per_page_mode,
      template_id,
      template_name,
      template_version,
      uploaded_images,
      pages,
      front_cover,
      back_cover,
      cover_image,
    } = req.body;

    let product = null;
    let resolvedProductId = product_id;

    if (resolvedProductId && mongoose.Types.ObjectId.isValid(resolvedProductId)) {
      product = await Product.findById(resolvedProductId);
    }

    if (!product && resolvedProductId) {
      product = await Product.findOne({
        $or: [
          { seo_url: resolvedProductId },
          { name: resolvedProductId },
          { sku: resolvedProductId },
        ],
      });
    }

    if (!product && design_id && mongoose.Types.ObjectId.isValid(design_id)) {
      const existingDesign = await PhotoBookDesign.findById(design_id);
      if (existingDesign?.product_id) {
        product = await Product.findById(existingDesign.product_id);
      }
    }

    if (!product) {
      product = (await Product.findOne({ is_photobook: true })) || (await Product.findOne());
    }

    if (product) {
      resolvedProductId = product._id;
    }

    if (!resolvedProductId) {
      return errorResponse(res, "Product ID is required and could not be resolved");
    }

    const userId = req.userData?.id || req.userData?._id || req.user?._id || req.body.user_id || null;
    const guestId = guest_id || req.query.guest_id || req.body.guestId || null;

    if (!userId && !guestId) {
      return errorResponse(res, "User ID or Guest ID is required to save design");
    }

    // Validation
    const validation = validateDesignInternal(
      { uploaded_images, page_count, front_cover, back_cover, pages },
      product.photobook_config
    );

    const isComplete = validation.isValid;
    const status = isComplete ? "ready_for_cart" : "editing";

    // Pricing calculation strictly on backend
    const basePages = product.photobook_config?.default_pages || 20;
    const extraPages = Math.max(0, (page_count || basePages) - basePages);
    const extraPagePrice = Number(product.photobook_config?.price_per_extra_page || 15);
    const extraPagesCost = extraPages * extraPagePrice;
    const basePrice = Number(product.customer_product_price || product.price || 0);
    const calculatedTotal = basePrice + extraPagesCost;

    const pricingSnapshot = {
      base_pages: basePages,
      base_price: basePrice,
      extra_pages: extraPages,
      price_per_extra_page: extraPagePrice,
      extra_pages_cost: extraPagesCost,
      calculated_total: calculatedTotal,
    };

    const sanitizedPages = Array.isArray(pages)
      ? pages.map((pg, idx) => ({
          ...pg,
          page_number: typeof pg.page_number === "number" ? pg.page_number : (idx === 0 ? 0 : idx),
          display_label: pg.display_label || (typeof pg.page_number === "string" ? pg.page_number : `Page ${idx}`),
        }))
      : pages;

    let design;
    if (design_id && mongoose.Types.ObjectId.isValid(design_id)) {
      const existing = await PhotoBookDesign.findById(design_id);
      if (existing) {
        if (existing.user_id && userId && existing.user_id.toString() !== userId.toString()) {
          return errorResponse(res, "Unauthorized: you do not own this design", 403);
        }
        design = await PhotoBookDesign.findByIdAndUpdate(
          design_id,
          {
            $set: {
              ...(userId ? { user_id: userId } : {}),
              ...(guestId ? { guest_id: guestId } : {}),
              size: size || existing.size || "8x8",
              variant: variant || existing.variant || "Standard",
              cover_finish: cover_finish || existing.cover_finish || "Matte",
              options: options || existing.options || {},
              page_count: page_count || existing.page_count || basePages,
              target_photo_count: target_photo_count !== undefined ? target_photo_count : existing.target_photo_count,
              photos_per_page_mode: photos_per_page_mode || existing.photos_per_page_mode || "template",
              template_id: template_id || existing.template_id || "",
              template_name: template_name || existing.template_name || "",
              template_version: template_version || existing.template_version || 1,
              uploaded_images: uploaded_images !== undefined ? uploaded_images : existing.uploaded_images,
              pages: sanitizedPages !== undefined ? sanitizedPages : existing.pages,
              front_cover: front_cover !== undefined ? front_cover : existing.front_cover,
              back_cover: back_cover !== undefined ? back_cover : existing.back_cover,
              cover_image: cover_image || existing.cover_image || (uploaded_images?.[0]?.url || ""),
              status,
              is_complete: isComplete,
              validation_errors: validation.errors,
              pricing: pricingSnapshot,
            },
          },
          { new: true }
        );
      }
    }

    if (!design) {
      design = await PhotoBookDesign.create({
        user_id: userId,
        guest_id: guestId,
        product_id: resolvedProductId,
        size: size || "8x8",
        variant: variant || "Standard",
        cover_finish: cover_finish || "Matte",
        options: options || {},
        page_count: page_count || basePages,
        target_photo_count: target_photo_count || 0,
        photos_per_page_mode: photos_per_page_mode || "template",
        template_id: template_id || "",
        template_name: template_name || "",
        template_version: template_version || 1,
        uploaded_images: uploaded_images || [],
        pages: sanitizedPages || [],
        front_cover: front_cover || null,
        back_cover: back_cover || null,
        cover_image: cover_image || (uploaded_images?.[0]?.url || ""),
        status,
        is_complete: isComplete,
        validation_errors: validation.errors,
        pricing: pricingSnapshot,
      });
    }

    return successResponse(res, "Design saved successfully", {
      design_id: design._id,
      status: design.status,
      is_complete: design.is_complete,
      validation_errors: design.validation_errors,
      pricing: design.pricing,
      design,
    });
  } catch (err) {
    console.error("Error in saveCustomerDesign:", err);
    return errorResponse(res, err.message);
  }
};

const checkCustomerSavedDesign = async (req, res) => {
  try {
    const userId = req.userData?.id || req.userData?._id || req.user?._id || null;
    if (!userId) {
      return errorResponse(res, "Authentication required to check saved designs", 401);
    }

    const { product_id, template_id } = req.query;
    const query = {
      user_id: userId,
      status: { $in: ["draft", "editing", "ready_for_cart"] },
    };

    if (product_id && mongoose.Types.ObjectId.isValid(product_id)) {
      query.product_id = product_id;
    }
    let savedDesign = null;
    if (template_id) {
      savedDesign = await PhotoBookDesign.findOne({ ...query, template_id })
        .sort({ updatedAt: -1 })
        .lean();
    }
    if (!savedDesign) {
      savedDesign = await PhotoBookDesign.findOne(query)
        .sort({ updatedAt: -1 })
        .lean();
    }

    if (!savedDesign) {
      return successResponse(res, "No saved design found", {
        has_saved_design: false,
        design: null,
      });
    }

    // Attempt to enrich with template info (thumbnail, template_name)
    let templateThumbnail = savedDesign.cover_image || "";
    if (savedDesign.template_id || savedDesign.template_name) {
      try {
        const orConditions = [];
        if (savedDesign.template_id && mongoose.Types.ObjectId.isValid(savedDesign.template_id)) {
          orConditions.push({ _id: savedDesign.template_id });
        }
        if (savedDesign.template_id) {
          orConditions.push({ template_id: savedDesign.template_id });
        }
        if (savedDesign.template_name) {
          orConditions.push({ template_name: savedDesign.template_name });
        }

        if (orConditions.length > 0) {
          const tpl = await PhotoBookTemplate.findOne({ $or: orConditions }).lean();
          if (tpl) {
            templateThumbnail =
              tpl.thumbnail ||
              tpl.cover_image ||
              tpl.published_snapshot?.thumbnail ||
              tpl.published_snapshot?.cover_image ||
              templateThumbnail;
          }
        }
      } catch (e) {
        console.warn("Could not fetch template thumbnail:", e);
      }
    }

    if (!templateThumbnail && savedDesign.product_id) {
      try {
        const prod = await Product.findById(savedDesign.product_id).lean();
        const pTpl = (prod?.photobook_config?.templates || []).find(
          (t) =>
            (savedDesign.template_id && (t.template_id === savedDesign.template_id || String(t._id) === String(savedDesign.template_id) || t.slug === savedDesign.template_id)) ||
            (savedDesign.template_name && (t.template_name === savedDesign.template_name || t.name === savedDesign.template_name))
        );
        if (pTpl) {
          templateThumbnail = pTpl.cover_image_url || pTpl.thumbnail_url || "";
        }
      } catch (pe) {
        console.warn("Could not check product templates for thumbnail:", pe);
      }
    }

    if (!templateThumbnail && savedDesign.uploaded_images && savedDesign.uploaded_images.length > 0) {
      templateThumbnail = savedDesign.uploaded_images[0]?.url || "";
    }

    return successResponse(res, "Saved design found", {
      has_saved_design: true,
      design: {
        ...savedDesign,
        template_thumbnail: templateThumbnail || savedDesign.cover_image || "",
      },
    });
  } catch (err) {
    console.error("Error in checkCustomerSavedDesign:", err);
    return errorResponse(res, err.message);
  }
};

const getCustomerDesign = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, "Invalid design ID", 400);
    }

    const design = await PhotoBookDesign.findById(id).lean();
    if (!design) {
      return errorResponse(res, "Design not found", 404);
    }

    return successResponse(res, "Design fetched successfully", design);
  } catch (err) {
    console.error("Error in getCustomerDesign:", err);
    return errorResponse(res, err.message);
  }
};

const validateCustomerDesignEndpoint = async (req, res) => {
  try {
    const { id } = req.params;
    const design = await PhotoBookDesign.findById(id);
    if (!design) {
      return errorResponse(res, "Design not found", 404);
    }

    const product = await Product.findById(design.product_id);
    const validation = validateDesignInternal(design, product?.photobook_config);

    design.is_complete = validation.isValid;
    design.status = validation.isValid ? "ready_for_cart" : "editing";
    design.validation_errors = validation.errors;
    await design.save();

    return successResponse(res, "Validation completed", {
      valid: validation.isValid,
      errors: validation.errors,
      status: design.status,
    });
  } catch (err) {
    console.error("Error in validateCustomerDesignEndpoint:", err);
    return errorResponse(res, err.message);
  }
};

module.exports = {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  duplicateTemplate,
  publishTemplate,
  archiveTemplate,
  deleteTemplate,
  validateTemplate,
  getLayouts,
  createLayout,
  deleteLayout,
  getEligibleProducts,
  associateProductWithTemplates,
  getAvailableProductTemplates,
  getStorefrontProductTemplates,
  saveCustomerDesign,
  checkCustomerSavedDesign,
  getCustomerDesign,
  validateCustomerDesignEndpoint,
  validateDesignInternal,
};
