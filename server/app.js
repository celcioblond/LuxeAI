import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import HttpError from './models/http-error.js';
import admin from './routes/admin.js';
import auth from './routes/auth.js';
import cart from './routes/cart.js';
import orders from './routes/orders.js';
import { handleStripeWebhook } from './controllers/order.js';
import products from './routes/products.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const FRONT_URL = process.env.FRONT_URL;
const app = express();

app.use(
  cors({
    origin: FRONT_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);
app.use(morgan('dev'));

app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
app.post('/api/webhooks/stripe', handleStripeWebhook);
app.use(express.json({ limit: '10kb' }));

app.use('/api/auth', auth);
app.use('/api/products', products);
app.use('/api/cart', cart);
app.use('/api/admin', admin);
app.use('/api/orders', orders);

app.use((_req, _res, next) => {
  next(new HttpError('Could not find this route', 404));
});

app.use((error, _req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message, data });
});

export default app;
