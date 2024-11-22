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
    events.isActive = events.date > new Date();
    res.render('events/events', { events });
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
    const eventId = req.params.id; // Use the ID directly as a string
    const event = Event.findById(eventId); // Fetch the event by its MongoDB ObjectId

    if (event) {
      // Compare the event date to the current date and set isActive
      const currentDate = new Date();
      event.isActive = new Date(event.date) >= currentDate;

      res.render('events/eventSingle', { event });
    } else {
      res.status(404).send('Event not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching event details.');
  }
});

// POST route to handle event creation with file upload
router.post('/create/event', upload.single('logo'), async (req, res) => {
  try {
      const userEmail = req.session.userEmail;  // Get the email from session
      const hostUser = req.session._id;  // Get the user ID from session

      if (!userEmail || !hostUser) {
        res.status(401).send("You must be logged in to create an event.");
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

module.exports = router;
