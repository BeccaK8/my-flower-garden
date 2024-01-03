/*******************************************/
/*****       Import Dependencies       *****/
/*******************************************/
// const express = require('express');
const Garden = require('../models/garden');

/*******************************************/
/*****          Helper Methods         *****/
/*******************************************/
// In the given garden document, find the section subdoc that contains the given containerId
function getContainerParentsFromGarden(garden, containerId) {
    let parents = {};
    sectionLoop: for (let i = 0; i < garden.sections.length; i++) {
        const section = garden.sections[i];
        for (let j = 0; j < section.containers.length; j++) {
            const container = section.containers[j];
            if (container.id === containerId) {
                parents.section = section;
                break sectionLoop;
            }
        }
    }
    return parents;
}

// In the given garden document, find the container subdoc that contains the given plantedFlowerId
function getPlantedFlowerParentsFromGarden(garden, plantedFlowerId) {
    let parents = {};
    sectionLoop: for (let i = 0; i < garden.sections.length; i++) {
        const section = garden.sections[i];
        if (section.containers) {
            for (let j = 0; j < section.containers.length; j++) {
                const container = section.containers[j];
                if (container.plantedFlowers) {
                    for (let k = 0; k < container.plantedFlowers.length; k++) {
                        const plantedFlower = container.plantedFlowers[k];
                        if (plantedFlower.id === plantedFlowerId) {
                            parents.container = container;
                            parents.section = section;
                            break sectionLoop;
                        }
                    }
                }
            }
        }
    }
    return parents;
}

/*******************************************/
/*****   Export Middleware Function    *****/
/*******************************************/
module.exports = {
    getContainerParentsFromGarden,
    getPlantedFlowerParentsFromGarden
};