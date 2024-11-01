const express = require('express');
const controller = require('../controllers/eventController');
const {upload} = require('../middleware/fileUpload');
//const {upload} = require('../controllers/eventController');

const router = express.Router();

// Create Event page route (comes before dynamic event ID)
router.get('/events/create', (req, res) => {
    res.render('events/createEvent'); // Renders createEvent.ejs
});

// RSVP'd Events page route
router.get("/events/rsvp'd", (req, res) => {
    res.render("events/rsvpEvent"); // Renders rsvpEvent.ejs
})

// Events page route
router.get('/events', (req, res) => {
    res.render('events/events', { events }); // Render events.ejs and pass all events
});

// Single Event Details route (view individual event)
router.get('/events/:id', (req, res) => {
    const eventId = parseInt(req.params.id);
    const event = events.find(e => e.id === eventId);

    if (event) {
        res.render('events/eventSingle', { event }); // Render eventSingle.ejs and pass the event data
    } else {
        res.status(404).send('Event not found'); // Handle case where event is not found
    }
});

// POST route to handle the event creation form submission with file upload
router.post('/events/create', upload.single('logo'), (req, res) => {
    const { name, date, location, description } = req.body;
    const logoPath = req.file ? `/uploads/${req.file.filename}` : ''; // Get the uploaded file path

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

    events.push(newEvent); // Add the new event to the array
    res.redirect('/events'); // Redirect to the events page after creating
});

module.exports = router;