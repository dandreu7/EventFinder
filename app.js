const express = require('express');
const path = require('path');
const multer = require('multer'); // Multer for file uploads
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

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));

// Home page route with upcoming events
app.get('/', (req, res) => {
  // Sort events by date
  const sortedEvents = events.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Get the top 3 upcoming events
  const upcomingEvents = sortedEvents.slice(0, 3);

  res.render('index', { upcomingEvents }); // Pass the upcoming events to the index.ejs file
});

// Events page route
app.get('/events', (req, res) => {
  res.render('events/events', { events }); // Pass all events to the events.ejs file
});

// Create Event page route
app.get('/events/create', (req, res) => {
  res.render('events/createEvent'); // Renders createEvent.ejs
});

// POST route to handle the form submission with file upload
app.post('/events/create', upload.single('logo'), (req, res) => {
  const { name, date, location, description } = req.body;
  const logoPath = req.file ? `/uploads/${req.file.filename}` : ''; // Get the uploaded file path
  console.log('New Event Created:', { name, date, location, description, logoPath });

  // Add the logic to save the event (e.g., saving to a database or an array)

  res.redirect('/events'); // Redirect to the events page after creating
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
