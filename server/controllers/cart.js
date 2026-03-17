import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";
import HttpError from "../models/http-error.js";

export const getCart = async (req, res, next) => {
  let cart;
  try {
    cart = await Cart.findOne({ user: req.user._id }).populate("items.product", "name price discountPrice images isAvailable");
  } catch (err) {
    return next(new HttpError("Failed to fetch cart.", 500));
  }

  if (!cart) {
    return res.json({ cart: { items: [] } });
  }

  res.json({ cart });
};

export const addToCart = async (req, res, next) => {
  const { productId, quantity = 1, size, color } = req.body;

  if (!productId) {
    return next(new HttpError("productId is required.", 400));
  }

  // Verify product exists and is available
  let product;
  try {
    product = await Product.findById(productId);
  } catch {
    return next(new HttpError("Invalid product ID.", 400));
  }
  if (!product || !product.isAvailable) {
    return next(new HttpError("Product not found or unavailable.", 404));
  }

  let cart;
  try {
    cart = await Cart.findOne({ user: req.user._id });
  } catch (err) {
    return next(new HttpError("Failed to access cart.", 500));
  }

  if (!cart) {
    // Create new cart for user
    cart = new Cart({ user: req.user._id, items: [] });
  }

  // Check if the same product+size+color already exists
  const existing = cart.items.find(
    (item) =>
      item.product.toString() === productId &&
      item.size === size &&
      item.color === color
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity, size, color });
  }

  try {
    await cart.save();
  } catch (err) {
    return next(new HttpError(err.message || "Could not update cart.", 500));
  }

  await cart.populate("items.product", "name price discountPrice images");
  res.json({ cart });
};

export const updateQuantity = async (req, res, next) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return next(new HttpError("Quantity must be at least 1.", 400));
  }

  let cart;
  try {
    cart = await Cart.findOne({ user: req.user._id });
  } catch (err) {
    return next(new HttpError("Failed to access cart.", 500));
  }

  if (!cart) {
    return next(new HttpError("Cart not found.", 404));
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    return next(new HttpError("Cart item not found.", 404));
  }

  item.quantity = quantity;

  try {
    await cart.save();
  } catch (err) {
    return next(new HttpError("Could not update quantity.", 500));
  }

  res.json({ cart });
};

export const removeItem = async (req, res, next) => {
  let cart;
  try {
    cart = await Cart.findOne({ user: req.user._id });
  } catch (err) {
    return next(new HttpError("Failed to access cart.", 500));
  }

  if (!cart) {
    return next(new HttpError("Cart not found.", 404));
  }

  const itemExists = cart.items.id(req.params.itemId);
  if (!itemExists) {
    return next(new HttpError("Cart item not found.", 404));
  }

  cart.items.pull({ _id: req.params.itemId });

  try {
    await cart.save();
  } catch (err) {
    return next(new HttpError("Could not remove item.", 500));
  }

  res.json({ cart });
};

export const clearCart = async (req, res, next) => {
  let cart;
  try {
    cart = await Cart.findOne({ user: req.user._id });
  } catch (err) {
    return next(new HttpError("Failed to access cart.", 500));
  }

  if (!cart) {
    return res.json({ message: "Cart is already empty." });
  }

  cart.items = [];

  try {
    await cart.save();
  } catch (err) {
    return next(new HttpError("Could not clear cart.", 500));
  }

  res.json({ message: "Cart cleared." });
};
