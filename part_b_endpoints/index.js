// ************************************************
// <!-- Section 1 : Dependencies-->
// ************************************************

// importing the dependencies
// Express is a NodeJS framework that, among other features, allows us to create HTML templates.
const express = require('express');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
require('dotenv').config();

// ************************************************
// <!-- Section 2 : Initialization-->
// ************************************************

// defining the Express app
const app = express();
// using bodyParser to parse JSON in the request body into JS objects
app.use(bodyParser.json());
// Database connection details
const dbConfig = {
  host: 'db',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};
// Connect to database using the above details
const db = pgp(dbConfig);

// ************************************************
// <!-- Section 3 : TODOs Enpoint Implementation-->
// ************************************************

// <!-- Endpoint 1 :  GET Endpoint Implementation (Default) -->
const message = 'Hey there!';
app.get('/', (req, res) => {
  res.send(message);
});

// <!-- Endpoint 2 : GET Endpoint Implementation -->
app.get('getTop3Trails', function (req, res) {
});

// <!-- Endpoint 3 : POST Endpoint Implementation -->
app.post('addReview', function (req, res) {
});

// <!-- Endpoint 4 : PUT Endpoint Implementation -->
app.put('updateReview', function (req, res) {
});

// <!-- Endpoint 5 : DELETE Endpoint Implementation -->
app.delete('deleteReview', function (req, res) {
});

// <!-- Endpoint 6 : GET Endpoint Implementation -->
app.get('getTrails', function (req, res) {
});

// <!-- Endpoint 7 : GET Endpoint Implementation -->
app.get('getReviewsByTrailID', function (req, res) {
});

// ************************************************
// <!-- Section 4 : Start Server-->
// ************************************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000, () => {
  console.log('listening on port 3000');
});
