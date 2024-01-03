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

    // Find the garden in the database
    Garden.findOne( { 'sections.containers._id' : containerId })
        .then(foundGarden => {
            // Determine if logged in user is authorized to add planted flower (that is, are they the owner of the garden)
            if (foundGarden.owner == userId) {
                // Get the section and container
                const section = ControllerHelper.getContainerSectionFromGarden(foundGarden, containerId);
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

/*******************************************/
/*****          Export Router          *****/
/*******************************************/
module.exports = router;
