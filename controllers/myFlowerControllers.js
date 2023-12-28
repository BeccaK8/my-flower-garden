/*******************************************/
/*****       Import Dependencies       *****/
/*******************************************/
const express = require('express');
const axios = require('axios');
const https = require('https');
const plantSearchUrl = process.env.PERENUAL_SEARCH_API_URL;
const MyFlower = require('../models/myFlower');

/*******************************************/
/*****          Create Router          *****/
/*******************************************/
const router = express.Router();

/*******************************************/
/*****      Routes + Controllers       *****/
/*******************************************/

// All routes start with /myFlowers

// GET /myFlowers/search
// Get flower search form
router.get('/search', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    // Display the flower search page
    res.render('myFlowers/search', { username, loggedIn, userId });
});

// GET /myFlowers/results
// Get flower search results
router.get('/results', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    // Build the search URL for the API
    let apiSearchUrl = plantSearchUrl;
    const keywordSearch = req.query.keyword;
    if (keywordSearch && keywordSearch.length > 0) {
        apiSearchUrl = apiSearchUrl.concat('&q=', keywordSearch);
    }

    const httpsAgent = new https.Agent({
        rejectUnauthorized: false
    });

    // Call the API
    axios.get(apiSearchUrl, { httpsAgent })
        .then(apiRes => {
            // If we get data, render in an index page
            console.log('this came back from the api: \n', apiRes.data.data);

            res.render('myFlowers/results', { plants: apiRes.data.data, username, loggedIn, userId });
        })
        .catch(err => {
            // Handle any errors
            console.log(err);
            res.redirect(`/error?error=${err}`);
        });
});

// POST /myFlowers
// Save flower as favorite
router.post('/', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    // Get the favorite flower from req.body
    const newFavorite = req.body;

    // Validate attributes match model
    newFavorite.owner = userId;
    if (newFavorite.myFlowerName.length === 0) newFavorite.myFlowerName = newFavorite.commonName;

    //Create my flower
    MyFlower.create(newFavorite)
        .then(createdFavority => {
            // Redirect to My Favorite Flowers
            res.redirect('/myFlowers');
        })
        .catch(err => {
            // Handle any errors
            console.log(err);
            res.redirect(`/error?error=${err}`);
        });
});

// GET /myFlowers
// Get index of my favorite flowers
router.get('/', (req, res) => {
    const { username, loggedIn, userId } = req.session;
    
    // Query database to find all favorite flowers belonging to the logged in user
    MyFlower.find({ owner: userId }).sort( { myFlowerName: 1 })
        .then(userFavorites => {
            // Display them on screen
            res.render('myFlowers/index', { plants: userFavorites, username, loggedIn, userId });
        })
        .catch(err => {
            // Handle any errors
            console.log(err);
            res.redirect(`/error?error=${err}`);
        });
});

/*******************************************/
/*****          Export Router          *****/
/*******************************************/
module.exports = router;
