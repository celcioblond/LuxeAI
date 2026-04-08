import express from "express";
import {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.js";
import { protect, isAdmin } from "../middlewares/auth.middleware.js";
import {
  validate,
  createProductRules,
  updateProductRules,
} from "../middlewares/validate.js";

const router = express.Router();

// Public
router.get("/",        getAllProducts);
router.get("/:id",     getProductById);

// Admin only
router.post("/",       protect, isAdmin, createProductRules, validate, addProduct);
router.patch("/:id",   protect, isAdmin, updateProductRules, validate, updateProduct);
router.delete("/:id",  protect, isAdmin, deleteProduct);

export default router;
