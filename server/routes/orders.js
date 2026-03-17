import express from "express"
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orders.js"
import { protect, isAdmin } from "../middlewares/auth.middleware.js"
import { validate, createOrderRules } from "../middlewares/validate.js"

const router = express.Router()

router.post("/",              protect,          createOrderRules, validate, createOrder)
router.get("/my-orders",      protect,          getMyOrders)
router.get("/:id",            protect,          getOrderById)
router.patch("/:id/status",   protect, isAdmin, updateOrderStatus)

export default router