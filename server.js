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
const UserRouter = require('./controllers/userControllers');
const GardenRouter = require('./controllers/gardenControllers');
const SectionRouter = require('./controllers/sectionControllers');
const ContainerRouter = require('./controllers/containerControllers');

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

// Register Routes
app.use('/users', UserRouter);
app.use('/gardens', GardenRouter);
app.use('/', SectionRouter);
app.use('/', ContainerRouter);

// error page
app.get('/error', (req, res) => {
    const error = req.query.error || 'Oops! Something went wrong. Please try again.';
    const { username, loggedIn, userId } = req.session;
    //res.send(error);
    res.render('error', { error, username, loggedIn, userId });
});

/*******************************************/
/*****         Server Listener         *****/
/*******************************************/
const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log('Your server is running...better go catch it');
});
