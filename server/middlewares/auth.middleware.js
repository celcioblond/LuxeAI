import jwt from "jsonwebtoken";
import HttpError from "../models/http-error.js";

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
    if(!decoded){
      return next(new HttpError("Failed to authenticate", 401));
    }
    req.user = decoded;
    next();
  } catch(error) {
    return next(new HttpError("Failure"), 401);
  }
}

export const isAdmin = (req, res, next) => {
  const role = req.user.role;
  if (role !== "admin") {
    return next(new HttpError("Admins only", 403));
  }
  next();
}

// export const isAdmin = (req, res, next) => {
//   if (req.user.role !== "admin") {
//     return next(new HttpError("Access denied. Admins only.", 403));
//   }
//   next();
// };
