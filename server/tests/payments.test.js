import { jest } from '@jest/globals';

// Controllable Stripe mock: each test decides what Stripe "reports".
// ESM requires unstable_mockModule + dynamic imports for this to work.
const createPaymentIntent = jest.fn();
const retrievePaymentIntent = jest.fn();
const updatePaymentIntent = jest.fn();
const constructEvent = jest.fn((body, signature) => {
  if (signature !== 'valid-signature') {
    throw new Error('No signatures found matching the expected signature');
  }
  return JSON.parse(body.toString());
});

jest.unstable_mockModule('stripe', () => ({
  default: jest.fn(() => ({
    paymentIntents: {
      create: createPaymentIntent,
      retrieve: retrievePaymentIntent,
      update: updatePaymentIntent,
    },
    webhooks: { constructEvent },
  })),
}));

// Paying an order triggers a recommender sync; keep it off the network
global.fetch = jest.fn().mockResolvedValue({ ok: true });

const { default: mongoose } = await import('mongoose');
const { default: request } = await import('supertest');
const { default: app } = await import('../app.js');
const { default: User } = await import('../models/userModel.js');
const { default: Product } = await import('../models/productModel.js');
const { default: Order } = await import('../models/orderModel.js');
const { default: Cart } = await import('../models/cartModel.js');
const { default: cache } = await import('../utils/cache.js');

let userToken;
let userId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(async () => {
  const response = await request(app).post('/api/auth/register').send({
    name: 'Ryan Ray',
    email: 'ryanray@outlook.com',
    password: 'Password1!',
  });
  userToken = response.body.token;
  userId = response.body.user.id;
  retrievePaymentIntent.mockResolvedValue({ status: 'succeeded' });
  createPaymentIntent.mockResolvedValue({
    id: 'pi_test_123',
    client_secret: 'secret_test_123',
    status: 'requires_payment_method',
  });
  updatePaymentIntent.mockImplementation(async (id, { amount }) => ({
    id,
    amount,
    status: 'requires_payment_method',
  }));
});

afterEach(async () => {
  await User.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});
  await Cart.deleteMany({});
  cache.flushAll();
  jest.clearAllMocks();
});

const createProduct = (stock = 10) =>
  Product.create({
    name: 'Luxury Watch',
    price: 299.99,
    description: 'A premium timepiece for the discerning buyer',
    category: 'Accessories',
    stock,
    imageUrl: 'https://example.com/watch.jpg',
  });

const createPendingOrder = (product, quantity = 2, owner = userId) =>
  Order.create({
    customer: {
      userId: owner,
      firstName: 'Ryan',
      lastName: 'Ray',
      email: 'ryanray@outlook.com',
    },
    products: [
      {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity,
        imageUrl: product.imageUrl,
        subtotal: product.price * quantity,
      },
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'US',
    },
    totalAmount: { subtotal: 599.98, tax: 60, shipping: 0, total: 659.98 },
    status: 'pending',
    stripeInfo: {
      paymentIntentId: 'pi_test_123',
      clientSecret: 'secret',
      paymentStatus: 'requires_payment_method',
    },
  });

const confirm = (order) =>
  request(app).post(`/api/orders/${order._id}/confirm`).set('Authorization', `Bearer ${userToken}`);

const sendWebhook = (event, signature = 'valid-signature') =>
  request(app)
    .post('/api/webhooks/stripe')
    .set('Content-Type', 'application/json')
    .set('stripe-signature', signature)
    .send(JSON.stringify(event));

const paymentEvent = (type, id = 'pi_test_123') => ({
  type,
  data: {
    object: {
      id,
      status: type === 'payment_intent.succeeded' ? 'succeeded' : 'requires_payment_method',
    },
  },
});

const stockOf = async (product) => (await Product.findById(product._id)).stock;

// ---------------------------------------------------------------------------
describe('POST /api/orders/:id/confirm', () => {
  test('should mark the order paid and decrement stock when Stripe reports succeeded', async () => {
    const product = await createProduct(10);
    const order = await createPendingOrder(product, 2);

    const response = await confirm(order);

    expect(response.statusCode).toBe(200);
    expect(response.body.order.status).toBe('paid');
    expect(response.body.order.stripeInfo.paidAt).toBeDefined();
    expect(await stockOf(product)).toBe(8);
    expect(retrievePaymentIntent).toHaveBeenCalledWith('pi_test_123');
  });

  test('should decrement stock only once when confirmed twice', async () => {
    const product = await createProduct(10);
    const order = await createPendingOrder(product, 2);

    await confirm(order);
    const second = await confirm(order);

    expect(second.statusCode).toBe(200);
    expect(second.body.order.status).toBe('paid');
    expect(await stockOf(product)).toBe(8);
  });

  test('should return 400 and leave the order pending when the payment did not succeed', async () => {
    retrievePaymentIntent.mockResolvedValue({ status: 'requires_payment_method' });
    const product = await createProduct(10);
    const order = await createPendingOrder(product, 2);

    const response = await confirm(order);

    expect(response.statusCode).toBe(400);
    expect((await Order.findById(order._id)).status).toBe('pending');
    expect(await stockOf(product)).toBe(10);
  });

  test('should never take stock below zero', async () => {
    const product = await createProduct(1);
    const order = await createPendingOrder(product, 2);

    await confirm(order);

    expect(await stockOf(product)).toBe(1);
  });

  test('should drop the cached catalog so the new stock is visible right away', async () => {
    const product = await createProduct(10);
    const order = await createPendingOrder(product, 2);
    await request(app).get('/api/products'); // fills the cache with stock 10

    await confirm(order);
    const response = await request(app).get('/api/products');

    expect(response.body.products[0].stock).toBe(8);
  });

  test('should ask the recommender to resync after the stock changes', async () => {
    const product = await createProduct(10);
    const order = await createPendingOrder(product, 1);

    await confirm(order);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/recommendations/sync' }),
      { method: 'POST' },
    );
  });

  test('should return 403 when the order belongs to another user', async () => {
    const product = await createProduct(10);
    const order = await createPendingOrder(product, 1, new mongoose.Types.ObjectId());

    const response = await confirm(order);

    expect(response.statusCode).toBe(403);
    expect(await stockOf(product)).toBe(10);
  });

  test('should return 404 when the order does not exist', async () => {
    const response = await confirm({ _id: new mongoose.Types.ObjectId() });

    expect(response.statusCode).toBe(404);
  });
});

// ---------------------------------------------------------------------------
describe('POST /api/webhooks/stripe', () => {
  test('should return 400 when the signature is invalid', async () => {
    const product = await createProduct(10);
    const order = await createPendingOrder(product, 2);

    const response = await sendWebhook(paymentEvent('payment_intent.succeeded'), 'forged');

    expect(response.statusCode).toBe(400);
    expect((await Order.findById(order._id)).status).toBe('pending');
  });

  test('should mark the order paid and decrement stock on payment_intent.succeeded', async () => {
    const product = await createProduct(10);
    const order = await createPendingOrder(product, 2);

    const response = await sendWebhook(paymentEvent('payment_intent.succeeded'));

    expect(response.statusCode).toBe(200);
    expect(response.body.received).toBe(true);
    const paid = await Order.findById(order._id);
    expect(paid.status).toBe('paid');
    expect(paid.stripeInfo.paidAt).toBeDefined();
    expect(await stockOf(product)).toBe(8);
  });

  test('should not decrement stock again when Stripe retries the same event', async () => {
    const product = await createProduct(10);
    await createPendingOrder(product, 2);

    await sendWebhook(paymentEvent('payment_intent.succeeded'));
    await sendWebhook(paymentEvent('payment_intent.succeeded'));

    expect(await stockOf(product)).toBe(8);
  });

  test('should not decrement stock again when the client already confirmed the order', async () => {
    const product = await createProduct(10);
    const order = await createPendingOrder(product, 2);

    await confirm(order);
    await sendWebhook(paymentEvent('payment_intent.succeeded'));

    expect(await stockOf(product)).toBe(8);
  });

  test('should cancel the order on payment_intent.payment_failed', async () => {
    const product = await createProduct(10);
    const order = await createPendingOrder(product, 2);

    const response = await sendWebhook(paymentEvent('payment_intent.payment_failed'));

    expect(response.statusCode).toBe(200);
    expect((await Order.findById(order._id)).status).toBe('cancelled');
    expect(await stockOf(product)).toBe(10);
  });

  test('should acknowledge unrelated events without changing anything', async () => {
    const product = await createProduct(10);
    const order = await createPendingOrder(product, 2);

    const response = await sendWebhook(paymentEvent('charge.refunded'));

    expect(response.statusCode).toBe(200);
    expect((await Order.findById(order._id)).status).toBe('pending');
    expect(await stockOf(product)).toBe(10);
  });
});

// ---------------------------------------------------------------------------
describe('POST /api/orders - pending order reuse', () => {
  const shippingBody = (street = '123 Main St') => ({
    firstName: 'Ryan',
    lastName: 'Ray',
    shippingAddress: { street, city: 'New York', state: 'NY', zip: '10001', country: 'US' },
  });

  const placeOrder = (body = shippingBody()) =>
    request(app).post('/api/orders').set('Authorization', `Bearer ${userToken}`).send(body);

  const addToCart = (product, quantity) =>
    request(app)
      .post('/api/cart/addToCart')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ userId, productId: product._id, quantity });

  // What Stripe reports for the PaymentIntent created by the first order
  const stripeStillPayable = (amount) =>
    retrievePaymentIntent.mockResolvedValue({
      id: 'pi_test_123',
      amount,
      status: 'requires_payment_method',
    });

  test('should reuse the pending order when the shipping form is submitted again', async () => {
    const product = await createProduct(10);
    await addToCart(product, 1);

    const first = await placeOrder();
    stripeStillPayable(32999); // 299.99 + 10% tax, free shipping
    const second = await placeOrder(shippingBody('456 Second Ave'));

    expect(first.statusCode).toBe(201);
    expect(second.statusCode).toBe(200);
    expect(second.body.orderId).toBe(first.body.orderId);
    expect(second.body.clientSecret).toBe(first.body.clientSecret);
    expect(await Order.countDocuments()).toBe(1);
    expect(createPaymentIntent).toHaveBeenCalledTimes(1);
    expect(updatePaymentIntent).not.toHaveBeenCalled();
    expect((await Order.findById(first.body.orderId)).shippingAddress.street).toBe(
      '456 Second Ave',
    );
  });

  test('should update the order and the PaymentIntent amount when the cart changed', async () => {
    const product = await createProduct(10);
    await addToCart(product, 1);

    const first = await placeOrder();
    await addToCart(product, 1); // now 2 in the cart
    stripeStillPayable(32999);
    const second = await placeOrder();

    expect(second.body.orderId).toBe(first.body.orderId);
    expect(updatePaymentIntent).toHaveBeenCalledWith('pi_test_123', { amount: 65998 });
    const order = await Order.findById(first.body.orderId);
    expect(order.products[0].quantity).toBe(2);
    expect(order.totalAmount.total).toBe(659.98);
  });

  test('should create a new order when the previous PaymentIntent can no longer be paid', async () => {
    const product = await createProduct(10);
    await addToCart(product, 1);

    const first = await placeOrder();
    retrievePaymentIntent.mockResolvedValue({
      id: 'pi_test_123',
      amount: 32999,
      status: 'canceled',
    });
    createPaymentIntent.mockResolvedValue({
      id: 'pi_test_456',
      client_secret: 'secret_456',
      status: 'requires_payment_method',
    });
    const second = await placeOrder();

    expect(second.statusCode).toBe(201);
    expect(second.body.orderId).not.toBe(first.body.orderId);
    expect(await Order.countDocuments()).toBe(2);
  });

  test('should not reuse an order that is already paid', async () => {
    const product = await createProduct(10);
    await addToCart(product, 1);

    const first = await placeOrder();
    await Order.findByIdAndUpdate(first.body.orderId, { status: 'paid' });
    const second = await placeOrder();

    expect(second.statusCode).toBe(201);
    expect(second.body.orderId).not.toBe(first.body.orderId);
    expect(retrievePaymentIntent).not.toHaveBeenCalled();
  });
});
