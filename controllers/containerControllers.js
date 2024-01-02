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

// GET /containers/:id/delete
// Show Delete Container confirmation form
router.get('/containers/:id/delete', (req, res) => {
    const { username, loggedIn, userId } = req.session;
    
    const containerId = req.params.id;
    
    // Find garden using container Id
    Garden.findOne( {'sections.containers._id' : containerId})
        .then(foundGarden => {
            // Get section
            let foundContainer;
            let foundSection;
            findContainer: for (let i = 0; i < foundGarden.sections.length; i++) {
                const section = foundGarden.sections[i];
                for (let j = 0; j < section.containers.length; j++) {
                    const container = section.containers[j];
                    if (container.id === containerId) {
                        foundContainer = container;
                        foundSection = section;
                        break findContainer;
                    }
                }
            }
            // Render delete confirmation screen 
            res.render('containers/delete', { garden: foundGarden, section: foundSection, container: foundContainer, username, loggedIn, userId });
        })
        .catch(err => {
            // Handle any errors
            console.log(err);
            res.redirect(`/error?error=${err}`);
        });
});

// POST /sections/:id/containers
// Create new container and redirect to show section paage
router.post('/sections/:id/containers', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    // Target specific section
    const sectionId = req.params.id;

    // Find the garden with that section Id in the database
    Garden.findOne( {'sections._id' : sectionId})
        .then(foundGarden => {
            // Determine if logged in user is authorized to add section (that is, are they the owner of the garden)
            if (foundGarden.owner == userId) {
                // Get section
                const section = foundGarden.sections.id(sectionId);
                // Push the new container (in req.body) onto the section.containers array
                section.containers.push(req.body);
                // Save the garden
                return foundGarden.save();
            } else {
                throw new Error('You are Not Authorized to Update this Section.');
            }
        })
        .then(updatedGarden => {
            // Redirect to section show page
            res.redirect(`/sections/${sectionId}`);
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
