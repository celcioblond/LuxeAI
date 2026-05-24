import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/admin.js";
import { protect, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect, isAdmin);

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;
