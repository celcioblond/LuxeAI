import jwt from "jsonwebtoken";
import HttpError from "../models/http-error.js";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if(!authHeader){
      return next(new HttpError("Not authenticated", 401));
    }
    const token = authHeader.split(" ")[1];
    if(!token){
      return next(new HttpError("Token is missing", 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch(error) {
    return next(new HttpError("Failure", 401));
  }
}

// Reads the role from the database, not the token: a token keeps the role it
// was issued with, so a demoted (or deleted) admin would otherwise keep access
// until it expires.
export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("role");
    if (user?.role !== "admin") {
      return next(new HttpError("Admins only", 403));
    }
    next();
  } catch (error) {
    return next(new HttpError("Admins only", 403));
  }
}
