const jwt = require("jsonwebtoken");
const { 
  addToShoppingCart, 
  getMyShoppingCart, 
  removeMyShoppingCart, 
  mergeCartsAfterLogin,
  updateCartItemQuantity,
  validateGuestId
} = require("../controller/shoppingcart.controller");

const router = require("express").Router();

// Optional JWT auth middleware to decode Bearer token into req.userData if present
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, "").trim();
      if (token) {
        const decoded = jwt.verify(token, process.env.SECRET_KEY || process.env.JWT_SECRET);
        req.userData = decoded;
      }
    }
  } catch (err) {
    // Ignore invalid/expired token for optionalAuth
  }
  next();
};

router.use(optionalAuth);

// Apply guest ID validation to all routes
router.use(validateGuestId);

router.post("/add_to_cart", addToShoppingCart);
router.post("/merge_cart", mergeCartsAfterLogin);
router.get("/get_my_cart", getMyShoppingCart);
router.post("/remove_my_cart", removeMyShoppingCart);
router.post("/update_cart_quantity", updateCartItemQuantity);

module.exports = router;