const express = require('express');
const controller = require('../controllers/userController');
const { users } = require ('../testing/sampleUsers');

const router = express.Router();

// Login page route
router.get('/login', (req, res) => {
    res.render('user/login'); // Render login.ejs
});

// Handle login form submission
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email && u.password === password);
    // Validate credentials (in-memory user for simplicity)
    if (user) {
        // If valid, redirect to profile page
        res.render('user/profile', { user });
    } else {
        // If invalid, send error message
        console.log("")
        res.render('user/login', {error: 'Invalid login credentials'});
    }
});

// Signup page route
router.get('/signup', (req, res) => {
    res.render('user/signup'); // Render signup.ejs
});

// Profile page route
router.get('/profile', (req, res) => {
    res.render('user/profile'); // Render the profile.ejs file inside the user directory
});

// Handle signup form submission
router.post('/signup', (req, res) => {
    const { email, password } = req.body;

    // Simulate saving the user to the database
    users.push({ email, password });
    console.log('New Account Created:', { email, password });

    // Redirect to login after account creation
    res.redirect('/users/login');
});

module.exports = router;