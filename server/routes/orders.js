import express from "express"
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
} from "../controllers/orders.js"
import { protect, isAdmin } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.post("/",              protect, createOrder)
router.get("/my-orders",      protect,          getMyOrders)
router.get("/:id",            protect,          getOrderById)
router.patch("/:id/cancel",   protect,          cancelOrder)
router.patch("/:id/status",   protect, isAdmin, updateOrderStatus)

export default router