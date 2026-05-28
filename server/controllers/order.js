import Stripe from 'stripe';
import HttpError from '../models/http-error.js';
import Order from '../models/orderModel.js';
import Cart from '../models/cartModel.js';
import { createOrderSchema, updateOrderStatusSchema } from '../schemas/orderSchema.js';

let stripeClient = null;
const getStripe = () => {
  if (!stripeClient) stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripeClient;
};

export const createOrder = async (req, res, next) => {
  try {
    const { firstName, lastName, shippingAddress } = createOrderSchema.parse(req.body);
    const { userId, email } = req.user;

    const cart = await Cart.findOne({ userId }).populate('products.productId');
    if (!cart || cart.products.length === 0) {
      return next(new HttpError('Cart is empty', 400));
    }

    const products = cart.products.map((item) => ({
      productId: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      quantity: item.quantity,
      imageUrl: item.productId.imageUrl,
      subtotal: parseFloat((item.productId.price * item.quantity).toFixed(2)),
    }));

    const subtotal = parseFloat(products.reduce((sum, p) => sum + p.subtotal, 0).toFixed(2));
    const tax = parseFloat((subtotal * 0.1).toFixed(2));
    const shipping = subtotal >= 100 ? 0 : 10;
    const total = parseFloat((subtotal + tax + shipping).toFixed(2));

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'usd',
      metadata: { userId },
    });

    const order = new Order({
      customer: { userId, firstName, lastName, email },
      products,
      shippingAddress,
      totalAmount: { subtotal, tax, shipping, total },
      stripeInfo: {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        paymentStatus: paymentIntent.status,
      },
    });

    await order.save();

    res.status(201).json({
      orderId: order._id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    return next(new HttpError('Failed to create order', 500));
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const orders = await Order.find({ 'customer.userId': userId }).sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (error) {
    return next(new HttpError('Failed to fetch orders', 500));
  }
};

export const handleStripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (error) {
    return res.status(400).json({ message: 'Webhook signature verification failed' });
  }

  try {
    const paymentIntent = event.data.object;

    if (event.type === 'payment_intent.succeeded') {
      await Order.findOneAndUpdate(
        { 'stripeInfo.paymentIntentId': paymentIntent.id },
        {
          status: 'paid',
          'stripeInfo.paymentStatus': paymentIntent.status,
          'stripeInfo.paidAt': new Date(),
        },
      );
    }

    if (event.type === 'payment_intent.payment_failed') {
      await Order.findOneAndUpdate(
        { 'stripeInfo.paymentIntentId': paymentIntent.id },
        {
          status: 'cancelled',
          'stripeInfo.paymentStatus': paymentIntent.status,
        },
      );
    }

    res.status(200).json({ received: true });
  } catch (error) {
    return next(new HttpError('Webhook handler failed', 500));
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const order = await Order.findById(id);
    if (!order) {
      return next(new HttpError('Order not found', 404));
    }

    if (order.customer.userId.toString() !== userId) {
      return next(new HttpError('Unauthorized', 403));
    }

    res.status(200).json({ order });
  } catch (error) {
    return next(new HttpError('Failed to fetch order', 500));
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    return next(new HttpError('Failed to fetch orders', 500));
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = updateOrderStatusSchema.parse(req.body);

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!order) {
      return next(new HttpError('Order not found', 404));
    }

    res.status(200).json({ order });
  } catch (error) {
    return next(new HttpError('Failed to update order status', 500));
  }
};
