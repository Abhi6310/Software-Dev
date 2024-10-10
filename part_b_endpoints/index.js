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
app.get('/getTop3Trails', function (req, res) {
  //Setting up query with SQL
  const query = `
    SELECT * 
    FROM trails 
    WHERE location = 'California' 
    ORDER BY avg_rating DESC 
    LIMIT 3
  `;
  //Running the query
  db.any(query)
    .then(trails => {
      //lists data for trails
      res.status(200).json(trails);
    })
    //error handling
    .catch(error => {
      console.error('Error fetching trails:', error);
      res.status(500).json({ message: 'Internal server error' });
    });

});

// <!-- Endpoint 3 : POST Endpoint Implementation -->
app.post('/addReview', function (req, res) {
  //validates parameters
  const { username, review, rating, image_url, image_caption } = req.body;
  if (!username || !review || !rating) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }
  //setup queries like endpoint 2
  const insertReviewQuery = `
    INSERT INTO reviews (username, review, rating)
    VALUES ($1, $2, $3)
    RETURNING review_id
  `;
  const insertImageQuery = `
    INSERT INTO images (image_url, image_caption)
    VALUES ($1, $2)
    RETURNING image_id
  `;
  //runs the queries
  db.tx(async t => {
    const reviewResult = await t.one(insertReviewQuery, [username, review, rating]);
    if (image_url && image_caption) {
      const imageResult = await t.one(insertImageQuery, [image_url, image_caption]);
      //links the image with the review
      await t.none('INSERT INTO reviews_to_images (image_id, review_id) VALUES ($1, $2)', [imageResult.image_id, reviewResult.review_id]);
    }
    return reviewResult;
  })
  //error handling
    .then(data => {
      res.status(201).json({
        status: 'success',
        review_id: data.review_id,
        message: 'Review added successfully'
      });
    })
    .catch(error => {
      console.error('Error adding review:', error);
      res.status(500).json({ message: 'Internal server error' });
    });
});

// <!-- Endpoint 4 : PUT Endpoint Implementation -->
app.put('/updateReview', function (req, res) {
  //parameter testing
  const { review, review_id, image_url, image_id } = req.body;
  if (!review || !review_id) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }
  //set up queries
  const updateReviewQuery = `
    UPDATE reviews
    SET review = $1
    WHERE review_id = $2
    RETURNING *
  `;

  const updateImageQuery = `
    UPDATE images
    SET image_url = $1
    WHERE image_id = $2
    RETURNING *
  `;
  //runs the query
  db.tx(async t => {
    const reviewUpdate = await t.one(updateReviewQuery, [review, review_id]);
    if (image_url && image_id) {
      //main part that updates image like before
      await t.one(updateImageQuery, [image_url, image_id]);
    }
    return reviewUpdate;
  })
  //error handling and sucess print
    .then(data => {
      res.status(200).json({
        status: 'success',
        data: data,
        message: 'Review updated successfully'
      });
    })
    .catch(error => {
      console.error('Error updating review:', error);
      res.status(500).json({ message: 'Internal server error' });
    });
});

// <!-- Endpoint 5 : DELETE Endpoint Implementation -->
app.delete('/deleteReview', function (req, res) {
  //parameter testing
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }
  //set up queries
  const deleteReviewQuery = `
    DELETE FROM reviews
    WHERE username = $1
    RETURNING *
  `;
  //runs the query
  db.oneOrNone(deleteReviewQuery, [username])
    .then(data => {
      if (!data) {
        return res.status(404).json({ message: 'Review not found for the given username' });
      }
      //success print
      res.status(200).json({
        status: 'success',
        data: data,
        message: 'Review deleted successfully'
      });
    })
    //error handling
    .catch(error => {
      console.error('Error deleting review:', error);
      res.status(500).json({ message: 'Internal server error' });
    });
});

// <!-- Endpoint 6 : GET Endpoint Implementation -->
app.get('/getTrails', function (req, res) {
  //parameters testing 
  const { difficulty, location } = req.query;
  if (!difficulty || !location) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }
  //set up queries
  const query = `
    SELECT * 
    FROM trails 
    WHERE difficulty = $1 AND location = $2
  `;
  //runs the queries
  db.any(query, [difficulty, location])
    .then(trails => {
      res.status(200).json(trails);
    })
    .catch(error => {
      console.error('Error fetching trails:', error);
      res.status(500).json({ message: 'Internal server error' });
    });
});

// <!-- Endpoint 7 : GET Endpoint Implementation -->
app.get('/getReviewsByTrailID', function (req, res) {
  //paramters testing like before
  const trail_id = req.query.trail_id;
  if (!trail_id) {
    return res.status(400).json({ message: 'Trail ID is required' });
  }
  //setup and run all the queries
  const query = `
    SELECT r.*
    FROM reviews r
    JOIN trails_to_reviews ttr ON r.review_id = ttr.review_id
    WHERE ttr.trail_id = $1
  `;

  db.any(query, [trail_id])
    .then(reviews => {
      res.status(200).json(reviews);
    })
    .catch(error => {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Internal server error' });
    });
});

// ************************************************
// <!-- Section 4 : Start Server-->
// ************************************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000, () => {
  console.log('listening on port 3000');
});
