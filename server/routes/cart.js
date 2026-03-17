import express from "express"
import {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart,
} from "../controllers/cart.js"
import { protect } from "../middlewares/auth.middleware.js"
import { validate, addToCartRules, updateCartRules } from "../middlewares/validate.js"

const router = express.Router()

router.get("/",           protect, getCart)
router.post("/",          protect, addToCartRules,  validate, addToCart)
router.patch("/:itemId",  protect, updateCartRules, validate, updateQuantity)
router.delete("/:itemId", protect, removeItem)
router.delete("/",        protect, clearCart)

export default router