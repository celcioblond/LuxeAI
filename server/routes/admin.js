import express from "express";
import {
  getAllUsers,
  getUserById,
  setUserStatus,
  getAllOrders,
  getDashboardStats,
} from "../controllers/admin.js";
import { protect, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, isAdmin);

router.get("/stats",              getDashboardStats);

router.get("/users",              getAllUsers);
router.get("/users/:id",          getUserById);
router.patch("/users/:id/status", setUserStatus);

router.get("/orders",             getAllOrders);

export default router;
