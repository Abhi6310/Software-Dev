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
// <!-- Section 3 : Example Endpoints Implementation-->
// ************************************************

// GET Endpoint Implementation (Default)
// <!-- Endpoint 1 :  Default endpoint ("/") -->
const message = 'Hey there!';
app.get('/', (req, res) => {
  res.send(message);
});

// GET Endpoint Implementation
// <!-- Endpoint 2 :  Get User Details ("/getUserInfo") -->
app.get('/getUserInfo', function (req, res) {
  // Fetch query parameters from the request object
  var username = req.query.username;
  var city = req.query.city;

  // Multiple queries using templated strings
  var current_user = `select * from userinfo where username = '${username}';`;
  var city_users = `select * from userinfo where city = '${city}';`;

  // use task to execute multiple queries
  db.task('get-everything', task => {
    return task.batch([task.any(current_user), task.any(city_users)]);
  })
    // if query execution succeeds
    // query results can be obtained
    // as shown below
    .then(data => {
      res.status(200).json({
        current_user: data[0],
        city_users: data[1],
      });
    })
    // if query execution fails
    // send error message
    .catch(err => {
      console.log('Uh Oh spaghettio');
      console.log(err);
      res.status('400').json({
        current_user: '',
        city_users: '',
        error: err,
      });
    });
});

// POST Endpoint Implementation
// <!-- Endpoint 3 :  Add User ("/add_user") -->
app.post('/add_user', function (req, res) {
  const query =
    'insert into userinfo (name, username, email, city) values ($1, $2, $3, $4)  returning * ;';
  db.any(query, [
    req.body.name,
    req.body.username,
    req.body.email,
    req.body.city,
  ])
    // if query execution succeeds
    // send success message
    .then(function (data) {
      res.status(201).json({
        status: 'success',
        data: data,
        message: 'data added successfully',
      });
    })
    // if query execution fails
    // send error message
    .catch(function (err) {
      return console.log(err);
    });
});

// PUT Endpoint Implementation
// <!-- Endpoint 4 :  Update User ("/update_user") -->
app.put('/update_user', function (req, res) {
  const query =
    'update userinfo set name = $1 where username = $2 returning * ;';
  // $1 and $2 will be replaced by req.body.name, req.body.username
  db.any(query, [req.body.name, req.body.username])
    // if query execution succeeds
    // send success message
    .then(function (data) {
      res.status(201).json({
        status: 'success',
        data: data,
        message: 'data updated successfully',
      });
    })
    // if query execution fails
    // send error message
    .catch(function (err) {
      return console.log(err);
    });
});

// DELETE Endpoint Implementation
// <!-- Endpoint 5 :  Delete User ("/delete_user") -->
app.delete('/delete_user/:username', function (req, res) {
  //Here we are using path parameter
  const username = req.params.username;
  const query = 'delete from userinfo where username = $1 returning * ;';

  db.any(query, [username])
    // if query execution succeeds
    // send success message
    .then(function (data) {
      res.status(200).json({
        status: 'success',
        data: data,
        message: 'data deleted successfully',
      });
    })
    // if query execution fails
    // send error message
    .catch(function (err) {
      return console.log(err);
    });
});

// ************************************************
// <!-- Section 4 : Start Server-->
// ************************************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000, () => {
  console.log('listening on port 3000');
});
