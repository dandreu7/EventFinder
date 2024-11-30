const express = require("express");
const User = require("../models/user");
const Event = require("../models/event");

const router = express.Router();

// Login page route
router.get("/login", async (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect("/");
  }
  const error = req.session.error;
  req.session.error = null;
  res.render("user/login", { error });
});

// Handle login form submission and create session
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !(await user.comparePassword(password))) {
      req.session.error = "Invalid login credentials";
      return res.redirect("/users/login");
    }

    req.session.userId = user._id;
    req.session.userEmail = user.email;

    res.redirect("/users/profile");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Error logging in.");
  }
});

// Profile page route
router.get("/profile", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/users/login");
  }

  try {
    // Fetch user details
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Fetch events created by the user
    const userCreatedEvents = await Event.find({ userEmail: user.email });

    // Fetch events RSVP'd by the user
    const rsvpedEvents = await Event.find({ _id: { $in: user.rsvpedEvents } });

    // Render profile page with user-created and RSVP'd events
    res.render("user/profile", { user, userCreatedEvents, rsvpedEvents });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Handle profile updates
router.post("/profile/edit", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/users/login");
  }

  const { firstName, lastName, bio } = req.body;

  try {
    // Update user profile information
    await User.findByIdAndUpdate(req.session.userId, {
      firstName,
      lastName,
      bio,
    });

    res.redirect("/users/profile");
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).send("Error updating profile.");
  }
});

// Logout route to destroy session
router.post("/logout", async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send("Could not log out");
    }
    res.clearCookie("connect.sid");
    res.redirect("/users/login");
  });
});

// Signup page route
router.get("/signup", (req, res) => {
  res.render("user/signup", { errorMessage: null });
});

// Handle signup form submission
router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const normalizedEmail = email.toLowerCase();

    // Check if the user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.render("user/signup", {
        errorMessage: "A user with this email already exists.",
      });
    }

    // Create a new user
    const newUser = new User({
      firstName,
      lastName,
      email: normalizedEmail,
      password,
    });

    await newUser.save();
    req.session.userId = newUser._id;
    req.session.userEmail = newUser.email;

    res.redirect("/users/profile");
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).send("Error creating account.");
  }
});

//edit-event route for profile page
router.post("/profile/edit-event", async (req, res) => {
  console.log("Checkpoint 1");
  try {
    const { eventId, title, date, location, description } = req.body;

    // Validate required fields
    if (!eventId || !title || !date || !location || !description) {
      return res.status(400).send("Missing required fields");
    }

    // Update the event in the database
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { title, date, location, description },
      { new: true } // Return the updated document
    );

    if (!updatedEvent) {
      return res.status(404).send("Event not found");
    }

    console.log("Event updated successfully:", updatedEvent);
    res.redirect("/users/profile"); // Redirect back to the profile page
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to check if the user is logged in
router.get("/status", (req, res) => {
  res.json({ loggedIn: !!req.session.userId });
});

// Catch-all 404 route
router.use((req, res) => {
  res.status(404).render("404", { message: "Page Not Found" });
});

module.exports = router;
