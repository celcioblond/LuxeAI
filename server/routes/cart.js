import express from 'express';
import {
  addToCart,
  clearCart,
  deleteProduct,
  getCart,
  getCartTotal,
  updateCart,
} from '../controllers/cart.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/getCart/:userId', getCart);
router.post('/addToCart', addToCart);
router.patch('/updateCart/:userId', updateCart);
router.delete('/deleteProduct/:userId/:productId', deleteProduct);
router.get('/total/:userId', getCartTotal);
router.delete('/clearCart/:userId', clearCart);

export default router;
