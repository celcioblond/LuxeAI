import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('POST /api/auth/register', () => {
  test('should return 200 with token and user', async () => {
    const response = await request(app).post('/api/auth/register').send({
      name: 'Ryan Ray',
      email: 'ryanray@outlook.com',
      password: 'Password1!',
    });
    //Succesfull register: status 200
    expect(response.status).toBe(200);

    //Body contain token and user with name, email and role
    expect(response.body.token).toBeDefined();
    expect(response.body.user).toBeDefined();
    expect(response.body.email).toBeDefined();

    //First user registered receives "admin" role
    expect(response.body.user.role).toBe('admin');
    //Password not returned on body
    expect(response.body.user.password).toBeUndefined();
    //If duplicated email return status 400

    //Invalid password return status 500

    //Name missing => status 500

    //Email with invalid format => status 500
  });
});

describe('POST /api/auth/login', () => {
  test('');
});
