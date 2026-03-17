import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import HttpError from "../models/http-error.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new HttpError("Name, email, and password are required.", 400));
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new HttpError("Email already in use.", 422));
  }

  let user;
  try {
    user = await User.create({ name, email, password });
  } catch (err) {
    return next(new HttpError(err.message || "Registration failed.", 500));
  }

  const token = signToken(user._id);

  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new HttpError("Email and password are required.", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return next(new HttpError("Invalid email or password.", 401));
  }

  if (!user.isActive) {
    return next(new HttpError("This account has been deactivated.", 403));
  }

  const token = signToken(user._id);

  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

export const getProfile = async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("wishlist", "name price images");

  if (!user) {
    return next(new HttpError("User not found.", 404));
  }

  res.json({ user });
};

export const updateProfile = async (req, res, next) => {
  const { name, address } = req.body;

  const updates = {};
  if (name) updates.name = name;
  if (address) updates.address = address;

  if (Object.keys(updates).length === 0) {
    return next(new HttpError("No valid fields to update.", 400));
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ user });
};

// GET /api/auth/wishlist
export const getWishlist = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.user._id).populate(
      "wishlist",
      "name price discountPrice images averageRating totalReviews isAvailable"
    );
  } catch {
    return next(new HttpError("Failed to fetch wishlist.", 500));
  }

  res.json({ wishlist: user.wishlist });
};

// POST /api/auth/wishlist/:productId
export const addToWishlist = async (req, res, next) => {
  const { productId } = req.params;

  let user;
  try {
    user = await User.findById(req.user._id);
  } catch {
    return next(new HttpError("Failed to fetch user.", 500));
  }

  const alreadyAdded = user.wishlist.some((id) => id.toString() === productId);
  if (alreadyAdded) {
    return next(new HttpError("Product is already in your wishlist.", 400));
  }

  user.wishlist.push(productId);

  try {
    await user.save();
  } catch (err) {
    return next(new HttpError(err.message || "Could not update wishlist.", 500));
  }

  res.status(201).json({ message: "Product added to wishlist.", wishlist: user.wishlist });
};

// DELETE /api/auth/wishlist/:productId
export const removeFromWishlist = async (req, res, next) => {
  const { productId } = req.params;

  let user;
  try {
    user = await User.findById(req.user._id);
  } catch {
    return next(new HttpError("Failed to fetch user.", 500));
  }

  const index = user.wishlist.findIndex((id) => id.toString() === productId);
  if (index === -1) {
    return next(new HttpError("Product not found in wishlist.", 404));
  }

  user.wishlist.splice(index, 1);

  try {
    await user.save();
  } catch (err) {
    return next(new HttpError(err.message || "Could not update wishlist.", 500));
  }

  res.json({ message: "Product removed from wishlist.", wishlist: user.wishlist });
};
