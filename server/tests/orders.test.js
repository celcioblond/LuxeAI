import { jest } from '@jest/globals';

// Stripe must be mocked before any module that imports it is loaded.
// ESM requires unstable_mockModule + dynamic imports for this to work.
jest.unstable_mockModule('stripe', () => ({
  default: jest.fn(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'secret_test_123',
        status: 'requires_payment_method',
      }),
    },
  })),
}));

const { default: mongoose } = await import('mongoose');
const { default: request } = await import('supertest');
const { default: app } = await import('../app.js');
const { default: User } = await import('../models/userModel.js');
const { default: Product } = await import('../models/productModel.js');
const { default: Order } = await import('../models/orderModel.js');
const { default: Cart } = await import('../models/cartModel.js');

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
});

afterEach(async () => {
  await User.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});
  await Cart.deleteMany({});
});

// ---------------------------------------------------------------------------
describe('POST /api/orders', () => {
  test('should return 201 with orderId and clientSecret when cart has products', async () => {
    const product = await Product.create({
      name: 'Luxury Watch',
      price: 299.99,
      description: 'A premium timepiece for the discerning buyer',
      stock: 10,
      imageUrl: 'https://example.com/watch.jpg',
    });

    await request(app)
      .post('/api/cart/addToCart')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ userId, productId: product._id, quantity: 1 });

    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        firstName: 'Ryan',
        lastName: 'Ray',
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'US',
        },
      });

    //Created order
    expect(response.statusCode).toBe(201);
    expect(response.body.orderId).toBeDefined();
    expect(response.body.clientSecret).toBeDefined();
  });

  test('should return 400 when cart is empty', async () => {
    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        firstName: 'Ryan',
        lastName: 'Ray',
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'US',
        },
      });

    expect(response.statusCode).toBe(400);
  });

  test('should return 401 when no token is provided', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({
        firstName: 'Ryan',
        lastName: 'Ray',
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'US',
        },
      });

    expect(response.statusCode).toBe(401);
  });
});

// ---------------------------------------------------------------------------
describe('GET /api/orders/me', () => {
  test('should return 200 with empty orders array when user has no orders', async () => {
    const response = await request(app)
      .get('/api/orders/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.orders).toEqual([]);
  });

  test('should return 200 with orders when user has placed orders', async () => {
    await Order.create({
      customer: {
        userId,
        firstName: 'Ryan',
        lastName: 'Ray',
        email: 'ryanray@outlook.com',
      },
      products: [
        {
          productId: new mongoose.Types.ObjectId(),
          name: 'Luxury Watch',
          price: 299.99,
          quantity: 1,
          imageUrl: 'https://example.com/watch.jpg',
          subtotal: 299.99,
        },
      ],
      shippingAddress: { street: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'US' },
      totalAmount: { subtotal: 299.99, tax: 30, shipping: 0, total: 329.99 },
      status: 'pending',
      stripeInfo: { paymentIntentId: 'pi_test', clientSecret: 'secret', paymentStatus: 'requires_payment_method' },
    });

    const response = await request(app)
      .get('/api/orders/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.orders).toHaveLength(1);
  });

  test('should return 401 when no token is provided', async () => {
    const response = await request(app).get('/api/orders/me');

    expect(response.statusCode).toBe(401);
  });
});

// ---------------------------------------------------------------------------
describe('GET /api/orders/:id', () => {
  test('should return 200 with order when id exists and belongs to user', async () => {
    const order = await Order.create({
      customer: {
        userId,
        firstName: 'Ryan',
        lastName: 'Ray',
        email: 'ryanray@outlook.com',
      },
      products: [
        {
          productId: new mongoose.Types.ObjectId(),
          name: 'Luxury Watch',
          price: 299.99,
          quantity: 1,
          imageUrl: 'https://example.com/watch.jpg',
          subtotal: 299.99,
        },
      ],
      shippingAddress: { street: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'US' },
      totalAmount: { subtotal: 299.99, tax: 30, shipping: 0, total: 329.99 },
      status: 'pending',
      stripeInfo: { paymentIntentId: 'pi_test', clientSecret: 'secret', paymentStatus: 'requires_payment_method' },
    });

    const response = await request(app)
      .get(`/api/orders/${order._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.order._id).toBe(order._id.toString());
  });

  test('should return 403 when order belongs to a different user', async () => {
    const otherUser = await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'johndoe@outlook.com',
      password: 'Password1!',
    });

    const order = await Order.create({
      customer: {
        userId: otherUser.body.user.id,
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@outlook.com',
      },
      products: [
        {
          productId: new mongoose.Types.ObjectId(),
          name: 'Luxury Watch',
          price: 299.99,
          quantity: 1,
          imageUrl: 'https://example.com/watch.jpg',
          subtotal: 299.99,
        },
      ],
      shippingAddress: { street: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'US' },
      totalAmount: { subtotal: 299.99, tax: 30, shipping: 0, total: 329.99 },
      status: 'pending',
      stripeInfo: { paymentIntentId: 'pi_test', clientSecret: 'secret', paymentStatus: 'requires_payment_method' },
    });

    const response = await request(app)
      .get(`/api/orders/${order._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(403);
  });

  test('should return 404 when order does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .get(`/api/orders/${fakeId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(404);
  });

  test('should return 401 when no token is provided', async () => {
    const response = await request(app).get(`/api/orders/${new mongoose.Types.ObjectId()}`);

    expect(response.statusCode).toBe(401);
  });
});
