const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const eventRoutes = require('./routes/eventRoutes');
const session = require('express-session'); //npm i express-session
const userRoutes = require('./routes/userRoutes');
const MongoStore = require('connect-mongo');
const isAuthenticated = require('./middleware/auth'); // Adjust path as needed
// For form data parsing
// const bodyParser = require('body-parser');
const app = express();
require('dotenv').config(); //links .env file

let port = 3000;
let host = 'localhost';
let url = `mongodb+srv://${process.env.USER}:${process.env.PASS}@eventcluster.7ilvk.mongodb.net/CLTSocial?retryWrites=true&w=majority&appName=EventCluster`

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
// Protect routes that require login
app.use('/protected-route', isAuthenticated, eventRoutes); // Example of using middleware on event routes

app.use(
    session({
        secret: '75377306233c1c3e8fac85a4ed4820a311c7ddf9066a4658785d30a3833f8cfc72752894f2d09e0bfb8be0191a249907b5842cce21e5ad924681a88e68b3b628',
        resave: false,
        saveUninitialized: false,
        cookie: {maxAge: 60*60*1000}, //60 mins, 60 secs, 1000 milliseconds = 1 hour
        store: new MongoStore({mongoUrl: url}) //same url as connecting to database
    })
);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Users Page route
app.use('/users', userRoutes);

// Events Page route
app.use('/', eventRoutes);

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        app.listen(port, host, () => {
            console.log(`Server is running on http://localhost:${port}`); //Yes you are required to use ` and not ' or ". Coding is fun.
        });
    });