const express = require('express');
const controller = require('../controllers/eventController');
const { upload } = require('../middleware/fileUpload');
const Event = require('../models/event');


const router = express.Router();

// RSVP'd Events page route
router.get("/rsvp'd", (req, res) => {
    res.render("events/rsvpEvent"); // Renders rsvpEvent.ejs
});

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
    res.render('events/events', { events });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching events.");
  }
});

router.get('/events/:id', (req, res) => {
  const eventId = req.params.id;
  
  Event.findById(eventId)
    .then(event => {
      if (event) {
        res.render('events/eventSingle', { event });
      } else {
        res.status(404).send('Event not found');
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Error fetching event details.');
    });
});

// Create Event page route
router.get("/create/event", (req, res) => {
  res.render("create/createEvent"); // Renders createEvent.ejs
});

// Single Event Details route (view individual event)
router.get('/:id', (req, res) => {
    const eventId = parseInt(req.params.id);
    const events = Event.find(e => e.id === eventId);

    if (events) {
        res.render('events/eventSingle', { events });
    } else {
        res.status(404).send('Event not found');
    }
});

// POST route to handle event creation with file upload
router.post('/create', upload.single('logo'), (req, res) => {
    const { name, date, location, description } = req.body;
    const logoPath = req.file ? `/uploads/${req.file.filename}` : ''; // Uploaded file path

    // Logic to push the new event to the events array
    const newEvent = new Event({
        id: events.length + 1, // Incremental ID
        name,
        date,
        location,
        description,
        imagePath: logoPath,
        admission: 'Free', // Default or custom value
        time: 'To be decided', // Default or custom value
    });
    
    newEvent.save();
    res.redirect('/events');
  });

module.exports = router;
