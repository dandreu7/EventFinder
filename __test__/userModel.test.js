const bcrypt = require('bcrypt');
const User = require('../models/user'); // Your user model
const mongoose = require('mongoose');

describe('User Model', () => {
  let user;

  beforeAll(async () => {
    // Setup a test user
    user = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      password: 'password123',
    });
    await user.save();
  });

  afterAll(async () => {
    // Clean up the database after tests
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  test('should hash password before saving', async () => {
    const foundUser = await User.findOne({ email: 'johndoe@example.com' });
    expect(foundUser.password).not.toBe('password123');
    const match = await bcrypt.compare('password123', foundUser.password);
    expect(match).toBe(true);
  });

  test('should compare passwords correctly', async () => {
    const isMatch = await user.comparePassword('password123');
    expect(isMatch).toBe(true);
  });

  test('should not match incorrect password', async () => {
    const isMatch = await user.comparePassword('wrongpassword');
    expect(isMatch).toBe(false);
  });
});
