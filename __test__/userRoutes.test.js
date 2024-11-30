const request = require('supertest');
const express = require('express');
const session = require('express-session');
const userRoutes = require('../routes/userRoutes');
const User = require('../models/user');

jest.mock('../models/user'); // Mocking the User model

const app = express();
app.use(express.json());
app.use(session({ secret: 'test', resave: false, saveUninitialized: true }));
app.use('/users', userRoutes);

// Global timeout for all tests
jest.setTimeout(30000);


describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /users/login', () => {
    test('should log in a user with valid credentials', async () => {
      User.findOne.mockResolvedValue({
        _id: '12345',
        email: 'johndoe@example.com',
        comparePassword: jest.fn().mockResolvedValue(true), // Simulate successful password match
      });

      const res = await request(app)
        .post('/users/login')
        .send({ email: 'johndoe@example.com', password: 'password123' });

      expect(res.status).toBe(302); // Redirect after successful login
      expect(res.header.location).toBe('/users/profile'); // Redirect to profile
    });

    test('should return error for invalid credentials', async () => {
      User.findOne.mockResolvedValue({
        _id: '12345',
        email: 'johndoe@example.com',
        comparePassword: jest.fn().mockResolvedValue(false), // Simulate incorrect password
      });

      const res = await request(app)
        .post('/users/login')
        .send({ email: 'johndoe@example.com', password: 'wrongpassword' });

      expect(res.status).toBe(302);
      expect(res.header.location).toBe('/users/login'); // Redirect back to login
      expect(res.text).toContain('Invalid login credentials');
    });
  });

  describe('POST /users/signup', () => {
    test('should sign up a user with valid data', async () => {
      User.findOne.mockResolvedValue(null); // No user exists with this email
      User.prototype.save.mockResolvedValue({
        _id: '12345',
        email: 'johndoe@example.com',
      });

      const res = await request(app)
        .post('/users/signup')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'johndoe@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(302); // Should redirect after successful signup
      expect(res.header.location).toBe('/users/profile');
    });

    test('should return error for already existing email', async () => {
      User.findOne.mockResolvedValue({
        email: 'johndoe@example.com',
      });

      const res = await request(app)
        .post('/users/signup')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'johndoe@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(200); // Should render signup page again
      expect(res.text).toContain('A user with this email already exists.');
    });
  });
});
