import express from "express"
import {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart,
} from "../controllers/cart.js"
import { protect } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.get("/",           protect, getCart)
router.post("/",          protect, addToCart)
router.patch("/:itemId",  protect, updateQuantity)
router.delete("/:itemId", protect, removeItem)
router.delete("/",        protect, clearCart)

export default router