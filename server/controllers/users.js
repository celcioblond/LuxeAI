import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import HttpError from '../models/http-error.js';
import bcrypt from "bcrypt";
import { loginSchema, registerSchema } from '../schemas/userSchema.js';

export const register = async (req, res, next) => {
  try {
    const {name, email, password} = registerSchema.parse(req.body);

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
        role: user.role
      }
    });
  } catch(error) {
    return next(new HttpError("Registration failed", 500));
  }
}

export const login = async (req, res, next) => {
  try {
    const {email, password} = loginSchema.parse(req.body);
    if (!email || !password) {
      return next(new HttpError("Email and password required", 400));
    }

    const user = await User.findOne({email});
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
    return next(new HttpError("Login failed", 500));
  }
}
