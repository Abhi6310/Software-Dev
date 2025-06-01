
// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); 
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');
const pgp = require('pg-promise')(); 
const bodyParser = require('body-parser');
const session = require('express-session'); 
const bcrypt = require('bcryptjs'); 
const axios = require('axios');

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
});

// database configuration
const dbConfig = {
  host: 'db', 
  port: 5432, 
  database: process.env.POSTGRES_DB, 
  user: process.env.POSTGRES_USER, 
  password: process.env.POSTGRES_PASSWORD, 
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful');
    obj.done();
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

//Default route for login
app.get('/', (req, res) => {
  res.redirect('/login');
});

//Makes the get and renders the register page
app.get('/register', (req, res) => {
  res.render('pages/register');
});

//Same thing for post registering a user with a hashed password
app.post('/register', async (req, res) => {
  try {
    //Hasing the password
    const hash = await bcrypt.hash(req.body.password, 10);

    //Insert username and hashed password into the users table
    await db.none('INSERT INTO users (username, password) VALUES ($1, $2)', [
      req.body.username,
      hash,
    ]);

    //After inserting, go to the login page
    res.redirect('/login');
  } catch (error) {
    console.error('Error inserting user:', error);

    //If this ever runs, it means it messed up somewhere redo 
    res.render('pages/register', { message: 'Error registering user. Please try again.' });
  }
});

// Makes the login page
app.get('/login', (req, res) => {
  res.render('pages/login');
});

//Verifying the login 
app.post('/login', async (req, res) => {
  try {
    //Searching for the user in the databse, if they're found continue, if not it should redirect to register
    const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [req.body.username]);
    if (!user) {
      return res.redirect('/register');
    }
    //Checks for matching password
    const match = await bcrypt.compare(req.body.password, user.password);
    if (match) {
      //If the password is good, it redirects to discover
      req.session.user = user;
      req.session.save(() => {
        res.redirect('/discover');
      });
    } else {
      //Display for error when the password is wrong
      res.render('pages/login', { message: 'Incorrect username or password.' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.render('pages/login', { message: 'An error occurred. Please try again.' });
  }
});

// Authentication Middleware
const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

//Applying middleware to routes that need correct credentials
app.use('/discover', auth);
app.use('/logout', auth);

//Discover page
app.get('/discover', async (req, res) => {
  try {
    const response = await axios({
      url: `https://app.ticketmaster.com/discovery/v2/events.json`,
      method: 'GET',
      headers: {
        'Accept-Encoding': 'application/json',
      },
      params: {
        apikey: process.env.API_KEY,
        keyword: 'music', //Searching for music
        size: 10,         //Limiting it to 10 results
      },
    });

    //Add event data to an array
    const events = response.data._embedded.events.map(event => ({
      name: event.name,
      images: event.images,
      date: event.dates.start.localDate,
      time: event.dates.start.localTime,
      url: event.url,
    }));

    //re-render the page with the updated data
    res.render('pages/discover', { results: events });
  } catch (error) {
    //error handling
    console.error('Error fetching events:', error);

    //render discover with an empty array and error message in case it messes up 
    res.render('pages/discover', { results: [], message: 'Failed to load events. Please try again later.' });
  }
});

//Logout page
app.get('/logout', (req, res) => {
  //Destroy the session and everything in it
  req.session.destroy(error => {
    if (error) {
      console.error('Error destroying session:', error);
      return res.render('pages/logout', { message: 'Error logging out. Please try again.' });
    }
    //Render the logout page with a success message
    res.render('pages/logout', { message: 'Logged out successfully.' });
  });
});

// *****************************************************
// <!-- Section 5 : Start Server -->
// *****************************************************
app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
