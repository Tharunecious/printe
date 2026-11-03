const router = require("express").Router();
const jwt = require("jsonwebtoken");
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
  getAvailableProductTemplates,
  getStorefrontProductTemplates,
  saveCustomerDesign,
  checkCustomerSavedDesign,
  getCustomerDesign,
  validateCustomerDesignEndpoint,
} = require("../controller/photobook.controller");
const { VerfiyToken } = require("../helper/shared.helper");

const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (token) {
      const tokenStr = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
      const decoded = jwt.verify(tokenStr, process.env.SECRET_KEY || process.env.JWT_SECRET);
      if (decoded) {
        req.userData = decoded;
        req.user = decoded;
      }
    }
  } catch {
    // Continue as guest
  }
  next();
};

// Customer Photo Book Designs
router.get("/designs/saved-check", VerfiyToken, checkCustomerSavedDesign);
router.post("/designs", optionalAuth, saveCustomerDesign);
router.put("/designs/:id", optionalAuth, saveCustomerDesign);
router.get("/designs/:id", optionalAuth, getCustomerDesign);
router.post("/designs/:id/validate", optionalAuth, validateCustomerDesignEndpoint);

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
router.get("/available-product-templates", getAvailableProductTemplates);
router.get("/storefront/product/:productId/templates", getStorefrontProductTemplates);
router.put("/products/:productId/photobook-config", associateProductWithTemplates);

module.exports = router;
