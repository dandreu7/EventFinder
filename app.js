const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const multer = require("multer"); // Multer for file uploads
const bodyParser = require("body-parser"); // For form data parsing
const app = express();
require("dotenv").config(); //links .env file

let port = 3000;
let host = "localhost";
let url = `mongodb+srv://${process.env.USER}:${process.env.PASS}@eventcluster.7ilvk.mongodb.net/CLTSocial?retryWrites=true&w=majority&appName=EventCluster`;

mongoose
  .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(port, host, () => {
      console.log("Server is running on port", port);
      console.log(`Server is running on http://localhost:${port}`); //Yes you are required to use ` and not ' or ". Coding is fun.
    });
  });

const eventSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    date: String,
    time: String,
    location: String,
    description: String,
    admission: String,
    imagePath: String
  });
  
const Event = mongoose.model("Event", eventSchema);

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads"); // Destination folder for uploaded images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Naming the file with a timestamp
  },
});
const upload = multer({ storage: storage });

//Will be removed in future iteration
// In-memory user for authentication demonstration
const user = { email: "user@example.com", password: "password123" };
const users = []; // Simple in-memory array to store new users

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Set the view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Home page route with upcoming events
app.get("/", (req, res) => {
  Event.find()
    .sort({ date: 1 })
    .limit(3)
    .then((events) => {
      res.render("index", { upcomingEvents: events });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error fetching events from database.");
    });
});

app.get("/events", (req, res) => {
  Event.find()
    .sort({ date: 1 })
    .then((events) => {
      res.render("events/events", { events });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error fetching events from database.");
    });
});

app.get("/events/:id", (req, res) => {
  const eventId = req.params.id;

  Event.findById(eventId)
    .then((event) => {
      if (event) {
        res.render("events/eventSingle", { event }); 
      } else {
        res.status(404).send("Event not found");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error fetching event details.");
    });
});

// Create Event page route (comes before dynamic event ID)
app.get("/create/event", (req, res) => {
  res.render("create/createEvent"); // Renders createEvent.ejs
});

// RSVP'd Events page route
app.get("/events/rsvp'd", (req, res) => {
  res.render("events/rsvpEvent"); // Renders rsvpEvent.ejs
});

// Login page route
app.get("/login", (req, res) => {
  res.render("user/login"); // Render login.ejs
});

// Handle login form submission
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Validate credentials (in-memory user for simplicity)
  if (email === user.email && password === user.password) {
    // If valid, redirect to profile page
    res.render("user/profile", { user });
  } else {
    // If invalid, send error message
    res.send("Invalid email or password");
  }
});

// Signup page route
app.get("/signup", (req, res) => {
  res.render("user/signup"); // Render signup.ejs
});

// Profile page route
app.get("/profile", (req, res) => {
  res.render("user/profile"); // Render the profile.ejs file inside the user directory
});

// Handle signup form submission
app.post("/signup", (req, res) => {
  const { email, password } = req.body;

  // Simulate saving the user to the database
  users.push({ email, password });
  console.log("New Account Created:", { email, password });

  // Redirect to login after account creation
  res.redirect("/login");
});

// POST route to handle the event creation form submission with file upload
app.post("/create/event", upload.single("logo"), (req, res) => {
  const { name, date, location, description } = req.body;
  const logoPath = req.file ? `/uploads/${req.file.filename}` : ""; // Get the uploaded file path

  // Logic to push the new event to the events array
  const newEvent = {
    id: events.length + 1, // Incremental ID
    name,
    date,
    location,
    description,
    imagePath: logoPath,
    admission: "Free", // Default or custom value
    time: "To be decided", // Default or custom value
  };

  events.push(newEvent); // Add the new event to the array
  res.redirect("/events"); // Redirect to the events page after creating
});

// Start the server
/*const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});*/
