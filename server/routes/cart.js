import express from "express"
import {
  getCart,
  addToCart,
  updateCart,
  deleteProduct,
  getCartTotal,
  clearCart
} from "../controllers/cart.js"
import { protect } from "../middlewares/auth.middleware.js"

const router = express.Router()

router.get("/getCart/:userId",           protect, getCart)
router.post("/addToCart",          protect, addToCart)
router.patch("/updateCart/:userId",  protect, updateCart)
router.delete("/deleteProduct/:userId", protect, deleteProduct)
router.get("total/:userId". protect, getCartTotal)
router.delete("/clearCart/:userId",        protect, clearCart)

export default router