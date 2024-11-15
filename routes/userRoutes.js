const express = require('express');
const controller = require('../controllers/userController');
const User = require('../models/user');


const router = express.Router();

// Login page route
router.get('/login', async (req, res) => {
    const error = req.session.error; // Retrieve error message from session
    req.session.error = null; // Clear the error message from session
    res.render('user/login', { error }); // Pass the error to the template
});

// Handle login form submission and create session
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userEmail = req.params.email;
        // Validate credentials (using in-memory user data for simplicity)
        const user = await user.findById(userEmail);
        if (user) {
            // Store user ID in session to keep the user logged in
            req.session.userEmail = user.email;
            // Redirect to the profile page after successful login
            res.redirect('/users/profile');
        } else {
            // Store error message in session and redirect to login
            req.session.error = 'Invalid login credentials';
            res.redirect('/users/login'); // Redirect to /login so it becomes a GET request
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Account does not exist.');
    }
});

// Logout route to destroy session
router.post('/logout', async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.status(500).send('Could not log out');
        }
        res.clearCookie('connect.sid'); // Clears the session cookie
        res.redirect('/users/login'); // Redirect to login page
    });
});

// Signup page route
router.get('/signup', (req, res) => {
    res.render('user/signup'); // Render signup.ejs
});

// Profile page route (protected)
router.get('/profile', (req, res) => {
    if (!req.session.userId) {
        // If not logged in, redirect to login page
        return res.redirect('/users/login');
    }
    // Render the profile page if user is authenticated
    const User = user.find(u => u.email === req.session.userId);
    res.render('user/profile', { User });
});

// Handle signup form submission
router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    const newUser = new User({
        firstName,
        lastName,
        email,
        password,
    });

    // Simulate saving the user to the database
    await newUser.save();

    // Redirect to login after account creation
    res.redirect('/users/login');
});

// Route to check if the user is logged in
router.get('/status', (req, res) => {
    if (req.session.userId) {
      res.json({ loggedIn: true });
    } else {
      res.json({ loggedIn: false });
    }
});

// Export the router
module.exports = router;
