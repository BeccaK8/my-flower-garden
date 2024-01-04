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

    // make sure someone logged in - otherwise redirect to search form
    if (loggedIn) {
        // Get the favorite flower from req.body
        const newFavorite = req.body;
    
        // Validate attributes match model
        newFavorite.owner = userId;
        if (newFavorite.myFlowerName.length === 0) newFavorite.myFlowerName = newFavorite.commonName;
    
        //Create my flower
        MyFlower.create(newFavorite)
            .then(createdFavorite => {
                // Redirect to My Favorite Flowers
                res.redirect('/myFlowers');
            })
            .catch(err => {
                // Handle any errors
                console.log(err);
                res.redirect(`/error?error=${err}`);
            });
    } else {
        res.redirect('/myFlowers/search')
    }
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

// GET /myFlowers/:id/delete
// Show delete confirmation page
router.get('/:id/delete', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    const myFlowerId = req.params.id;

    // Find my favorite flower using req.params.id
    MyFlower.findById(myFlowerId)
        .then(myFlower => {
            // Render delete confirmation screen 
            res.render('myFlowers/delete', { myFlower, username, loggedIn, userId });
        })
        .catch(err => {
            // Handle any errors
            console.log(err);
            res.redirect(`/error?error=${err}`);
        });
});

// DELETE -> /myFlowers/:id
// Delete favorite flower
// Only available to authorized users
router.delete('/:id', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    // Target specific favorite
    const myFlowerId = req.params.id;

    // Find it in the database
    MyFlower.findById(myFlowerId)
        .then(foundFavorite => {
            // Determine if logged in user is authorized to delete it (that is, are they the owner of the garden)
            if (foundFavorite.owner == userId) {
                // If authorized, delete it
                return foundFavorite.deleteOne();
            } else {
                // If not authorized, redirect to error page
                throw new Error('You Not Authorized to Delete this Favorite.');
            }
        })
        .then(deletedFavorite => {
            // Redirect to My Favorite Flowers
            res.redirect('/myFlowers')
        })
        .catch(err => {
            // Handle any errors
            console.log(err);
            res.redirect(`/error?error=${err}`);
        });
});

// GET /myFlowers/:id/edit
// Show edit myflower form page
router.get('/:id/edit', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    const myFlowerId = req.params.id;

    // Find my favorite flower using req.params.id
    MyFlower.findById(myFlowerId)
        .then(myFlower => {
            // Render delete confirmation screen 
            res.render('myFlowers/edit', { myFlower, username, loggedIn, userId });
        })
        .catch(err => {
            // Handle any errors
            console.log(err);
            res.redirect(`/error?error=${err}`);
        });
});

// PUT -> /myFlowers/:id
// Update favorite flower
// Only available to authorized users
router.put('/:id', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    // Target specific favorite
    const myFlowerId = req.params.id;

    // Find it in the database
    MyFlower.findById(myFlowerId)
        .then(foundFavorite => {
            // Determine if logged in user is authorized to delete it (that is, are they the owner of the garden)
            if (foundFavorite.owner == userId) {
                // If authorized, update fields and save favorite
                foundFavorite.myFlowerName = req.body.myFlowerName;

                return foundFavorite.save();
            } else {
                // If not authorized, redirect to error page
                throw new Error('You Not Authorized to Update this Favorite.');
            }
        })
        .then(updatedFavorite => {
            // Redirect to My Favorite Flowers
            res.redirect('/myFlowers')
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
