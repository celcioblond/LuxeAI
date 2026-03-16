import mongoose from "mongoose"

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
      validate: {
        validator: function (val) {
          return val < this.price
        },
        message: "Discount price must be less than the original price",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["clothing", "shoes", "accessories", "bags"],
    },
    tags: [String],  // e.g. ["new arrival", "trending", "sale"]
    images: [String],
    variants: [
      {
        size:  { type: String, enum: ["XS", "S", "M", "L", "XL", "XXL"] },
        color: { type: String, trim: true },
        stock: { type: Number, default: 0, min: 0 },
        _id: false,
      },
    ],
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    releaseDate: {
      type: Date,
      default: Date.now,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1, price: 1 });          
productSchema.index({ releaseDate: -1 });              
productSchema.index({ averageRating: -1 });        
productSchema.index({ totalReviews: -1});

productSchema.virtual("isOnSale").get(function () {
  return this.discountPrice != null && this.discountPrice < this.price
});

productSchema.virtual("effectivePrice").get(function () {
  return this.discountPrice ?? this.price
});


const Product = mongoose.model("Product", productSchema)

export default Product