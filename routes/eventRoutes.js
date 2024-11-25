const express = require('express');
const controller = require('../controllers/eventController');
const { upload } = require('../middleware/fileUpload');
const Event = require('../models/event');
const User = require('../models/user');


const router = express.Router();

// Home page route with upcoming events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    const upcomingEvents = events.slice(0, 3);
    res.render('index', { upcomingEvents });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching events.");
  }
});

// Events page route (shows list of all events)
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find();
    const userEmail = req.session.userEmail || null;
    events.isActive = events.date > new Date();
    res.render('events/events', { events, userEmail });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching events.");
  }
});

// Create Event page route
router.get("/create/event", async (req, res) => {
  res.render("create/createEvent"); // Renders createEvent.ejs
});

// Single Event Details route (view individual event)
router.get('/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).send('Event not found');
    }

    // Check if the logged-in user owns the event
    const userEmail = req.session && req.session.userEmail;
    const isOwner = userEmail && userEmail === event.userEmail;

    res.render('events/eventSingle', {
      event,
      isOwner, // Explicitly pass true or false
    });
  } catch (err) {
    console.error('Error fetching event details:', err);
    res.status(500).send('Error fetching event details.');
  }
});



// POST route to handle event creation with file upload
router.post('/create/event', upload.single('logo'), async (req, res) => {
  try {
    if (!req.session || !req.session.userEmail) {
      return res.status(401).send('You must be logged in to create an event.');
    }
    const { title, date, location, description } = req.body;
    const logoPath = req.file ? `/images/${req.file.filename}` : '';

    const newEvent = new Event({
        title,
        date,
        location,
        description,
        imagePath: logoPath,
        userEmail: req.session.userEmail,  // Store the email of the user who created the event
    });

    await newEvent.save();
    console.log("Event created successfully:", newEvent);
    res.redirect('/events');
  } catch (error) {
      console.error("Error creating event:", error.message, error.stack); // Log full error stack
      res.status(500).send(`Error creating event: ${error.message}`); // Send detailed error in response
  }
});

// Route to delete an event
router.delete('/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    // Check if event exists and if the user is the owner
    if (!event) {
      return res.status(404).send('Event not found');
    }

    if (event.userEmail !== req.session.userEmail) {
      return res.status(403).send('You are not authorized to delete this event');
    }

    // Use findByIdAndDelete to remove the event
    await Event.findByIdAndDelete(eventId);
    res.status(200).send('Event deleted successfully');
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).send('Error deleting event');
  }
});







module.exports = router;
