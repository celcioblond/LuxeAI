import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
      required: true
    },
    stock: {
      type: Number,
      min: 0,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
  },
  {timestamps: true}
)

const Product = new mongoose.model("Product", productSchema);
export default Product;