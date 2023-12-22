/*******************************************/
/*****       Import Dependencies       *****/
/*******************************************/
require('dotenv').config();
const mongoose = require('mongoose');

/*******************************************/
/*****       Database Connection       *****/
/*******************************************/
const DATABASE_URL = process.env.DATABASE_URL;

// DB Config object
const CONFIG = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

// Establish Database Connection
mongoose.connect(DATABASE_URL, CONFIG);

// Setup Mongoose Event Handlers
mongoose.connection
    .on('open', () => console.log('Connected to Mongoose'))
    .on('close', () => console.log('Disconnected from Mongoose'))
    .on('error', (err) => console.log('An error occurred: \n', err));

/*******************************************/
/*****        Export Connection        *****/
/*******************************************/
module.exports = mongoose;
