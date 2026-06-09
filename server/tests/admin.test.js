import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';

let adminToken;
let userToken;
let regularUserId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(async () => {
  //First user registered is admin
  const adminResponse = await request(app).post('/api/auth/register').send({
    name: 'Admin User',
    email: 'admin@outlook.com',
    password: 'Password1!',
  });
  adminToken = adminResponse.body.token;

  //Second user registered is regular user
  const userResponse = await request(app).post('/api/auth/register').send({
    name: 'Ryan Ray',
    email: 'ryanray@outlook.com',
    password: 'Password1!',
  });
  userToken = userResponse.body.token;
  regularUserId = userResponse.body.user.id;
});

afterEach(async () => {
  await User.deleteMany({});
  await Product.deleteMany({});
  await Order.deleteMany({});
});

// ---------------------------------------------------------------------------
describe('GET /api/admin/stats', () => {
  test('should return 200 with userCount, productCount and orderCount when admin', async () => {
    const response = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.userCount).toBeDefined();
    expect(response.body.productCount).toBeDefined();
    expect(response.body.orderCount).toBeDefined();
  });

  test('should return 401 when no token is provided', async () => {
    const response = await request(app).get('/api/admin/stats');

    expect(response.statusCode).toBe(401);
  });

  test('should return 403 when user is not admin', async () => {
    const response = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(403);
  });
});

// ---------------------------------------------------------------------------
describe('GET /api/admin/users', () => {
  test('should return 200 with users array when admin', async () => {
    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.users).toBeDefined();
    expect(Array.isArray(response.body.users)).toBe(true);
  });

  test('should not return password in any user', async () => {
    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    response.body.users.forEach((user) => {
      expect(user.password).toBeUndefined();
    });
  });

  test('should return 401 when no token is provided', async () => {
    const response = await request(app).get('/api/admin/users');

    expect(response.statusCode).toBe(401);
  });

  test('should return 403 when user is not admin', async () => {
    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(403);
  });
});

// ---------------------------------------------------------------------------
describe('PATCH /api/admin/users/:id', () => {
  test('should return 200 with updated user when admin sends valid data', async () => {
    const response = await request(app)
      .patch(`/api/admin/users/${regularUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Name' });

    expect(response.statusCode).toBe(200);
    expect(response.body.user.name).toBe('Updated Name');
    expect(response.body.user.password).toBeUndefined();
  });

  test('should return 404 when user does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .patch(`/api/admin/users/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Name' });

    expect(response.statusCode).toBe(404);
  });

  test('should return 401 when no token is provided', async () => {
    const response = await request(app)
      .patch(`/api/admin/users/${regularUserId}`)
      .send({ name: 'Updated Name' });

    expect(response.statusCode).toBe(401);
  });

  test('should return 403 when user is not admin', async () => {
    const response = await request(app)
      .patch(`/api/admin/users/${regularUserId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Updated Name' });

    expect(response.statusCode).toBe(403);
  });
});

// ---------------------------------------------------------------------------
describe('DELETE /api/admin/users/:id', () => {
  test('should return 200 with success message when admin deletes a user', async () => {
    const response = await request(app)
      .delete(`/api/admin/users/${regularUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('User deleted successfully');
  });

  test('should return 404 when user does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(`/api/admin/users/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(404);
  });

  test('should return 401 when no token is provided', async () => {
    const response = await request(app).delete(`/api/admin/users/${regularUserId}`);

    expect(response.statusCode).toBe(401);
  });

  test('should return 403 when user is not admin', async () => {
    const response = await request(app)
      .delete(`/api/admin/users/${regularUserId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(403);
  });
});

// ---------------------------------------------------------------------------
describe('GET /api/admin/orders', () => {
  test('should return 200 with orders array when admin', async () => {
    const response = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.orders)).toBe(true);
  });

  test('should return 401 when no token is provided', async () => {
    const response = await request(app).get('/api/admin/orders');

    expect(response.statusCode).toBe(401);
  });

  test('should return 403 when user is not admin', async () => {
    const response = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(403);
  });
});

// ---------------------------------------------------------------------------
describe('PATCH /api/admin/orders/:id/status', () => {
  test('should return 200 with updated order when admin changes status', async () => {
    const order = await Order.create({
      customer: {
        userId: new mongoose.Types.ObjectId(),
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
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'US',
      },
      totalAmount: { subtotal: 299.99, tax: 30, shipping: 0, total: 329.99 },
      status: 'pending',
      stripeInfo: { paymentIntentId: 'pi_test', clientSecret: 'secret', paymentStatus: 'requires_payment_method' },
    });

    const response = await request(app)
      .patch(`/api/admin/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'processing' });

    expect(response.statusCode).toBe(200);
    expect(response.body.order.status).toBe('processing');
  });

  test('should return 404 when order does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .patch(`/api/admin/orders/${fakeId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'processing' });

    expect(response.statusCode).toBe(404);
  });

  test('should return 401 when no token is provided', async () => {
    const response = await request(app)
      .patch(`/api/admin/orders/${new mongoose.Types.ObjectId()}/status`)
      .send({ status: 'processing' });

    expect(response.statusCode).toBe(401);
  });

  test('should return 403 when user is not admin', async () => {
    const response = await request(app)
      .patch(`/api/admin/orders/${new mongoose.Types.ObjectId()}/status`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'processing' });

    expect(response.statusCode).toBe(403);
  });
});
