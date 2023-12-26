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

// All routes start with /

// POST -> / -> /gardens/:id/sections -- Create
// Create section within Garden
router.post('/gardens/:id/sections', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    // Target specific garden
    const gardenId = req.params.id;

    // Find the garden in the database
    Garden.findById(gardenId)
        .then(foundGarden => {
            // Determine if logged in user is authorized to add section (that is, are they the owner of the garden)
            if (foundGarden.owner == userId) {
                // Push the new section (in req.body) onto the garden.sections array
                foundGarden.sections.push(req.body);
                // Save the garden
                return foundGarden.save();
            } else {
                throw new Error('You are not authorized to update this garden.');
            }
        })
        .then(updatedGarden => {
            // Redirect to garden show page
            res.redirect(`/gardens/${gardenId}`);
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
