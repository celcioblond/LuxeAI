import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/users.js";
import { protect } from "../middlewares/auth.middleware.js";
import {
  validate,
  registerRules,
  loginRules,
  updateProfileRules,
} from "../middlewares/validate.js";

const router = express.Router();

router.post("/register", registerRules,     validate, register);
router.post("/login",    loginRules,        validate, login);
router.get("/profile",   protect, getProfile);
router.patch("/profile", protect, updateProfileRules, validate, updateProfile);

router.get("/wishlist",               protect, getWishlist);
router.post("/wishlist/:productId",   protect, addToWishlist);
router.delete("/wishlist/:productId", protect, removeFromWishlist);

export default router;
