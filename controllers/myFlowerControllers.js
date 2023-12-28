/*******************************************/
/*****       Import Dependencies       *****/
/*******************************************/
const express = require('express');
const axios = require('axios');
const https = require('https');
const plantSearchUrl = process.env.PERENUAL_SEARCH_API_URL;
const plantDetailsBaseUrl = process.env.PERENUAL_PLANT_DETAILS_BASE_URL;
const plantDetailsUrlSuffix = process.env.PERENUAL_PLANT_DETAILS_URL_SUFFIX;
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

/*******************************************/
/*****          Export Router          *****/
/*******************************************/
module.exports = router;
