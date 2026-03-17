import express from "express";
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
} from "../controllers/review.js";
import { protect, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public
router.get("/:productId", getProductReviews);

// Authenticated users
router.post("/:productId",  protect, createReview);
router.patch("/:id",        protect, updateReview);
router.delete("/:id",       protect, deleteReview);

export default router;
