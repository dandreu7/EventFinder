const mongoose = require('mongoose');
const Event = require('../models/event');

describe('Event Model', () => {
  beforeAll(() => {
    // Mock the connection to MongoDB for testing
    mongoose.connect = jest.fn();
  });

  it('should create a new event', async () => {
    const newEvent = new Event({
      title: 'New Event',
      description: 'Event description',
      location: 'Location',
      date: new Date('2024-12-25'),
      imagePath: '/images/logo.png',
      userEmail: 'user@example.com',
    });

    const savedEvent = await newEvent.save();

    expect(savedEvent).toHaveProperty('_id');
    expect(savedEvent.title).toBe('New Event');
    expect(savedEvent.description).toBe('Event description');
  });

  it('should calculate isActive correctly', async () => {
    const futureEvent = new Event({
      title: 'Future Event',
      description: 'Event description',
      location: 'Location',
      date: new Date('2025-12-25'),
      imagePath: '/images/logo.png',
      userEmail: 'user@example.com',
    });

    const pastEvent = new Event({
      title: 'Past Event',
      description: 'Event description',
      location: 'Location',
      date: new Date('2023-12-25'),
      imagePath: '/images/logo.png',
      userEmail: 'user@example.com',
    });

    expect(futureEvent.isActive).toBe(true); // Future events should be active
    expect(pastEvent.isActive).toBe(false);  // Past events should not be active
  });
});
