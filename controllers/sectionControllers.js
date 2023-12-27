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

// GET -> /sections/:id/edit
// Edit section form
router.get('/sections/:id/edit', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    // Target specific section
    const sectionId = req.params.id;

    // Find the garden with that section Id in the database
    Garden.findOne( {'sections._id' : sectionId})
        .then(foundGarden => {
            // Get section
            const section = foundGarden.sections.id(sectionId);
            // Render edit page
            res.render('sections/edit', { section, gardenId: foundGarden.id, username, loggedIn, userId });
        })
        .catch(err => {
            // Handle any errors
            console.log(err);
            res.redirect(`/error?error=${err}`);
        });
});

// GET -> /sections/delete/:id
// Show delete section form
router.get('/sections/:id/delete', (req, res) => {
    const { username, loggedIn, userId } = req.session;
    
    const sectionId = req.params.id;
    
    // Find garden using section Id
    Garden.findOne( {'sections._id' : sectionId})
        .then(foundGarden => {
            // Get section
            const section = foundGarden.sections.id(sectionId);

            // Render delete confirmation screen 
            res.render('sections/delete', { garden: foundGarden, section, username, loggedIn, userId });
        })
        .catch(err => {
            // Handle any errors
            console.log(err);
            res.redirect(`/error?error=${err}`);
        });
});


// PUT -> /sections/:id
// Update section
router.put('/sections/:id', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    // Target specific section
    const sectionId = req.params.id;
    let gardenId; 

    // Find the garden with that section Id in the database
    Garden.findOne( {'sections._id' : sectionId})
        .then(foundGarden => {
            // Determine if logged in user is authorized to update it (that is, are they the owner of the garden)
            if (foundGarden.owner == userId) {
                // If authorized, find the section subdoc
                const sectionSubdoc = foundGarden.sections.id(sectionId);
                gardenId = foundGarden.id;
                // Update the name on the subdoc
                sectionSubdoc.name = req.body.name;
                // Save the subdoc
                return foundGarden.save();
            } else {
                // If not authorized, redirect to error page
                throw new Error('You are not authorized to update this garden.');
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

// DELETE -> /sections/:id
// Delete section
// Only available to authorized users
router.delete('/sections/:id', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    // Target specific section
    const sectionId = req.params.id;

    // Find the garden with that section Id in the database
    Garden.findOne( {'sections._id' : sectionId})
        .then(foundGarden => {
            // If we couldn't find the garden, just redirect to the My Gardens index page
            if (!foundGarden) return res.redirect('/gardens');

            // Determine if logged in user is authorized to update it (that is, are they the owner of the garden)
            if (foundGarden.owner == userId) {
                // If authorized, remove the section subdoc
                foundGarden.sections.remove(sectionId);
                
                // Save the garden
                return foundGarden.save();
            } else {
                // If not authorized, redirect to error page
                throw new Error('You are not authorized to update this garden.');
            }
        })
        .then(returnedGarden => {
            // Redirect to My Gardens
            res.redirect(`/gardens/${returnedGarden.id}`);
        })
});

// GET -> /sections/:id
// Show section details
router.get('/sections/:id', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    // Target specific section
    const sectionId = req.params.id;

    // Find the garden with that section Id in the database
    Garden.findOne( {'sections._id' : sectionId})
        .then(foundGarden => {
            // Get section
            const section = foundGarden.sections.id(sectionId);
            // Render edit page
            res.render('sections/show', { section, garden: foundGarden, username, loggedIn, userId });
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
