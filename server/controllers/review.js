import Review from "../models/reviewModel.js";
import Order from "../models/orderModel.js";
import HttpError from "../models/http-error.js";

// POST /api/reviews/:productId
export const createReview = async (req, res, next) => {
  const { productId } = req.params;
  const { rating, title, comment } = req.body;

  if (!rating || !comment) {
    return next(new HttpError("Rating and comment are required.", 400));
  }

  // Check if user already reviewed this product
  let existing;
  try {
    existing = await Review.findOne({ user: req.user._id, product: productId });
  } catch {
    return next(new HttpError("Failed to check existing review.", 500));
  }

  if (existing) {
    return next(new HttpError("You have already reviewed this product.", 400));
  }

  // Mark as verified if user has a delivered order containing this product
  let verified = false;
  try {
    const verifiedOrder = await Order.findOne({
      user: req.user._id,
      status: "delivered",
      "items.product": productId,
    });
    verified = !!verifiedOrder;
  } catch {
    // Non-critical — proceed without verified flag
  }

  let review;
  try {
    review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      title,
      comment,
      verified,
    });
  } catch (err) {
    return next(new HttpError(err.message || "Could not create review.", 500));
  }

  await review.populate("user", "name");
  res.status(201).json({ review });
};

// GET /api/reviews/:productId
export const getProductReviews = async (req, res, next) => {
  const { productId } = req.params;
  const { sort = "-createdAt", page = 1, limit = 10 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  let reviews, total;
  try {
    [reviews, total] = await Promise.all([
      Review.find({ product: productId })
        .populate("user", "name")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments({ product: productId }),
    ]);
  } catch {
    return next(new HttpError("Failed to fetch reviews.", 500));
  }

  res.json({
    reviews,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  });
};

// PATCH /api/reviews/:id
export const updateReview = async (req, res, next) => {
  const { rating, title, comment } = req.body;

  let review;
  try {
    review = await Review.findById(req.params.id);
  } catch {
    return next(new HttpError("Invalid review ID.", 400));
  }

  if (!review) {
    return next(new HttpError("Review not found.", 404));
  }

  if (review.user.toString() !== req.user._id.toString()) {
    return next(new HttpError("Not authorized to edit this review.", 403));
  }

  if (rating !== undefined) review.rating  = rating;
  if (title   !== undefined) review.title   = title;
  if (comment !== undefined) review.comment = comment;

  try {
    await review.save(); // triggers post("save") → updateProductRating
  } catch (err) {
    return next(new HttpError(err.message || "Could not update review.", 500));
  }

  res.json({ review });
};

// DELETE /api/reviews/:id
export const deleteReview = async (req, res, next) => {
  let review;
  try {
    review = await Review.findById(req.params.id);
  } catch {
    return next(new HttpError("Invalid review ID.", 400));
  }

  if (!review) {
    return next(new HttpError("Review not found.", 404));
  }

  const isOwner = review.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return next(new HttpError("Not authorized to delete this review.", 403));
  }

  try {
    await Review.findOneAndDelete({ _id: review._id }); // triggers post("findOneAndDelete") → updateProductRating
  } catch (err) {
    return next(new HttpError(err.message || "Could not delete review.", 500));
  }

  res.json({ message: "Review deleted." });
};
