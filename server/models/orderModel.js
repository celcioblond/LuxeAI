import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    customer: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        imageUrl: { type: String, required: true },
        subtotal: { type: Number, required: true },
      },
    ],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, required: true },
    },
    totalAmount: {
      subtotal: { type: Number, required: true, min: 0 },
      tax: { type: Number, required: true, min: 0 },
      shipping: { type: Number, required: true, min: 0 },
      total: { type: Number, required: true, min: 0 },
    },
    status: {
      type: String,
      enum: [
        'pending',
        'paid',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
    },
    stripeInfo: {
      paymentIntentId: { type: String },
      clientSecret: { type: String },
      paymentStatus: { type: String },
      paidAt: { type: Date },
    },
  },
  { timestamps: true },
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
