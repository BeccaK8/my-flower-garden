/*******************************************/
/*****       Import Dependencies       *****/
/*******************************************/
const express = require('express');
require('dotenv').config();
const path = require('path');
const middleware = require('./utils/middleware');

/*******************************************/
/*****          Import Routers         *****/
/*******************************************/

/*******************************************/
/***** Create app + set up view engine *****/
/*******************************************/
const app = express();

// view engine - ejs
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/*******************************************/
/*****           Middleware            *****/
/*******************************************/
middleware(app);

/*******************************************/
/*****              Routes             *****/
/*******************************************/
// basic home route
app.get('/', (req, res) => {
    const { username, loggedIn, userId } = req.session;
    //res.send('the app is connected');
    res.render('home', { username, loggedIn, userId });
});

/*******************************************/
/*****         Server Listener         *****/
/*******************************************/
const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log('Your server is running...better go catch it');
});
