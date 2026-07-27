import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';
import User from '../models/userModel.js';
import HttpError from '../models/http-error.js';
import bcrypt from "bcrypt";
import { loginSchema, registerSchema } from '../schemas/userSchema.js';

export const register = async (req, res, next) => {
  try {
    const {name, email, password} = registerSchema.parse(req.body);

    const existingUser = await User.findOne({email});

    if (existingUser) {
      return next(new HttpError("Email is already in use", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userCount = await User.countDocuments();

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: userCount === 0 ? 'admin' : 'user',
    });

    const result = await user.save();
    const token = jwt.sign({userId: user._id.toString(), email: user.email, role: user.role}, process.env.JWT_SECRET, {
      expiresIn: "24h"
    });

    res.status(201).json({
      message: "Succesfully registered",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch(error) {
    if(error instanceof ZodError) {
      return next(new HttpError(error.issues[0].message, 400));
    }
    return next(new HttpError("Registration failed", 500));
  }
}

export const login = async (req, res, next) => {
  try {
    const {email, password} = loginSchema.parse(req.body);

    const user = await User.findOne({email}).select('+password');
    if(!user) {
      return next(new HttpError("User was not found", 400));
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if(!passwordMatch) {
      return next(new HttpError("Password is invalid", 401));
    }
    const token = jwt.sign({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
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
        role: user.role
      }
    });
  } catch (error) {
    if(error instanceof ZodError) {
      return next(new HttpError(error.issues[0].message, 400));
    }
    return next(new HttpError("Login failed", 500));
  }
}
