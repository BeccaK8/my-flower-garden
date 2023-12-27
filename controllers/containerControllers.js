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

// GET /sections/:id/containers
// Get new container form
router.get('/sections/:id/containers', (req, res) => { 
    const { username, loggedIn, userId } = req.session;

    // Target specific section
    const sectionId = req.params.id;

    // Find the garden with that section Id in the database
    Garden.findOne( {'sections._id' : sectionId})
        .then(foundGarden => {
            // Get section
            const section = foundGarden.sections.id(sectionId);
            // Render edit page
            res.render('containers/new', { section, garden: foundGarden, username, loggedIn, userId });
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
