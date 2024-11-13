const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const MongoStore = require('connect-mongo');
// For form data parsing
// const bodyParser = require('body-parser');
const app = express();
require('dotenv').config(); //links .env file

let port = 3000;
let host = 'localhost';
let url = `mongodb+srv://${process.env.USER}:${process.env.PASS}@eventcluster.7ilvk.mongodb.net/CLTSocial?retryWrites=true&w=majority&appName=EventCluster`;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

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