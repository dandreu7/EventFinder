const express = require('express');
const controller = require('../controllers/userController');
const User = require('../models/user');
const Event = require('../models/event');

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
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Find events created by the user's email
    const events = await Event.find({ userEmail: user.email });

    // Render the profile page with user and events
    res.render('user/profile', { user, events });
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).send('Internal Server Error');
    };
});

// Handle profile updates
router.post("/profile/edit", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/users/login");
  }

  const { firstName, lastName, bio } = req.body;

  try {
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

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.render("user/signup", {
        errorMessage: "A user with this email already exists.",
      });
    }

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

// Route to check if the user is logged in
router.get("/status", (req, res) => {
  res.json({ loggedIn: !!req.session.userId });
});

// Catch-all 404 route
router.use((req, res) => {
  res.status(404).render("404", { message: "Page Not Found" });
});

module.exports = router;
