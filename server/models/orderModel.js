import mongoose from "mongoose"

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    // --- Snapshot fields --- //
    // Copied from product at time of purchase. 
    // These never change even if the product is updated or deleted.
    name:          { type: String, required: true },
    price:         { type: Number, required: true },
    discountPrice: { type: Number },
    image:         { type: String },
    size:          { type: String },
    color:         { type: String },
    quantity:      { type: Number, required: true, min: [1, "Quantity must be at least 1"] },
  },
  { _id: false }
)

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    street:   { type: String, required: true, trim: true },
    city:     { type: String, required: true, trim: true },
    state:    { type: String, required: true, trim: true },
    zip:      { type: String, required: true, trim: true },
    country:  { type: String, required: true, trim: true, default: "US" },
    phone:    { type: String, trim: true },
  },
  { _id: false }
)

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (val) => val.length > 0,
        message: "Order must contain at least one item",
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: [true, "Shipping address is required"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
    },
    statusHistory: [
      {
        status:    { type: String },
        changedAt: { type: Date, default: Date.now },
        note:      { type: String },  // e.g. "Shipped via FedEx — tracking #123"
        _id: false,
      },
    ],
    paymentMethod: {
      type: String,
      enum: ["card", "paypal", "apple_pay", "google_pay"],
      required: [true, "Payment method is required"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    subtotal:      { type: Number, required: true },  // before tax and shipping
    shippingCost:  { type: Number, required: true, default: 0 },
    tax:           { type: Number, required: true, default: 0 },
    totalPrice:    { type: Number, required: true },  // subtotal + shippingCost + tax
    trackingNumber: { type: String, trim: true },
    deliveredAt:   { type: Date },
    cancelledAt:   { type: Date },
  },
  { timestamps: true }
)

// Index — most common query patterns
orderSchema.index({ user: 1, createdAt: -1 })  // user's order history, newest first
orderSchema.index({ status: 1 })               // admin filtering by status

// Auto-push to statusHistory whenever status changes
orderSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.statusHistory.push({ status: this.status })
  }
  next()
})

// Auto-set deliveredAt and cancelledAt timestamps when status changes
orderSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    if (this.status === "delivered") this.deliveredAt  = Date.now()
    if (this.status === "cancelled") this.cancelledAt  = Date.now()
  }
  next()
})

// Virtual — price the customer actually paid per item (respects discountPrice)
orderItemSchema.virtual("paidPrice").get(function () {
  return this.discountPrice ?? this.price
})

// Virtual — total for a single line item
orderItemSchema.virtual("lineTotal").get(function () {
  return (this.discountPrice ?? this.price) * this.quantity
})

const Order = mongoose.model("Order", orderSchema)

export default Order