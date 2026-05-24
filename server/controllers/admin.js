import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import HttpError from '../models/http-error.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [userCount, productCount] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
    ]);
    res.status(200).json({ userCount, productCount });
  } catch (error) {
    return next(new HttpError(`Failed to get stats: ${error.message}`, 500));
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ users });
  } catch (error) {
    return next(new HttpError(`Failed to get users: ${error.message}`, 500));
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, address } = req.body;

    const updatedData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;

    if (address) {
      if (address.street !== undefined) {
        updateData['address.street'] = address.street;
      }

      if (address.city !== undefined) {
        updateData['address.city'] = address.city;
      }

      if (address.state !== undefined) {
        updateData['address.state'] = address.state;
      }

      if (address.zip !== undefined) {
        updateData['address.zip'] = address.zip;
      }

      if (address.country !== undefined) {
        updateData['address.country'] = address.country;
      }

      const user = await User.findByIdAndUpdate(
        id,
        {$set: updatedData},
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");
    }

    if (!user) {
      return next(new HttpError("User not foudn", 404));
    }

    res.status(200).json({user});
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
