import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import HttpError from "../models/http-error.js";

const TAX_RATE      = 0.10;  // 10%
const SHIPPING_FREE = 100;   // free shipping over $100
const SHIPPING_COST = 10;    // flat rate otherwise

export const createOrder = async (req, res, next) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    return next(new HttpError("Order must contain at least one item.", 400));
  }
  if (!shippingAddress) {
    return next(new HttpError("Shipping address is required.", 400));
  }
  if (!paymentMethod) {
    return next(new HttpError("Payment method is required.", 400));
  }

  // Build snapshots, validate stock, and collect pending decrements
  let orderItems;
  const stockDecrements = []; // { product, variantIndex | null, quantity }

  try {
    orderItems = await Promise.all(
      items.map(async ({ productId, quantity, size, color }) => {
        const product = await Product.findById(productId);
        if (!product) throw new Error(`Product ${productId} not found.`);
        if (!product.isAvailable) throw new Error(`${product.name} is no longer available.`);

        // Match against a specific variant when size/color are provided
        const variantIndex =
          size != null || color != null
            ? product.variants.findIndex(
                (v) =>
                  (size  == null || v.size  === size) &&
                  (color == null || v.color === color)
              )
            : -1;

        if (variantIndex !== -1) {
          // Variant-level stock check
          const variant = product.variants[variantIndex];
          if (variant.stock < quantity) {
            throw new Error(
              `Not enough stock for ${product.name} (${size ?? ""}${color ? " / " + color : ""}). Available: ${variant.stock}.`
            );
          }
          stockDecrements.push({ product, variantIndex, quantity });
        } else {
          // Fall back to overall product stock
          if (product.stock < quantity) {
            throw new Error(
              `Not enough stock for ${product.name}. Available: ${product.stock}.`
            );
          }
          stockDecrements.push({ product, variantIndex: null, quantity });
        }

        return {
          product:       product._id,
          name:          product.name,
          price:         product.price,
          discountPrice: product.discountPrice,
          image:         product.images?.[0],
          size,
          color,
          quantity,
        };
      })
    );
  } catch (err) {
    return next(new HttpError(err.message || "Failed to validate order items.", 400));
  }

  const subtotal = orderItems.reduce((sum, item) => {
    return sum + (item.discountPrice ?? item.price) * item.quantity;
  }, 0);

  const shippingCost = subtotal >= SHIPPING_FREE ? 0 : SHIPPING_COST;
  const tax          = subtotal * TAX_RATE;
  const totalPrice   = subtotal + shippingCost + tax;

  let order;
  try {
    order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      tax,
      totalPrice,
    });
  } catch (err) {
    return next(new HttpError(err.message || "Could not create order.", 500));
  }

  // Decrement stock now that the order is persisted
  await Promise.all(
    stockDecrements.map(({ product, variantIndex, quantity }) => {
      if (variantIndex !== null) {
        product.variants[variantIndex].stock -= quantity;
      } else {
        product.stock -= quantity;
      }

      // Auto-mark unavailable when all stock is exhausted
      const totalStock =
        product.variants.length > 0
          ? product.variants.reduce((sum, v) => sum + v.stock, 0)
          : product.stock;

      if (totalStock === 0) product.isAvailable = false;

      return product.save();
    })
  );

  res.status(201).json({ order });
};

export const getMyOrders = async (req, res, next) => {
  let orders;
  try {
    orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  } catch (err) {
    return next(new HttpError("Failed to fetch orders.", 500));
  }

  res.json({ orders });
};

export const getOrderById = async (req, res, next) => {
  let order;
  try {
    order = await Order.findById(req.params.id);
  } catch {
    return next(new HttpError("Invalid order ID.", 400));
  }

  if (!order) {
    return next(new HttpError("Order not found.", 404));
  }

  // Users can only see their own orders; admins can see any
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(new HttpError("Not authorized to view this order.", 403));
  }

  res.json({ order });
};

export const updateOrderStatus = async (req, res, next) => {
  const { status, note } = req.body;

  const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
  if (!status || !validStatuses.includes(status)) {
    return next(new HttpError(`Invalid status. Must be one of: ${validStatuses.join(", ")}`, 400));
  }

  let order;
  try {
    order = await Order.findById(req.params.id);
  } catch {
    return next(new HttpError("Invalid order ID.", 400));
  }

  if (!order) {
    return next(new HttpError("Order not found.", 404));
  }

  order.status = status;
  if (note) order.statusHistory[order.statusHistory.length - 1].note = note;

  try {
    await order.save();
  } catch (err) {
    return next(new HttpError(err.message || "Could not update order status.", 500));
  }

  res.json({ order });
};
