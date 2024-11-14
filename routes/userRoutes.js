const express = require('express');
const controller = require('../controllers/userController');
const { users } = require('../testing/sampleUsers');
const router = express.Router();

// Login page route
router.get('/login', (req, res) => {
    const error = req.session.error; // Retrieve error message from session
    req.session.error = null; // Clear the error message from session
    res.render('user/login', { error }); // Pass the error to the template
});

// Handle login form submission and create session
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Validate credentials (using in-memory user data for simplicity)
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        // Store user ID in session to keep the user logged in
        req.session.userId = user.email;

        // Redirect to the profile page after successful login
        res.redirect('/users/profile');
    } else {
        // Store error message in session and redirect to login
        req.session.error = 'Invalid login credentials';
        res.redirect('/users/login'); // Redirect to /login so it becomes a GET request
    }
});

// Logout route to destroy session
router.post('/logout', (req, res) => {
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
    const user = users.find(u => u.email === req.session.userId);
    res.render('user/profile', { user });
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
