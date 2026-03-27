import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import HttpError from "../models/http-error.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const protect = async (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    return next(new HttpError("Not authenticated. Please log in.", 401));
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return next(new HttpError("Invalid or expired token. Please log in again.", 401));
  }
  next();
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new HttpError("Access denied. Admins only.", 403));
  }
  next();
};
