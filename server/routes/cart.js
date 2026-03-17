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
router.patch("/:itemId",  protect, updateQuantity)  // PATCH to update quantity
router.delete("/:itemId", protect, removeItem)      // must come before /
router.delete("/",        protect, clearCart)

export default router