/*******************************************/
/*****       Import Dependencies       *****/
/*******************************************/
const express = require('express') //express framework
const morgan = require('morgan') //morgan logger for request info
const session = require('express-session')
const MongoStore = require('connect-mongo') // connect-mongo(for the session)
require('dotenv').config()
const methodOverride = require('method-override') // for forms and CRUD

/*******************************************/
/*****       Middleware Function       *****/
/*******************************************/
// Contain middleware actions to a single function
// which takes an entire app as an argument
// from there it runs requests through all of our middleware
const middleware = (app) => {
    // middleware runs before all routes
    // EVERY request is first processed through middleware
    // method-override - allows us to use forms to their full potential
    app.use(methodOverride('_method'));
    // this will allow us to get data from forms as req.body
    app.use(express.urlencoded({ extended: true }));
    // morgan logs our requests to the console
    app.use(morgan('tiny')); //tiny is a qualifier that says - be short
    // to serve stylesheets, we use static files in the public directory
    app.use(express.static('public'));
    // to utilize json we can add this:
    app.use(express.json());

    // Set up and utilize session function
    // which take a configuration object as argument with the following keys:
        // secret - super duper top secret code that creates an individual session from the app that calls this function
        // store - tells connect-mongo where to save the session(our db)
        // the two other options can be read about in the connect-mongo docs
    app.use(
        session({
            secret: process.env.SECRET,
            store: MongoStore.create({
                mongoUrl: process.env.DATABASE_URL
            }),
            saveUninitialized: true,
            resave: false
        })
    )
}

/*******************************************/
/*****   Export Middleware Function    *****/
/*******************************************/
module.exports = middleware