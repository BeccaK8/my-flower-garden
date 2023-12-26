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
// Index of my gardens
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


// POST -> / -> /gardens -- Create
// Create garden
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

// GET -> /new -> /gardens/new
// New garden form
router.get('/new', (req, res) => {
    const { username, loggedIn, userId } = req.session;
    res.render('gardens/new', { username, loggedIn, userId });
});

// GET -> /gardens/delete/:id
// Show delete garden form
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


// GET -> /gardens/:id/edit
// Edit garden form
router.get('/:id/edit', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    // Target specific garden
    const gardenId = req.params.id;

    // Find it in the database
    Garden.findById(gardenId)
        .then(foundGarden => {
            // Render edit page
            res.render('gardens/edit', { garden: foundGarden, username, loggedIn, userId });
        })
        .catch(err => {
            // Handle any errors
            console.log(err);
            res.redirect(`/error?error=${err}`);
        });
});

// PUT -> /gardens/:id
// Update garden
router.put('/:id', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    // Target specific garden
    const gardenId = req.params.id;
    const updatedGarden = req.body

    // reassign owner using session info, just in case someone hacked the update
    delete updatedGarden.owner;
    updatedGarden.owner = userId;

    //console.log('updated garden: \n ', updatedGarden);
    // Find it in the database
    Garden.findById(gardenId)
        .then(foundGarden => {

            //console.log('foundGarden: \n ', foundGarden);
            // Determine if logged in user is authorized to update it (that is, are they the owner of the garden)
            if (foundGarden.owner == userId) {
                // If authorized, update it
                //console.log('same owner - good to update');
                return foundGarden.updateOne(updatedGarden);
            } else {
                //console.log('not authorized - redirect');
                // If not authorized, redirect to error page
                res.redirect('/error?error=You%20are%20Not%20Authorized%20to%20Update%20this%20Garden');
            }
        })
        .then(returnedGarden => {
            //console.log('returnedGarden: \n ', returnedGarden);
            // Redirect to My Gardens
            res.redirect(`/gardens/${gardenId}`);

        })
        .catch(err => {
            // Handle any errors
            console.log(err);
            res.redirect(`/error?error=${err}`);
        });
    
});

// DELETE -> /gardens/:id
// Delete garden
// Only available to authorized users
router.delete('/:id', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    // Target specific garden
    const gardenId = req.params.id;

    // Find it in the database
    Garden.findById(gardenId)
        .then(foundGarden => {
            // Determine if logged in user is authorized to delete it (that is, are they the owner of the garden)
            if (foundGarden.owner == userId) {
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


// GET -> /gardens/:id
// Show garden details
router.get('/:id', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    // Target specific garden
    const gardenId = req.params.id;

    // Find it in the database
    Garden.findById(gardenId)
        .then(foundGarden => {
            // Render show page
            res.render('gardens/show', { garden: foundGarden, username, loggedIn, userId });
        })
        .catch(err => {
            // Handle any errors
            console.log(err);
            res.redirect(`/error?error=${err}`);
        });
})

/*******************************************/
/*****          Export Router          *****/
/*******************************************/
module.exports = router;
