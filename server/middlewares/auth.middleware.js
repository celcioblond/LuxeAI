import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import HttpError from "../models/http-error.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if(!authHeader){
      return next(new HttpError("Not authenticated"), 401);
    }
    const token = authHeader.split(" ")[1];
    if(!token){
      return next(new HttpError("Token is missing"), 401);
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    if(!decoded){
      return next(new HttpError("Failed to authenticate"), 401);
    }
    req.user = decoded.user;
    next();
  } catch(error) {
    return next(new HttpError("Failure"), 401);
  }
}


export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new HttpError("Access denied. Admins only.", 403));
  }
  next();
};
