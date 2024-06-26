const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');

describe('Auth API', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('should sign up a user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        password: 'password'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message');
  });

  it('should sign in a user', async () => {
    await new User({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      password: 'password'
    }).save();

    const res = await request(app)
      .post('/api/auth/signin')
      .send({
        email: 'john.doe@example.com',
        password: 'password'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});
