import express from "express";
import {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.js";
import { protect, isAdmin } from "../middlewares/auth.middleware.js";
import { cacheResponse, invalidateCache } from "../middlewares/cache.middleware.js";

const router = express.Router();

// Public
router.get("/", cacheResponse("products:all"), getAllProducts);
router.get("/:id", cacheResponse((req) => `products:${req.params.id}`), getProductById);

// Admin only
router.post("/", protect, isAdmin, invalidateCache("products:all"), addProduct);
router.patch("/:id", protect, isAdmin, invalidateCache("products:all", (req) => `products:${req.params.id}`), updateProduct);
router.delete("/:id", protect, isAdmin, invalidateCache("products:all", (req) => `products:${req.params.id}`), deleteProduct);

export default router;
