/*******************************************/
/*****       Import Dependencies       *****/
/*******************************************/
// const express = require('express');
const Garden = require('../models/garden');

/*******************************************/
/*****          Helper Methods         *****/
/*******************************************/
function getContainerSectionFromGarden(garden, containerId) {
    for (let i = 0; i < garden.sections.length; i++) {
        const section = garden.sections[i];
        for (let j = 0; j < section.containers.length; j++) {
            const container = section.containers[j];
            if (container.id === containerId) {
                return section;
            }
        }
    }
    return null;
}

/*******************************************/
/*****   Export Middleware Function    *****/
/*******************************************/
module.exports = {
    getContainerSectionFromGarden
};