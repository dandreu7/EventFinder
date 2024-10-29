const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser'); // For form data parsing
const app = express();
require('dotenv').config(); //links .env file

let port = 3000;
let host = 'localhost';
let url = `mongodb+srv://${process.env.USER}:${process.env.PASS}@eventcluster.7ilvk.mongodb.net/?retryWrites=true&w=majority&appName=EventCluster`


mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        app.listen(port, host, () => {
            console.log('Server is running on port', port);
            console.log(`Server is running on http://localhost:${port}`); //Yes you are required to use ` and not ' or ". Coding is fun.
        });
    });




//Will be removed in future iteration
  // In-memory user for authentication demonstration
const user = { email: 'user@example.com', password: 'password123' };
const users = []; // Simple in-memory array to store new users

// Event Data (for demonstration)
const events = [
  { id: 1, name: 'UNCC Campus Concert', date: '2024-09-25', time: '6:00 PM', location: 'UNC Charlotte Campus', description: 'Join us for an unforgettable concert at the Student Union!', admission: '20', imagePath: '' },
  { id: 2, name: 'PNC Music Festival', date: '2024-09-30', time: '5:00 PM', location: 'PNC Music Pavilion', description: 'A weekend-long festival featuring popular artists from around the world!', admission: '50', imagePath: '/images/pnc_pavillion.jpg' },
  { id: 3, name: 'Charlotte Car Show', date: '2024-10-05', time: '10:00 AM', location: 'Charlotte Convention Center', description: 'Check out the latest car models and meet fellow car enthusiasts!', admission: '15', imagePath: '' },
  { id: 4, name: 'Food Truck Friday', date: '2024-10-10', time: '12:00 PM', location: 'Uptown Charlotte', description: 'Enjoy the best food trucks in Charlotte, featuring local delicacies and international flavors!', admission: '10', imagePath: '' },
  { id: 5, name: 'UNCC Career Fair', date: '2024-10-15', time: '11:00 AM', location: 'UNC Charlotte Student Union', description: 'Meet recruiters from top companies and find your dream job!', admission: 'Free', imagePath: '' },
  { id: 6, name: 'Carolina Panthers vs Falcons', date: '2024-10-20', time: '1:00 PM', location: 'Bank of America Stadium', description: 'Watch the Panthers take on the Falcons in an exciting NFL matchup!', admission: '100', imagePath: '/images/nfl_stadium.jpg' },
  { id: 7, name: 'Latin Dance Night', date: '2024-10-22', time: '8:00 PM', location: 'The Fillmore Charlotte', description: 'An evening of salsa and bachata dancing with live music!', admission: '25', imagePath: '/images/uncc_latinX.jpg' },
  { id: 8, name: 'Craft Beer Festival', date: '2024-10-28', time: '3:00 PM', location: 'BB&T Ballpark', description: 'Sample local craft beers from Charlotte\'s best breweries!', admission: '40', imagePath: '' },
  { id: 9, name: 'UNCC Homecoming Parade', date: '2024-11-05', time: '12:00 PM', location: 'UNC Charlotte Campus', description: 'Celebrate UNCC Homecoming with a parade through campus!', admission: 'Free', imagePath: '' },
  { id: 10, name: 'Winter Wonderland at Freedom Park', date: '2024-12-01', time: '5:00 PM', location: 'Freedom Park', description: 'A magical winter festival with ice skating, lights, and holiday treats!', admission: '25', imagePath: '' }
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

// Users Page route
app.use('/users', userRoutes);

// Events Page route
app.use('/events', eventRoutes);


// Start the server
/*const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});*/
