//Seed script to be injected in db to initialize dummy data

import 'dotenv/config';
import mongoose from 'mongoose';
import productsData from './data/productsData.js';
import usersData from './data/userData.js';
import Cart from './models/cartModel.js';
import Order from './models/orderModel.js';
import Product from './models/productModel.js';
import User from './models/userModel.js';
import hashPassword from './utils/hashPass.js';
import { syncRecommendations } from './utils/syncRecommendations.js';

//Same pricing rules as controllers/order.js so seeded orders match real ones
const makeOrder = (customer, products, quantities) => {
  const [firstName, lastName] = customer.name.split(' ');
  const { email, address } = customer;
  const items = products.map((product, i) => ({
    productId: product._id,
    name: product.name,
    price: product.price,
    quantity: quantities[i],
    imageUrl: product.imageUrl,
    subtotal: Number((product.price * quantities[i]).toFixed(2)),
  }));
  const subtotal = Number(
    items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2),
  );
  const tax = Number((subtotal * 0.1).toFixed(2));
  const shipping = subtotal >= 100 ? 0 : 10;
  const total = Number((subtotal + tax + shipping).toFixed(2));

  return {
    customer: {
      userId: customer._id,
      firstName,
      lastName,
      email,
    },
    products: items,
    shippingAddress: address,
    totalAmount: {
      subtotal,
      tax,
      shipping,
      total,
    },
    status: 'delivered',
    stripeInfo: { paymentStatus: 'succeeded', paidAt: new Date() },
  };
};

const seedDb = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('URI is not set');
  }
  //Verification steps
  if (uri.startsWith('mongodb+srv') && !process.argv.includes('--force')) {
    throw new Error(
      'MONGODB_URI targets Atlas. Re-run with --force if intended.',
    );
  }
  try {
    //Connect to db
    const conn = await mongoose.connect(uri);
    console.log(`Connected to database, seeding ${conn.connection.name}`);

    //Delete data first
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      Cart.deleteMany({}),
    ]);
    console.log('Deleted old data.');

    //Seed users and store them to make the order
    const users = await User.insertMany(
      await Promise.all(
        usersData.map(async (user) => ({
          name: user.name,
          email: user.email,
          password: await hashPassword(user.password),
          role: user.role,
          address: user.address,
        })),
      ),
    );
    console.log(`Inserted ${users.length} users.`);

    //Seed products
    const products = await Product.insertMany(productsData);
    console.log(`Inserted ${products.length} products.`);

    //Seed orders for regular users only
    const customers = users.filter((user) => user.role === 'user');
    const orders = await Order.insertMany([
      makeOrder(customers[0], [products[0], products[1]], [1, 2]),
      makeOrder(customers[0], [products[4]], [1]),
      makeOrder(
        customers[1],
        [products[2], products[7], products[9]],
        [1, 1, 3],
      ),
    ]);
    console.log(`Inserted ${orders.length} orders.`);

    //Seed a cart so the cart page has something to show
    await Cart.create({
      userId: customers[1]._id,
      products: [
        { productId: products[5]._id, quantity: 1 },
        { productId: products[3]._id, quantity: 2 },
      ],
    });
    console.log('Inserted 1 cart.');

    //Tell the AI service to re-embed the new catalog
    syncRecommendations();
  } catch (error) {
    console.log(error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedDb().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
