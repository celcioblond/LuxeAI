import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';
import cache from '../utils/cache.js';

let adminToken;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

afterEach(async () => {
  await Product.deleteMany({});
  await User.deleteMany({});
  cache.flushAll();
});

describe('GET /api/products', () => {
  test('should return 200 with empty array when db has no products', async () => {
    const response = await request(app).get('/api/products');

    expect(response.statusCode).toBe(200);
    expect(response.body.products).toEqual([]);
  });

  test('should return 200 with all products when db has items', async () => {
    await Product.create({
      name: 'Luxury Watch',
      price: 299.99,
      description: 'A premium timepiece for the discerning buyer',
      stock: 10,
      imageUrl: 'https://example.com/watch.jpg',
    });

    const response = await request(app).get('/api/products');

    expect(response.statusCode).toBe(200);
    expect(response.body.products).toHaveLength(1);
    expect(response.body.products[0].name).toBe('Luxury Watch');
  });
});

describe('GET /api/products/:id', () => {
  test('should return 200 with product when id exists', async () => {
    const product = await Product.create({
      name: 'Luxury Watch',
      price: 299.99,
      description: 'A premium timepiece for the discerning buyer',
      stock: 10,
      imageUrl: 'https://example.com/watch.jpg',
    });

    const response = await request(app).get(`/api/products/${product._id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.product.name).toBe('Luxury Watch');
    expect(response.body.product.price).toBe(299.99);
  });

  test('should return 404 when product does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app).get(`/api/products/${fakeId}`);

    expect(response.statusCode).toBe(404);
  });

  test('should return 400 for invalid id format', async () => {
    const response = await request(app).get('/api/products/invalid-id');

    expect(response.statusCode).toBe(400);
  });
});

describe('POST /api/products', () => {
  beforeEach(async () => {
    const registerResponse = await request(app).post('/api/auth/register').send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Password1!',
    });
    adminToken = registerResponse.body.token;
  });

  test('should return 201 with created product when admin sends valid data', async () => {
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Luxury Watch',
        price: 299.99,
        description: 'A premium timepiece for the discerning buyer',
        stock: 10,
        imageUrl: 'https://example.com/watch.jpg',
      });

    //Created product
    expect(response.statusCode).toBe(201);
    expect(response.body.product.name).toBe('Luxury Watch');
    expect(response.body.product.price).toBe(299.99);
  });

  test('should return 401 when no token is provided', async () => {
    const response = await request(app).post('/api/products').send({
      name: 'Luxury Watch',
      price: 299.99,
      description: 'A premium timepiece for the discerning buyer',
      stock: 10,
      imageUrl: 'https://example.com/watch.jpg',
    });

    expect(response.statusCode).toBe(401);
  });

  test('should return 400 when required fields are missing', async () => {
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Only name' });

    expect(response.statusCode).toBe(400);
  });
});

describe('PATCH /api/products/:id', () => {
  beforeEach(async () => {
    const registerResponse = await request(app).post('/api/auth/register').send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Password1!',
    });
    adminToken = registerResponse.body.token;
  });

  test('should return 200 with updated product when admin sends valid data', async () => {
    const product = await Product.create({
      name: 'Luxury Watch',
      price: 299.99,
      description: 'A premium timepiece for the discerning buyer',
      stock: 10,
      imageUrl: 'https://example.com/watch.jpg',
    });

    const response = await request(app)
      .patch(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 399.99 });

    expect(response.statusCode).toBe(200);
    expect(response.body.product.price).toBe(399.99);
  });

  test('should return 404 when product does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .patch(`/api/products/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 399.99 });

    expect(response.statusCode).toBe(404);
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
      .patch(`/api/products/${product._id}`)
      .send({ price: 399.99 });

    expect(response.statusCode).toBe(401);
  });
});

describe('DELETE /api/products/:id', () => {
  beforeEach(async () => {
    const registerResponse = await request(app).post('/api/auth/register').send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Password1!',
    });
    adminToken = registerResponse.body.token;
  });

  test('should return 200 with success message when admin deletes existing product', async () => {
    const product = await Product.create({
      name: 'Luxury Watch',
      price: 299.99,
      description: 'A premium timepiece for the discerning buyer',
      stock: 10,
      imageUrl: 'https://example.com/watch.jpg',
    });

    const response = await request(app)
      .delete(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    //Deleted product
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Product deleted successfully');
  });

  test('should return 404 when product does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(`/api/products/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(404);
  });

  test('should return 401 when no token is provided', async () => {
    const product = await Product.create({
      name: 'Luxury Watch',
      price: 299.99,
      description: 'A premium timepiece for the discerning buyer',
      stock: 10,
      imageUrl: 'https://example.com/watch.jpg',
    });

    const response = await request(app).delete(`/api/products/${product._id}`);

    expect(response.statusCode).toBe(401);
  });
});

describe('Cache behavior', () => {
  beforeEach(async () => {
    const registerResponse = await request(app).post('/api/auth/register').send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Password1!',
    });
    adminToken = registerResponse.body.token;
  });

  test('should return same products on consecutive GET /api/products requests', async () => {
    await Product.create({
      name: 'Luxury Watch',
      price: 299.99,
      description: 'A premium timepiece for the discerning buyer',
      stock: 10,
      imageUrl: 'https://example.com/watch.jpg',
    });

    const first = await request(app).get('/api/products');
    const second = await request(app).get('/api/products');

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    expect(second.body.products).toEqual(first.body.products);
  });

  test('should return same product on consecutive GET /api/products/:id requests', async () => {
    const product = await Product.create({
      name: 'Luxury Watch',
      price: 299.99,
      description: 'A premium timepiece for the discerning buyer',
      stock: 10,
      imageUrl: 'https://example.com/watch.jpg',
    });

    const first = await request(app).get(`/api/products/${product._id}`);
    const second = await request(app).get(`/api/products/${product._id}`);

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    expect(second.body.product).toEqual(first.body.product);
  });

  test('should return updated data after PATCH invalidates cache', async () => {
    const product = await Product.create({
      name: 'Luxury Watch',
      price: 299.99,
      description: 'A premium timepiece for the discerning buyer',
      stock: 10,
      imageUrl: 'https://example.com/watch.jpg',
    });

    await request(app).get(`/api/products/${product._id}`);

    await request(app)
      .patch(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 499.99 });

    const response = await request(app).get(`/api/products/${product._id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.product.price).toBe(499.99);
  });

  test('should not include deleted product after DELETE invalidates cache', async () => {
    const product = await Product.create({
      name: 'Luxury Watch',
      price: 299.99,
      description: 'A premium timepiece for the discerning buyer',
      stock: 10,
      imageUrl: 'https://example.com/watch.jpg',
    });

    await request(app).get('/api/products');

    await request(app)
      .delete(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    const response = await request(app).get('/api/products');

    expect(response.statusCode).toBe(200);
    expect(response.body.products).toHaveLength(0);
  });

  test('should include new product after POST invalidates cache', async () => {
    await request(app).get('/api/products');

    await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Diamond Ring',
        price: 1999.99,
        description: 'A stunning diamond ring for special occasions',
        stock: 5,
        imageUrl: 'https://example.com/ring.jpg',
      });

    const response = await request(app).get('/api/products');

    expect(response.statusCode).toBe(200);
    expect(response.body.products).toHaveLength(1);
    expect(response.body.products[0].name).toBe('Diamond Ring');
  });
});
