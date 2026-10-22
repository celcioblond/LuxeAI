import jwt from 'jsonwebtoken';
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

  test('email does not exist should return generic 401', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'doesnotexist@gmail.com',
      password: 'Password1!',
    });
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });

  test('wrong password should return generic 401', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'ryanray@outlook.com',
      password: 'invalidPASS',
    });
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('Invalid credentials');
  });

  test('invalid email format should return status 400', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'ryanraw',
      password: 'Password1!',
    });
    expect(response.statusCode).toBe(400);
  });
});

describe('Session tied to the current run of the stack', () => {
  const register = () =>
    request(app).post('/api/auth/register').send({
      name: 'Ryan Ray',
      email: 'ryanray@outlook.com',
      password: 'Password1!',
    });

  test('GET /api/auth/me should return the user for a fresh token', async () => {
    const { body } = await register();

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${body.token}`);

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe('ryanray@outlook.com');
    expect(response.body.user.password).toBeUndefined();
  });

  test('should reject a token issued by a previous run of the stack', async () => {
    const { body } = await register();
    const { userId, email, role } = jwt.decode(body.token);
    const oldRunToken = jwt.sign(
      { userId, email, role, boot: 'previous-run' },
      process.env.JWT_SECRET,
    );

    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${oldRunToken}`);
    const cart = await request(app)
      .get(`/api/cart/getCart/${userId}`)
      .set('Authorization', `Bearer ${oldRunToken}`);

    expect(me.status).toBe(401);
    expect(cart.status).toBe(401);
  });

  test('should reject a token that carries no run id', async () => {
    const { body } = await register();
    const { userId, email, role } = jwt.decode(body.token);
    const legacyToken = jwt.sign({ userId, email, role }, process.env.JWT_SECRET);

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${legacyToken}`);

    expect(response.status).toBe(401);
  });

  test('GET /api/auth/me should return 401 when the user was deleted', async () => {
    const { body } = await register();
    await User.deleteMany({});

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${body.token}`);

    expect(response.status).toBe(401);
  });

  test('GET /api/auth/me should return 401 without a token', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
  });
});
