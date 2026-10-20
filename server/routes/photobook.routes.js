const router = require("express").Router();
const {
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
} = require("../controller/photobook.controller");

// Templates
router.get("/templates", getAllTemplates);
router.post("/templates", createTemplate);
router.get("/templates/:id", getTemplateById);
router.put("/templates/:id", updateTemplate);
router.post("/templates/:id/duplicate", duplicateTemplate);
router.post("/templates/:id/publish", publishTemplate);
router.patch("/templates/:id/archive", archiveTemplate);
router.delete("/templates/:id", deleteTemplate);
router.post("/templates/validate", validateTemplate);
router.post("/templates/:id/validate", validateTemplate);

// Reusable Layouts
router.get("/layouts", getLayouts);
router.post("/layouts", createLayout);
router.delete("/layouts/:id", deleteLayout);

// Product Integration
router.get("/eligible-products", getEligibleProducts);
router.put("/products/:productId/photobook-config", associateProductWithTemplates);

module.exports = router;
