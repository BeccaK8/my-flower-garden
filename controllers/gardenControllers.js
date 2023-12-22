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
    res.render('gardens/index', { username, loggedIn, userId });
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

/*******************************************/
/*****          Export Router          *****/
/*******************************************/
module.exports = router;
