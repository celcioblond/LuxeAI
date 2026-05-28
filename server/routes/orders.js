import express from 'express';
import { createOrder, getMyOrders, getOrderById } from '../controllers/order.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/me', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

export default router;
