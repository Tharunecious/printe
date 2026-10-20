const PhotoBookTemplate = require("../modals/photobook_template.model");
const PhotoBookLayout = require("../modals/photobook_layout.model");
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
    const template = await PhotoBookTemplate.findById(id).populate(
      "eligible_product_ids",
      "name product_code images"
    );

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

    // If template was published, saving updates creates an updated draft or new working version
    const updated = await PhotoBookTemplate.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

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

    // If template has eligible products, update those products' photobook_config
    if (template.eligible_product_ids && template.eligible_product_ids.length > 0) {
      await Product.updateMany(
        { _id: { $in: template.eligible_product_ids } },
        {
          $set: { is_photobook: true },
          $addToSet: { "photobook_config.eligible_template_ids": template.template_id },
        }
      );
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
};
