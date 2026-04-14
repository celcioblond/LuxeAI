import express from "express";
import {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.js";
import { protect, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public
router.get("/",        getAllProducts);
router.get("/:id",     getProductById);

// Admin only
router.post("/", addProduct);
router.patch("/:id", updateProduct);
router.delete("/:id",  protect, isAdmin, deleteProduct);

export default router;
