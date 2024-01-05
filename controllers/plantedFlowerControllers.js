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

// POST /containers/:id/plantedFlowers
// Create new planted flower
router.post('/containers/:id/plantedFlowers', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    // Target specific container
    const containerId = req.params.id;

    // Make sure they picked a flower to add to the container (and didn't just leave the instructions option)
    if (req.body.flower) {
        // They selected a flower so we can proceed with adding new flower
        
        // Find the garden in the database
        Garden.findOne( { 'sections.containers._id' : containerId })
            .then(foundGarden => {
                // Determine if logged in user is authorized to add planted flower (that is, are they the owner of the garden)
                if (foundGarden.owner == userId) {
                    // Get the section and container
                    const section = ControllerHelper.getContainerParentsFromGarden(foundGarden, containerId).section;
                    const container = section.containers.id(containerId);
                    
                    // Push the new plantedflower (in req.body) onto the container.plantedFlowers array
                    container.plantedFlowers.push(req.body);
                    
                    // Save the garden
                    return foundGarden.save();
                    
                } else {
                    throw new Error('You are Not Authorized to Update this Garden.');
                }
            })
            .then(updatedGarden => {
                // Redirect to container show page
                res.redirect(`/containers/${containerId}`);
            })
            .catch(err => {
                // Handle any errors
                console.log(err);
                res.redirect(`/error?error=${err}`);
            });
    } else {
        // If they forgot to pick a flower, 
        // Redirect to container show page
        res.redirect(`/containers/${containerId}`);
    }
    
});

// PUT /plantedFlowers/:id
// Update planted flowers and redirect to container show page
router.put('/plantedFlowers/:id', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    // Target specific planted flower
    const plantedFlowerId = req.params.id;
    let containerId;

    // Find the garden in the database
    Garden.findOne( { 'sections.containers.plantedFlowers._id' : plantedFlowerId })
        .then(foundGarden => {
            // Determine if logged in user is authorized to update planted flower (that is, are they the owner of the garden)
            if (foundGarden.owner == userId) {
                // Get the section and container
                const parents = ControllerHelper.getPlantedFlowerParentsFromGarden(foundGarden, plantedFlowerId);
                const section = parents.section;
                const container = parents.container;
                containerId = container.id;
                const plantedFlowerSubdoc = container.plantedFlowers.id(plantedFlowerId);

                // Update the plantedflower with the new values from req.body
                plantedFlowerSubdoc.flower = req.body.flower;
                plantedFlowerSubdoc.qty = req.body.qty;
                plantedFlowerSubdoc.packaging = req.body.packaging;
                plantedFlowerSubdoc.otherPackaging = req.body.otherPackaging;
                
                // Save the garden
                return foundGarden.save();

            } else {
                throw new Error('You are Not Authorized to Update this Garden.');
            }
        })
        .then(updatedGarden => {
            // Redirect to container show page
            res.redirect(`/containers/${containerId}`);
        })
        .catch(err => {
            // Handle any errors
            console.log(err);
            res.redirect(`/error?error=${err}`);
        });
});

// GET /plantedFlowers/:id/delete
// Render the delete Planted Flower form
router.get('/plantedFlowers/:id/delete', (req, res) => {
    const { username, loggedIn, userId } = req.session;
    
    const plantedFlowerId = req.params.id;
    
    // Find garden using container Id
    Garden.findOne( { 'sections.containers.plantedFlowers._id' : plantedFlowerId })
        .populate( { path: 'sections.containers.plantedFlowers.flower' } )
        .then(foundGarden => {
            // Get section
            const parents = ControllerHelper.getPlantedFlowerParentsFromGarden(foundGarden, plantedFlowerId);
            const plantedFlower = parents.container.plantedFlowers.id(plantedFlowerId);

            // Render delete confirmation screen 
            res.render('plantedFlowers/delete', { 
                garden: foundGarden, 
                section: parents.section, 
                container: parents.container, 
                plantedFlower,
                username, loggedIn, userId });
        })
        .catch(err => {
            // Handle any errors
            console.log(err);
            res.redirect(`/error?error=${err}`);
        });
});

// DELETE /plantedFlowers/:id
// Delete planted flower from container and redirect to container show page
// Only available to authorized users
router.delete('/plantedFlowers/:id', (req, res) => {
    const { username, loggedIn, userId } = req.session;

    // Target specific planted flower
    const plantedFlowerId = req.params.id;
    let containerId;

    // Find the garden with that container Id in the database
    Garden.findOne( { 'sections.containers.plantedFlowers._id' : plantedFlowerId })
        .then(foundGarden => {
            // If we couldn't find the garden, just redirect to the My Gardens index page
            if (!foundGarden) return res.redirect('/gardens');

            // Determine if logged in user is authorized to update it (that is, are they the owner of the garden)
            if (foundGarden.owner == userId) {
                // If authorized, remove the container subdoc from the correct section sub doc
                const container = ControllerHelper.getPlantedFlowerParentsFromGarden(foundGarden, plantedFlowerId).container; 
                containerId = container.id;
                container.plantedFlowers.forEach(pf => container.plantedFlowers.remove(plantedFlowerId));
                
                // Save the garden
                return foundGarden.save();
            } else {
                // If not authorized, redirect to error page
                throw new Error('You are Not Authorized to Update this Garden.');
            }
        })
        .then(returnedGarden => {
            // Redirect to Container Show Page
            res.redirect(`/containers/${containerId}`);
        })
});

/*******************************************/
/*****          Export Router          *****/
/*******************************************/
module.exports = router;
