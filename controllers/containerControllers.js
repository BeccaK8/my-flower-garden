/*******************************************/
/*****       Import Dependencies       *****/
/*******************************************/
const express = require('express');
const Garden = require('../models/garden');
const MyFlower = require('../models/myFlower');
const ControllerHelper = require('../utils/controllerHelper');

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

// GET /containers/:id/edit
// Get edit form for container
router.get('/containers/:id/edit', (req, res) => {
    const { username, loggedIn, userId } = req.session;
    
    const containerId = req.params.id;
    
    // Find garden using container Id
    Garden.findOne( {'sections.containers._id' : containerId})
        .then(foundGarden => {
            // Get section and container
            const foundSection = ControllerHelper.getContainerParentsFromGarden(foundGarden, containerId).section;
            const foundContainer = foundSection.containers.id(containerId);

            // Render delete confirmation screen 
            res.render('containers/edit', { garden: foundGarden, section: foundSection, container: foundContainer, username, loggedIn, userId });
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
            const foundSection = ControllerHelper.getContainerParentsFromGarden(foundGarden, containerId).section;
            const foundContainer = foundSection.containers.id(containerId);

            // Render delete confirmation screen 
            res.render('containers/delete', { garden: foundGarden, section: foundSection, container: foundContainer, username, loggedIn, userId });
        })
        .catch(err => {
            // Handle any errors
            console.log(err);
            res.redirect(`/error?error=${err}`);
        });
});

// DELETE -> /containers/:id
// Delete container
// Only available to authorized users
router.delete('/containers/:id', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    // Target specific container
    const containerId = req.params.id;

    // Find the garden with that container Id in the database
    Garden.findOne( {'sections.containers._id' : containerId})
        .then(foundGarden => {
            // If we couldn't find the garden, just redirect to the My Gardens index page
            if (!foundGarden) return res.redirect('/gardens');

            // Determine if logged in user is authorized to update it (that is, are they the owner of the garden)
            if (foundGarden.owner == userId) {
                // If authorized, remove the container subdoc from the correct section sub doc 
                foundGarden.sections.forEach(section => section.containers.remove(containerId));
                
                // Save the garden
                return foundGarden.save();
            } else {
                // If not authorized, redirect to error page
                throw new Error('You are Not Authorized to Update this Garden.');
            }
        })
        .then(returnedGarden => {
            // Redirect to My Gardens
            res.redirect(`/gardens/${returnedGarden.id}`);
        })
});

// PUT /containers/:id
// Update container and redirect to show section page
router.put('/containers/:id', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    // Target specific container
    const containerId = req.params.id;
    let sectionId;

    // Find the garden with that container Id in the database
    Garden.findOne( {'sections.containers._id' : containerId})
        .then(foundGarden => {
            // Determine if logged in user is authorized to update it (that is, are they the owner of the garden)
            if (foundGarden.owner == userId) {
                // If authorized, find the section subdoc
                const section = ControllerHelper.getContainerParentsFromGarden(foundGarden, containerId).section;
                const containerSubdoc = section.containers.id(containerId);
                sectionId = section.id;

                // Update the attributes on the subdoc
                containerSubdoc.name = req.body.name;
                containerSubdoc.location = req.body.location;
                containerSubdoc.qty = req.body.qty;
                containerSubdoc.linerQty = req.body.linerQty;

                // Save the subdoc
                return foundGarden.save();
            } else {
                // If not authorized, redirect to error page
                throw new Error('You are Not Authorized to Update this Container.');
            }
        })
        .then(returnedGarden => {
            // Redirect to Section
            res.redirect(`/sections/${sectionId}`);

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

// GET /containers/:id
// Render the container show page
router.get('/containers/:id', (req, res) => {
    const { username, loggedIn, userId } = req.session;
    
    const containerId = req.params.id;
    let garden;
    let section;
    let container;
    
    // Find garden using container Id
    Garden.findOne( { 'sections.containers._id' : containerId })
        .populate( { path: 'sections.containers.plantedFlowers.flower' } )
        .then(foundGarden => {
            // Get section
            garden = foundGarden;
            section = ControllerHelper.getContainerParentsFromGarden(foundGarden, containerId).section;
            container = section.containers.id(containerId);

            // Get Logged In User's favorite flowers
            return MyFlower.find( { 'owner' : userId }).populate().sort({ myFlowerName: 1 });
        })
        .then(foundFavorites => {
            // Render container show screen 
            res.render('containers/show', { 
                garden, 
                section, 
                container, 
                myFavoriteFlowers: foundFavorites, 
                comparePlantedFlowers: ControllerHelper.comparePlantedFlowers,
                username, loggedIn, userId
            });
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
