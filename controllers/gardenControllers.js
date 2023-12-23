/*******************************************/
/*****       Import Dependencies       *****/
/*******************************************/
const express = require('express');
const Garden = require('../models/garden');

/*******************************************/
/*****          Create Router          *****/
/*******************************************/
const router = express.Router();

/*******************************************/
/*****      Routes + Controllers       *****/
/*******************************************/
// GET -> / -> /gardens
router.get('/', (req, res) => {
    const { username, loggedIn, userId } = req.session;
    
    // Query database to find all gardens belonging to the logged in user
    Garden.find({ owner: userId }).sort( { name: 1})
        .then(userGardens => {
            // Display them on screen
            res.render('gardens/index', { gardens: userGardens, username, loggedIn, userId });
        })
        .catch(err => {
            // Handle any errors
            console.log(err);
            res.redirect(`/error?error=${err}`);
        });
});

// GET -> /new -> /gardens/new
router.get('/new', (req, res) => {
    const { username, loggedIn, userId } = req.session;
    res.render('gardens/new', { username, loggedIn, userId });
});

// POST -> / -> /gardens -- Create
router.post('/', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    // Get the new garden from req.body
    const newGarden = req.body;

    // Validate attributes match model
    newGarden.owner = userId;

    // Create garden
    Garden.create(newGarden)
        .then(createdGarden => {
            // Redirect to My Gardens
            res.redirect('/gardens');
        })
        .catch(err => {
            // Handle any errors
            console.log(err);
            res.redirect(`/error?error=${err}`);
        });
});

// GET -> /gardens/delete/:id
router.get('/delete/:id', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    const gardenId = req.params.id;

    // Find garden using req.params.id
    Garden.findById(gardenId)
        .then(garden => {
            // Render delete confirmation screen 
            res.render('gardens/delete', { garden, username, loggedIn, userId });
        })
        .catch(err => {
            // Handle any errors
            console.log(err);
            res.redirect(`/error?error=${err}`);
        });
});

// DELETE -> /gardens/:id
// Only available to authorized users
router.delete('/:id', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    // Target specific garden
    const gardenId = req.params.id;

    // Find it in the database
    Garden.findById(gardenId)
        .then(foundGarden => {
            // Determine if logged in user is authorized to delete it (that is, are they the owner of the garden)
            if (foundGarden.owner = userId) {
                // If authorized, delete it
                return foundGarden.deleteOne();
            } else {
                // If not authorized, redirect to error page
                res.redirect(`/error?error=You%20Not%20Authorized%20to%20Delete%20this%20Garden`);
            }
        })
        .then(deletedGarden => {
            // Redirect to My Gardens
            res.redirect('/gardens')
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
