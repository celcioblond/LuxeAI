// ✅ Fixed
import express from "express"
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orders.js"
import { protect, isAdmin } from "../middlewares/auth.middleware.js"

const router = express.Router()

// All order routes are protected — you must be logged in
router.post("/",              protect,          createOrder)
router.get("/my-orders",      protect,          getMyOrders)
router.get("/:id",            protect,          getOrderById)       // was missing /
router.patch("/:id/status",   protect, isAdmin, updateOrderStatus)  // admin only

export default router