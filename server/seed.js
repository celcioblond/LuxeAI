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

const DAY_MS = 24 * 60 * 60 * 1000;
const PAID_STATUSES = ['paid', 'processing', 'shipped', 'delivered'];

//Small seeded PRNG (mulberry32): the "random" orders come out identical on
//every machine and every run, so everyone who clones gets the same data.
const createRandom = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const random = createRandom(42);
const randomInt = (min, max) => min + Math.floor(random() * (max - min + 1));
const pick = (items) => items[Math.floor(random() * items.length)];

//Weighted so most orders are completed, plus a few pending/cancelled ones,
//which the recommender must ignore
const pickStatus = () => {
  const r = random();
  if (r < 0.45) return 'delivered';
  if (r < 0.6) return 'shipped';
  if (r < 0.7) return 'processing';
  if (r < 0.85) return 'paid';
  if (r < 0.93) return 'pending';
  return 'cancelled';
};

//Same pricing rules as controllers/order.js so seeded orders match real ones
const makeOrder = (customer, products, quantities, status, createdAt) => {
  const [firstName, ...rest] = customer.name.split(' ');
  const lastName = rest.join(' ');
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

  //Mirrors what Stripe reports for each state
  const stripeInfo = PAID_STATUSES.includes(status)
    ? {
        paymentStatus: 'succeeded',
        paidAt: new Date(createdAt.getTime() + 5 * 60 * 1000),
      }
    : {
        paymentStatus:
          status === 'pending' ? 'requires_payment_method' : 'canceled',
      };

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
    status,
    stripeInfo,
    createdAt,
    updatedAt: createdAt,
  };
};

//1-3 different products, mostly (80%) from the user's affinity category
const pickOrderProducts = (products, affinity) => {
  const own = products.filter((p) => p.category === affinity);
  const others = products.filter((p) => p.category !== affinity);
  const chosen = new Set();
  const count = randomInt(1, 3);
  while (chosen.size < count) {
    chosen.add(random() < 0.8 ? pick(own) : pick(others));
  }
  return [...chosen];
};

const buildOrders = (users, products) => {
  const now = Date.now();
  const orders = [];
  for (const user of users) {
    if (user.role !== 'user' || !user.affinity) continue;
    //The documented sample users get a fuller history
    const isSampleUser = !user.email.endsWith('@example.com');
    const orderCount = isSampleUser ? 3 : randomInt(1, 2);
    for (let i = 0; i < orderCount; i++) {
      const items = pickOrderProducts(products, user.affinity);
      const quantities = items.map(() => randomInt(1, 2));
      //Sample users' orders all count, so their recommendations are predictable
      const status = isSampleUser ? 'delivered' : pickStatus();
      const createdAt = new Date(now - randomInt(1, 90) * DAY_MS);
      orders.push(makeOrder(user, items, quantities, status, createdAt));
    }
  }
  return orders.sort((a, b) => a.createdAt - b.createdAt);
};

//Carts by email + product name, so they stay readable and in stock
const CARTS = [
  {
    email: 'carlos@hotmail.com',
    items: [
      ['Ergonomic Wireless Mouse', 1],
      ['USB-C Charging Hub', 2],
    ],
  },
  {
    email: 'emma.wilson@example.com',
    //Asks for every unit left, to try the stock checks at checkout
    items: [['Compression Training Shirt', 2]],
  },
  {
    email: 'olivia.garcia@example.com',
    items: [
      ['Vitamin C Serum', 1],
      ['Mineral Sunscreen SPF 50', 1],
    ],
  },
  {
    email: 'mason.anderson@example.com',
    items: [["Chef's Knife", 1]],
  },
  {
    email: 'grace.scott@example.com',
    items: [
      ['Leather Tote Bag', 1],
      ['Gold Chain Necklace', 1],
    ],
  },
];

const buildCarts = (users, products) =>
  CARTS.map(({ email, items }) => {
    const user = users.find((u) => u.email === email);
    return {
      userId: user._id,
      products: items.map(([name, quantity]) => {
        const product = products.find((p) => p.name === name);
        if (!product || quantity > product.stock) {
          throw new Error(`Seed cart for ${email}: "${name}" is not available`);
        }
        return { productId: product._id, quantity };
      }),
    };
  });

//Collections + indexes the app expects, including the one the AI service owns
const ensureCollections = async () => {
  await Promise.all(
    [User, Product, Order, Cart].map((model) => model.createIndexes()),
  );
  const { db } = mongoose.connection;
  const existing = await db
    .listCollections({ name: 'saved_recommendations' })
    .toArray();
  if (existing.length === 0) {
    await db.createCollection('saved_recommendations');
  }
  await db
    .collection('saved_recommendations')
    .createIndex({ userId: 1 }, { unique: true });
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
      // Owned by the AI service; would point to the old product ids otherwise
      mongoose.connection.collection('saved_recommendations').deleteMany({}),
    ]);
    console.log('Deleted old data.');

    await ensureCollections();

    //Hash each distinct password once (the generated users share one)
    const hashes = new Map();
    for (const { password } of usersData) {
      if (!hashes.has(password)) {
        hashes.set(password, await hashPassword(password));
      }
    }

    //Seed users and keep their affinity to build the orders
    const inserted = await User.insertMany(
      usersData.map((user) => ({
        name: user.name,
        email: user.email,
        password: hashes.get(user.password),
        role: user.role,
        address: user.address,
      })),
    );
    const users = inserted.map((user, i) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      address: user.address,
      affinity: usersData[i].affinity,
    }));
    console.log(`Inserted ${users.length} users.`);

    //Seed products
    const products = await Product.insertMany(productsData);
    console.log(`Inserted ${products.length} products.`);

    //Seed orders; timestamps: false keeps the spread-out createdAt dates
    const orders = await Order.insertMany(buildOrders(users, products), {
      timestamps: false,
    });
    const byStatus = orders.reduce((counts, order) => {
      counts[order.status] = (counts[order.status] ?? 0) + 1;
      return counts;
    }, {});
    console.log(`Inserted ${orders.length} orders:`, byStatus);

    const carts = await Cart.insertMany(buildCarts(users, products));
    console.log(`Inserted ${carts.length} carts.`);

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
