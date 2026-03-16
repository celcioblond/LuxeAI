import mongoose from "mongoose"

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to a product"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    verified: {
      type: Boolean,
      default: false,  // true if user actually purchased the product
    },
  },
  { timestamps: true }
)

// Compound index — one review per user per product, enforced at DB level
reviewSchema.index({ user: 1, product: 1 }, { unique: true })

// Static method — recalculate and update average rating on the Product
reviewSchema.statics.updateProductRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ])

  await mongoose.model("Product").findByIdAndUpdate(productId, {
    averageRating: result.length > 0 ? Math.round(result[0].averageRating * 10) / 10 : 0,
    totalReviews:  result.length > 0 ? result[0].totalReviews : 0,
  })
}

// Recalculate after a review is saved
reviewSchema.post("save", function () {
  this.constructor.updateProductRating(this.product)
})

// Recalculate after a review is deleted
reviewSchema.post("findOneAndDelete", function (doc) {
  if (doc) doc.constructor.updateProductRating(doc.product)
})

export default mongoose.model("Review", reviewSchema)