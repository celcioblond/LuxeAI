import express from "express";
import {
  getAllProducts,
  getProductById,
  searchProduct,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.js";
import { protect, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public
router.get("/",        getAllProducts);
router.get("/search",  searchProduct);
router.get("/:id",     getProductById);

// Admin only
router.post("/",       protect, isAdmin, addProduct);
router.patch("/:id",   protect, isAdmin, updateProduct);
router.delete("/:id",  protect, isAdmin, deleteProduct);

export default router;
