import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import User from '../models/userModel.js';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('POST /api/auth/register', () => {
  test('should return 201 with token and user data', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Ryan Ray',
      email: 'ryanray@outlook.com',
      password: 'Password1!',
    });

    expect(response.status).toBe(201);
    expect(response.body.token).toBeDefined();
    expect(response.body.user).toEqual(
      expect.objectContaining({
        name: 'Ryan Ray',
        email: 'ryanray@outlook.com',
        role: 'admin',
      }),
    );
    expect(response.body.user.password).toBeUndefined();
  });

  test('assign role of "user" to every subsequent user added to the db', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Ryan Ray',
      email: 'ryanray@outlook.com',
      password: 'Password1!',
    });

    const response = await request(app).post('/api/auth/register').send({
      name: 'John Doe',
      email: 'johndoe@outlook.com',
      password: 'Password1!',
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.user.role).toBe('user');
  });

  test('should not return password on body', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Ryan Ray',
      email: 'ryanray@outlook.com',
      password: 'Password1!',
    });

    expect(response.body.user.password).toBeUndefined();
  });

  test('duplicate email should return status 400', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Ryan Ray',
      email: 'ryanray@outlook.com',
      password: 'Password1!',
    });

    const response = await request(app).post('/api/auth/register').send({
      name: 'Ryan Ray',
      email: 'ryanray@outlook.com',
      password: 'Password1!',
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Email is already in use');
  });

  test('invalid password returns status 400', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Ryan Ray',
      email: 'ryanray@outlook.com',
      password: 'weak',
    });
    expect(response.statusCode).toBe(400);
  });

  test('missing name should return status 400', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: '',
      email: 'ryanray@outlook.com',
      password: 'Password1!',
    });
    expect(response.statusCode).toBe(400);
  });

  test('invalid email format should return status 400', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Ryan Ray',
      email: 'ryanray',
      password: 'Password1!',
    });
    expect(response.statusCode).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Ryan Ray',
      email: 'ryanray@outlook.com',
      password: 'Password1!',
    });
  });

  test('return 200 with token and user when sending valid credentials', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'ryanray@outlook.com',
      password: 'Password1!',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user).toEqual(
      expect.objectContaining({
        email: 'ryanray@outlook.com',
        role: 'admin',
      }),
    );
    expect(response.body.user.password).toBeUndefined();
  });

  test('email does not exist should return status 400', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'doesnotexist@gmail.com',
      password: 'Password1!',
    });
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('User was not found');
  });

  test('wrong password should return status 401', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'ryanray@outlook.com',
      password: 'invalidPASS',
    });
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Password is invalid');
  });

  test('invalid email format should return status 400', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'ryanraw',
      password: 'Password1!',
    });
    expect(response.statusCode).toBe(400);
  });
});
