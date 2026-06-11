import HttpError from '../models/http-error.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import { updateUserSchema } from '../schemas/userSchema.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [userCount, productCount, orderCount] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
    ]);
    res.status(200).json({ userCount, productCount, orderCount });
  } catch (error) {
    return next(new HttpError(`Failed to get stats: ${error.message}`, 500));
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().select('-password').skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    res.status(200).json({ users, total, page, limit });
  } catch (error) {
    return next(new HttpError(`Failed to get users: ${error.message}`, 500));
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const updateUser = updateUserSchema.parse(req.body);

    const user = await User.findByIdAndUpdate(id, updateUser, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return next(new HttpError('User not found', 404));
    }

    res.status(200).json({ user });
  } catch (error) {
    return next(new HttpError(`Failed to update user: ${error.message}`, 500));
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return next(new HttpError('User not found', 404));
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return next(new HttpError(`Failed to delete user: ${error.message}`, 500));
  }
};
