import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import Cart from '../models/cartModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';

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
  await Cart.deleteMany({});
});

-describe('GET /api/cart/getCart/:userId', () => {
  test('should return 200 with empty cart when no cart exists for user', async () => {
    const response = await request(app)
      .get(`/api/cart/getCart/${userId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.cart.products).toEqual([]);
  });

  test('should return 200 with cart items after adding a product', async () => {
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
      .get(`/api/cart/getCart/${userId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.cart.products).toHaveLength(1);
  });

  test('should return 401 when no token is provided', async () => {
    const response = await request(app).get(`/api/cart/getCart/${userId}`);

    expect(response.statusCode).toBe(401);
  });

  test('should return 403 when userId does not match token', async () => {
    const otherUser = await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'johndoe@outlook.com',
      password: 'Password1!',
    });

    const response = await request(app)
      .get(`/api/cart/getCart/${otherUser.body.user.id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(403);
  });
});

// ---------------------------------------------------------------------------
describe('POST /api/cart/addToCart', () => {
  test('should return 201 when adding a product to a new cart', async () => {
    const product = await Product.create({
      name: 'Luxury Watch',
      price: 299.99,
      description: 'A premium timepiece for the discerning buyer',
      stock: 10,
      imageUrl: 'https://example.com/watch.jpg',
    });

    const response = await request(app)
      .post('/api/cart/addToCart')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ userId, productId: product._id, quantity: 1 });

    //New cart created
    expect(response.statusCode).toBe(201);
    expect(response.body.newCart.products).toHaveLength(1);
  });

  test('should return 200 when adding a product that is already in the cart', async () => {
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
      .post('/api/cart/addToCart')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ userId, productId: product._id, quantity: 1 });

    expect(response.statusCode).toBe(200);
  });

  test('should return 401 when no token is provided', async () => {
    const product = await Product.create({
      name: 'Luxury Watch',
      price: 299.99,
      description: 'A premium timepiece for the discerning buyer',
      stock: 10,
      imageUrl: 'https://example.com/watch.jpg',
    });

    const response = await request(app)
      .post('/api/cart/addToCart')
      .send({ userId, productId: product._id, quantity: 1 });

    expect(response.statusCode).toBe(401);
  });

  test('should return 403 when userId does not match token', async () => {
    const otherUser = await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'johndoe@outlook.com',
      password: 'Password1!',
    });

    const product = await Product.create({
      name: 'Luxury Watch',
      price: 299.99,
      description: 'A premium timepiece for the discerning buyer',
      stock: 10,
      imageUrl: 'https://example.com/watch.jpg',
    });

    const response = await request(app)
      .post('/api/cart/addToCart')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        userId: otherUser.body.user.id,
        productId: product._id,
        quantity: 1,
      });

    expect(response.statusCode).toBe(403);
  });

  test('should return 404 when product does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .post('/api/cart/addToCart')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ userId, productId: fakeId, quantity: 1 });

    expect(response.statusCode).toBe(404);
  });
});

describe('PATCH /api/cart/updateCart/:userId', () => {
  test('should return 200 with updated quantity', async () => {
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
      .patch(`/api/cart/updateCart/${userId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId: product._id, quantity: 3 });

    expect(response.statusCode).toBe(200);
  });

  test('should return 401 when no token is provided', async () => {
    const response = await request(app)
      .patch(`/api/cart/updateCart/${userId}`)
      .send({ productId: new mongoose.Types.ObjectId(), quantity: 3 });

    expect(response.statusCode).toBe(401);
  });

  test('should return 403 when userId does not match token', async () => {
    const otherUser = await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'johndoe@outlook.com',
      password: 'Password1!',
    });

    const response = await request(app)
      .patch(`/api/cart/updateCart/${otherUser.body.user.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId: new mongoose.Types.ObjectId(), quantity: 3 });

    expect(response.statusCode).toBe(403);
  });

  test('should return 404 when product is not in cart', async () => {
    const product = await Product.create({
      name: 'Luxury Watch',
      price: 299.99,
      description: 'A premium timepiece for the discerning buyer',
      stock: 10,
      imageUrl: 'https://example.com/watch.jpg',
    });

    await Cart.create({ userId, products: [] });

    const response = await request(app)
      .patch(`/api/cart/updateCart/${userId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ productId: product._id, quantity: 3 });

    expect(response.statusCode).toBe(404);
  });
});

describe('DELETE /api/cart/deleteProduct/:userId/:productId', () => {
  test('should return 200 when removing a product from the cart', async () => {
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
      .delete(`/api/cart/deleteProduct/${userId}/${product._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.cart.products).toHaveLength(0);
  });

  test('should return 401 when no token is provided', async () => {
    const response = await request(app).delete(
      `/api/cart/deleteProduct/${userId}/${new mongoose.Types.ObjectId()}`,
    );

    expect(response.statusCode).toBe(401);
  });

  test('should return 403 when userId does not match token', async () => {
    const otherUser = await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'johndoe@outlook.com',
      password: 'Password1!',
    });

    const response = await request(app)
      .delete(
        `/api/cart/deleteProduct/${otherUser.body.user.id}/${new mongoose.Types.ObjectId()}`,
      )
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(403);
  });
});

describe('GET /api/cart/total/:userId', () => {
  test('should return 200 with correct cart total', async () => {
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
      .send({ userId, productId: product._id, quantity: 2 });

    const response = await request(app)
      .get(`/api/cart/total/${userId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.cartTotal).toBe(599.98);
  });

  test('should return 401 when no token is provided', async () => {
    const response = await request(app).get(`/api/cart/total/${userId}`);

    expect(response.statusCode).toBe(401);
  });

  test('should return 404 when no cart exists for user', async () => {
    const response = await request(app)
      .get(`/api/cart/total/${userId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(404);
  });
});

describe('DELETE /api/cart/clearCart/:userId', () => {
  test('should return 200 with success message when cart is cleared', async () => {
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
      .delete(`/api/cart/clearCart/${userId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Cart cleared successfully');
    expect(response.body.cart.products).toHaveLength(0);
  });

  test('should return 401 when no token is provided', async () => {
    const response = await request(app).delete(`/api/cart/clearCart/${userId}`);

    expect(response.statusCode).toBe(401);
  });

  test('should return 403 when userId does not match token', async () => {
    const otherUser = await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'johndoe@outlook.com',
      password: 'Password1!',
    });

    const response = await request(app)
      .delete(`/api/cart/clearCart/${otherUser.body.user.id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.statusCode).toBe(403);
  });
});
