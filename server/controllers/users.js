import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import HttpError from "../models/http-error.js";

const JWT_SECRET = process.env.JWT_SECRET;

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

  let user;
  try {
    user = await User.findOne({ email });
  } catch {
    return next(new HttpError("Login failed.", 500));
  }

  let passwordMatch = false;
  try {
    passwordMatch = await bcrypt.compare(password, user.password);
  } catch {
    return next(new HttpError("Login failed.", 500));
  }

  if (!passwordMatch) {
    return next(new HttpError("Invalid password.", 401));
  }

  const token = jwt.sign({
    email: user.email,
    userId: user._id.toString(),
  }, JWT_SECRET, 
{
  expiresIn: "24h"
});

  res.status(200).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

export const getProfile = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.user._id).populate("wishlist", "name price images");
  } catch {
    return next(new HttpError("Failed to fetch profile.", 500));
  }

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

  let user;
  try {
    user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
  } catch (err) {
    return next(new HttpError(err.message || "Failed to update profile.", 500));
  }

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
