import express from "express";
import {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
} from "../controllers/review.js";
import { protect } from "../middlewares/auth.middleware.js";
import {
  validate,
  createReviewRules,
  updateReviewRules,
} from "../middlewares/validate.js";

const router = express.Router();

// Public
router.get("/:productId", getProductReviews);

// Authenticated users
router.post("/:productId",  protect, createReviewRules,  validate, createReview);
router.patch("/:id",        protect, updateReviewRules,  validate, updateReview);
router.delete("/:id",       protect, deleteReview);

export default router;
