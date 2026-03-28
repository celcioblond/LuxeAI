import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import HttpError from '../models/http-error.js';
import bcrypt from "bcrypt";

export const register = async (req, res, next) => {
  try {
    const {name, email, password} = req.body;

    if (!name || !email || !password) {
      return next(new HttpError("Name, email and password required", 400));
    }

    const existingUser = await User.findOne({email});
    
    if (existingUser) {
      return next(new HttpError("Email is already in use", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    const result = await user.save();
    const token = jwt.sign({userId: user._id.toString(), email: user.email, role: user.role}, process.env.JWT_SECRET, {
      expiresIn: "24h"
    });

    res.status(200).json({
      message: "Succesfully registered",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      }
    });
  } catch(error) {
    return next(new HttpError("Registration failed", 500));
  }
}

export const login = async (req, res, next) => {
  try {
    const {email, password} = req.body;
    if (!email || !password) {
      return next(new HttpError("Email and password required", 400));
    }

    const user = await User.findOne({email}).select("+password");
    if(!user) {
      return next(new HttpError("User was not found", 400));
    }

    let passwordMatch = await bcrypt.compare(password, user.password);
    if(!passwordMatch) {
      return next(new HttpError("Password is invalid", 401));
    }
    const token = jwt.sign({
      userId: user._id.toString(),
      email: user.email
    }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({
      message: "Login Succesfully",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    return next(new HttpError("Login failed", 500));
  }
}

export const getProfile = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.user._id).populate(
      'wishlist',
      'name price images',
    );
  } catch {
    return next(new HttpError('Failed to fetch profile.', 500));
  }

  if (!user) {
    return next(new HttpError('User not found.', 404));
  }

  res.json({ user });
};

export const updateProfile = async (req, res, next) => {
  const { name, address } = req.body;

  const updates = {};
  if (name) updates.name = name;
  if (address) updates.address = address;

  if (Object.keys(updates).length === 0) {
    return next(new HttpError('No valid fields to update.', 400));
  }

  let user;
  try {
    user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
  } catch (err) {
    return next(new HttpError(err.message || 'Failed to update profile.', 500));
  }

  res.json({ user });
};

export const getWishlist = async (req, res, next) => {
  let user;
  try {
    user = await User.findById(req.user._id).populate(
      'wishlist',
      'name price discountPrice images averageRating totalReviews isAvailable',
    );
  } catch {
    return next(new HttpError('Failed to fetch wishlist.', 500));
  }

  res.json({ wishlist: user.wishlist });
};

export const addToWishlist = async (req, res, next) => {
  const { productId } = req.params;

  let user;
  try {
    user = await User.findById(req.user._id);
  } catch {
    return next(new HttpError('Failed to fetch user.', 500));
  }

  const alreadyAdded = user.wishlist.some((id) => id.toString() === productId);
  if (alreadyAdded) {
    return next(new HttpError('Product is already in your wishlist.', 400));
  }

  user.wishlist.push(productId);

  try {
    await user.save();
  } catch (err) {
    return next(
      new HttpError(err.message || 'Could not update wishlist.', 500),
    );
  }

  res
    .status(201)
    .json({ message: 'Product added to wishlist.', wishlist: user.wishlist });
};

export const removeFromWishlist = async (req, res, next) => {
  const { productId } = req.params;

  let user;
  try {
    user = await User.findById(req.user._id);
  } catch {
    return next(new HttpError('Failed to fetch user.', 500));
  }

  const index = user.wishlist.findIndex((id) => id.toString() === productId);
  if (index === -1) {
    return next(new HttpError('Product not found in wishlist.', 404));
  }

  user.wishlist.splice(index, 1);

  try {
    await user.save();
  } catch (err) {
    return next(
      new HttpError(err.message || 'Could not update wishlist.', 500),
    );
  }

  res.json({
    message: 'Product removed from wishlist.',
    wishlist: user.wishlist,
  });
};
