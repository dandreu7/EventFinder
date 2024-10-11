const express = require('express');
const path = require('path');
const multer = require('multer'); // Multer for file uploads
const bodyParser = require('body-parser'); // For form data parsing
const app = express();

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads'); // Destination folder for uploaded images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Naming the file with a timestamp
  }
});
const upload = multer({ storage: storage });

// In-memory user for authentication demonstration
const user = { email: 'user@example.com', password: 'password123' };
const users = []; // Simple in-memory array to store new users

// Event Data (for demonstration)
const events = [
  { id: 1, name: 'UNCC Campus Concert', date: '2024-09-25', time: '6:00 PM', location: 'UNC Charlotte Campus', description: 'Join us for an unforgettable concert at the Student Union!', admission: '20', imagePath: '/uploads/concert.jpg' },
  { id: 2, name: 'PNC Music Festival', date: '2024-09-30', time: '5:00 PM', location: 'PNC Music Pavilion', description: 'A weekend-long festival featuring popular artists from around the world!', admission: '50', imagePath: '/uploads/festival.jpg' },
  { id: 3, name: 'Charlotte Car Show', date: '2024-10-05', time: '10:00 AM', location: 'Charlotte Convention Center', description: 'Check out the latest car models and meet fellow car enthusiasts!', admission: '15', imagePath: '/uploads/carshow.jpg' },
  { id: 4, name: 'Food Truck Friday', date: '2024-10-10', time: '12:00 PM', location: 'Uptown Charlotte', description: 'Enjoy the best food trucks in Charlotte, featuring local delicacies and international flavors!', admission: '10', imagePath: '/uploads/foodtruck.jpg' },
  { id: 5, name: 'UNCC Career Fair', date: '2024-10-15', time: '11:00 AM', location: 'UNC Charlotte Student Union', description: 'Meet recruiters from top companies and find your dream job!', admission: 'Free', imagePath: '/uploads/careerfair.jpg' },
  { id: 6, name: 'Carolina Panthers vs Falcons', date: '2024-10-20', time: '1:00 PM', location: 'Bank of America Stadium', description: 'Watch the Panthers take on the Falcons in an exciting NFL matchup!', admission: '100', imagePath: '/uploads/panthers.jpg' },
  { id: 7, name: 'Latin Dance Night', date: '2024-10-22', time: '8:00 PM', location: 'The Fillmore Charlotte', description: 'An evening of salsa and bachata dancing with live music!', admission: '25', imagePath: '/uploads/dancenight.jpg' },
  { id: 8, name: 'Craft Beer Festival', date: '2024-10-28', time: '3:00 PM', location: 'BB&T Ballpark', description: 'Sample local craft beers from Charlotte\'s best breweries!', admission: '40', imagePath: '/uploads/beerfest.jpg' },
  { id: 9, name: 'UNCC Homecoming Parade', date: '2024-11-05', time: '12:00 PM', location: 'UNC Charlotte Campus', description: 'Celebrate UNCC Homecoming with a parade through campus!', admission: 'Free', imagePath: '/uploads/parade.jpg' },
  { id: 10, name: 'Winter Wonderland at Freedom Park', date: '2024-12-01', time: '5:00 PM', location: 'Freedom Park', description: 'A magical winter festival with ice skating, lights, and holiday treats!', admission: '25', imagePath: '/uploads/winterwonderland.jpg' }
];

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Home page route with upcoming events
app.get('/', (req, res) => {
  const sortedEvents = events.sort((a, b) => new Date(a.date) - new Date(b.date));
  const upcomingEvents = sortedEvents.slice(0, 3);
  res.render('index', { upcomingEvents }); // Pass the upcoming events to the index.ejs file
});

// Create Event page route (comes before dynamic event ID)
app.get('/events/create', (req, res) => {
  res.render('events/createEvent'); // Renders createEvent.ejs
});

// RSVP'd Events page route
app.get("/events/rsvp'd", (req, res) => {
  res.render("events/rsvpEvent"); // Renders rsvpEvent.ejs
})

// Events page route
app.get('/events', (req, res) => {
  res.render('events/events', { events }); // Render events.ejs and pass all events
});

// Single Event Details route (view individual event)
app.get('/events/:id', (req, res) => {
  const eventId = parseInt(req.params.id);
  const event = events.find(e => e.id === eventId);

  if (event) {
    res.render('events/eventSingle', { event }); // Render eventSingle.ejs and pass the event data
  } else {
    res.status(404).send('Event not found'); // Handle case where event is not found
  }
});

// Login page route
app.get('/login', (req, res) => {
  res.render('user/login'); // Render login.ejs
});

// Handle login form submission
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Validate credentials (in-memory user for simplicity)
  if (email === user.email && password === user.password) {
    // If valid, redirect to profile page
    res.render('user/profile', { user });
  } else {
    // If invalid, send error message
    res.send('Invalid email or password');
  }
});

// Signup page route
app.get('/signup', (req, res) => {
  res.render('user/signup'); // Render signup.ejs
});

// Handle signup form submission
app.post('/signup', (req, res) => {
  const { email, password } = req.body;

  // Simulate saving the user to the database
  users.push({ email, password });
  console.log('New Account Created:', { email, password });

  // Redirect to login after account creation
  res.redirect('/login');
});

// POST route to handle the event creation form submission with file upload
app.post('/events/create', upload.single('logo'), (req, res) => {
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
