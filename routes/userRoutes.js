const express = require('express');
const controller = require('../controllers/userController');
const User = require('../models/user');

const router = express.Router();

// Login page route
router.get('/login', async (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect('/');
    }
    const error = req.session.error; // Retrieve error message from session
    req.session.error = null; // Clear the error message from session
    res.render('user/login', { error }); // Pass the error to the template
    
});

// Handle login form submission and create session
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Normalize email to lowercase
        const normalizedEmail = email.toLowerCase();

        // Find user by normalized email
        const user = await User.findOne({ email: normalizedEmail });
        console.log('User found:', user);
        if (!user) {
            req.session.error = 'Invalid login credentials';
            return res.redirect('/users/login');
        }

        // Compare passwords
        const isMatch = await user.comparePassword(password);
        console.log('Password match:', isMatch);
        if (!isMatch) {
            req.session.error = 'Invalid login credentials';
            return res.redirect('/users/login');
        }

        // Store user ID in session
        req.session.userId = user._id;

        req.session.userEmail = user.email; // Store user email in session
        req.session.hostUser = user._id; // Store user ID (or another identifier) in session


        // Redirect to profile
        res.redirect('/users/profile');
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).send('Error logging in.');
    }
});



// Profile page route
router.get('/profile', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/users/login'); // Redirect if not logged in
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('user/profile', { user });
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).send('Internal Server Error');
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
    res.render('user/signup', { errorMessage: null });  // Render signup.ejs
});

// Profile page route (protected)
router.get('/profile', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/users/login'); // Redirect if not logged in
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('user/profile', { user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching profile.');
    }
});

// Handle signup form submission
router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();

    try {
        // Check if the email already exists in the database
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
           // If a duplicate email is found, render the signup page with an error message
            return res.render('user/signup', {
                errorMessage: 'A user with this email already exists.', // Pass the error message
            });
        }

        const newUser = new User({
            firstName,
            lastName,
            email: normalizedEmail, // Save the normalized email
            password,
        });

        // Save the user to the database
        await newUser.save();

        // Automatically log the user in after signup by creating a session
        req.session.userId = newUser._id;
        req.session.userEmail = newUser.email; // Store user email in session

        // Redirect to the profile page
        res.redirect('/users/profile');
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).send('Error creating account.');
    }
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
