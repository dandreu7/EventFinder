const request = require('supertest');
const express = require('express');
const session = require('express-session');
const eventRoutes = require('../routes/eventRoutes');
const Event = require('../models/event');
const User = require('../models/user');
const { upload } = require('../middleware/fileUpload');

// Mock the Mongoose models
jest.mock('../models/event');
jest.mock('../models/user');
jest.mock('../middleware/fileUpload', () => ({
  upload: { single: jest.fn() }, // Mock file upload middleware
}));

// Create an instance of Express app
const app = express();
app.use(express.json());
app.use(session({ secret: 'test', resave: false, saveUninitialized: true }));
app.use('/events', eventRoutes);

// Global timeout for all tests
jest.setTimeout(30000);

describe('Event Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /events', () => {
    test('should return a list of all events with RSVP data', async () => {
      const mockUser = { email: 'user@example.com', rsvpedEvents: ['eventId'] };
      const mockEvents = [
        { _id: 'event1', title: 'Event 1', numInterested: 0 },
        { _id: 'event2', title: 'Event 2', numInterested: 1 },
      ];

      User.findOne.mockResolvedValue(mockUser);
      Event.find.mockResolvedValue(mockEvents);
      User.countDocuments.mockResolvedValue(1); // Simulate that 1 user has RSVPed for event2

      const res = await request(app).get('/events');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('events');
      expect(res.body.events.length).toBe(2); // Should return 2 events
      expect(res.body.events[0].numInterested).toBe(0);
      expect(res.body.events[1].numInterested).toBe(1);
    });
  });

  describe('POST /events/:id/rsvp', () => {
    test('should allow a user to RSVP an event', async () => {
      const mockUser = { email: 'user@example.com', rsvpedEvents: [] };
      const mockEvent = { _id: 'eventId', title: 'Test Event', userEmail: 'creator@example.com' };

      User.findOne.mockResolvedValue(mockUser);
      Event.findById.mockResolvedValue(mockEvent);
      User.countDocuments.mockResolvedValue(1);

      const res = await request(app)
        .post('/events/eventId/rsvp')
        .set('Cookie', ['userEmail=user@example.com']);

      expect(res.status).toBe(200);
      expect(res.body.rsvpConfirmed).toBe(true); // RSVP should be confirmed
      expect(res.body.numInterested).toBe(1); // numInterested should be 1
    });

    test('should allow a user to cancel their RSVP', async () => {
      const mockUser = { email: 'user@example.com', rsvpedEvents: ['eventId'] };
      const mockEvent = { _id: 'eventId', title: 'Test Event', userEmail: 'creator@example.com' };

      User.findOne.mockResolvedValue(mockUser);
      Event.findById.mockResolvedValue(mockEvent);
      User.countDocuments.mockResolvedValue(0);

      const res = await request(app)
        .post('/events/eventId/rsvp')
        .set('Cookie', ['userEmail=user@example.com']);

      expect(res.status).toBe(200);
      expect(res.body.rsvpConfirmed).toBe(false); // RSVP should be canceled
      expect(res.body.numInterested).toBe(0); // numInterested should be 0
    });

    test('should return 403 if user tries to RSVP their own event', async () => {
      const mockUser = { email: 'creator@example.com', rsvpedEvents: [] };
      const mockEvent = { _id: 'eventId', title: 'Test Event', userEmail: 'creator@example.com' };

      User.findOne.mockResolvedValue(mockUser);
      Event.findById.mockResolvedValue(mockEvent);

      const res = await request(app)
        .post('/events/eventId/rsvp')
        .set('Cookie', ['userEmail=creator@example.com']);

      expect(res.status).toBe(403);
      expect(res.text).toContain('You cannot RSVP your own event');
    });
  });

  describe('POST /create/event', () => {
    test('should create a new event', async () => {
      const mockEventData = { title: 'New Event', date: '2024-12-25', location: 'Location', description: 'Event Description' };
      const mockUser = { email: 'user@example.com' };

      User.findOne.mockResolvedValue(mockUser);
      Event.prototype.save.mockResolvedValue(mockEventData);

      const res = await request(app)
        .post('/events/create/event')
        .send(mockEventData)
        .set('Cookie', ['userEmail=user@example.com']);

      expect(res.status).toBe(302); // Redirect after event creation
      expect(res.header.location).toBe('/events'); // Redirect to events list
    });

    test('should return 401 if user is not logged in', async () => {
      const res = await request(app).post('/events/create/event').send({
        title: 'New Event',
        date: '2024-12-25',
        location: 'Location',
        description: 'Event Description',
      });

      expect(res.status).toBe(401);
      expect(res.text).toContain('You must be logged in to create an event');
    });
  });

  describe('DELETE /events/:id', () => {
    test('should delete an event if user is the owner', async () => {
      const mockEvent = { _id: 'eventId', userEmail: 'user@example.com' };
      const mockUser = { email: 'user@example.com' };

      Event.findById.mockResolvedValue(mockEvent);
      User.updateMany.mockResolvedValue({});

      const res = await request(app)
        .delete('/events/eventId')
        .set('Cookie', ['userEmail=user@example.com']);

      expect(res.status).toBe(200);
      expect(res.text).toBe('Event deleted successfully');
    });

    test('should return 403 if user is not the owner of the event', async () => {
      const mockEvent = { _id: 'eventId', userEmail: 'owner@example.com' };
      const mockUser = { email: 'user@example.com' };

      Event.findById.mockResolvedValue(mockEvent);

      const res = await request(app)
        .delete('/events/eventId')
        .set('Cookie', ['userEmail=user@example.com']);

      expect(res.status).toBe(403);
      expect(res.text).toContain('You are not authorized to delete this event');
    });
  });
});
