import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import HttpError from "../models/http-error.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new HttpError("Not authenticated. Please log in.", 401));
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new HttpError("Invalid or expired token. Please log in again.", 401));
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    return next(new HttpError("User no longer exists.", 401));
  }

  if (user.passwordChangedAfter(decoded.iat)) {
    return next(new HttpError("Password was recently changed. Please log in again.", 401));
  }

  req.user = user;
  next();
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return next(new HttpError("Access denied. Admins only.", 403));
  }
  next();
};
