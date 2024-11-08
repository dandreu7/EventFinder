const express = require('express');
const controller = require('../controllers/eventController');
const { upload } = require('../middleware/fileUpload');
const events = require('../testing/sampleData');

const router = express.Router();

// Create Event page route
router.get('/create', (req, res) => {
    res.render('events/createEvent'); // Renders createEvent.ejs
});

// RSVP'd Events page route
router.get("/rsvp'd", (req, res) => {
    res.render("events/rsvpEvent"); // Renders rsvpEvent.ejs
});

// Events page route (shows list of all events)
router.get('/', (req, res) => {
    res.render('events/events', { events }); // Renders events.ejs and passes all events
});

// Single Event Details route (view individual event)
router.get('/:id', (req, res) => {
    const eventId = parseInt(req.params.id);
    const event = events.find(e => e.id === eventId);

    if (event) {
        res.render('events/eventSingle', { event }); // Renders eventSingle.ejs and passes the event data
    } else {
        res.status(404).send('Event not found'); // Handles case where event is not found
    }
});

// POST route to handle event creation with file upload
router.post('/create', upload.single('logo'), (req, res) => {
    const { name, date, location, description } = req.body;
    const logoPath = req.file ? `/uploads/${req.file.filename}` : ''; // Uploaded file path

    // Logic to push the new event to the events array
    const newEvent = {
        id: events.length + 1, // Incremental ID
        name,
        date,
        location,
        description,
        imagePath: logoPath,
        admission: 'Free', // Default or custom value
        time: 'To be decided', // Default or custom value
    };

    events.push(newEvent); // Adds the new event to the array
    res.redirect('/events'); // Redirects to events page after creating
});

module.exports = router;
