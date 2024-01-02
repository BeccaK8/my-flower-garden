/*******************************************/
/*****       Import Dependencies       *****/
/*******************************************/
const express = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

/*******************************************/
/*****          Create Router          *****/
/*******************************************/
const router = express.Router();

/*******************************************/
/*****      Routes + Controllers       *****/
/*******************************************/
// GET -> signup -> /users/signup
router.get('/signup', (req, res) => {
    const { username, loggedIn, userId } = req.session;
    res.render('users/signup', { username, loggedIn, userId });
});

// POST -> signup -> /users/signup
// Must be async as we need to encrypt password using bcryptjs
router.post('/signup', async (req, res) => {

    // Get new user info from req.body
    const newUser = req.body;

    // Encrypt the Password
    newUser.password = await bcrypt.hash(
        newUser.password,
        await bcrypt.genSalt(10)
    );

    // Create the User
    User.create(newUser)
        .then(user => {
            // Redirect to Login
            res.send(newUser);
        })
        .catch(err => {
            // Display Error if one occurs
            console.log(err);
            res.redirect(`/error?error=${err}`);
        });
});

// GET -> login -> /users/login
router.get('/login', (req, res) => {
    const { username, loggedIn, userId } = req.session;
    res.render('users/login', { username, loggedIn, userId });
});

// POST -> login -> /users/login
router.post('/login', (req, res) => {

    // Get login info from req.body
    const { username, password } = req.body;

    // Find user with that username (reminder, username is unique)
    User.findOne({ username })
        .then(async (user) => {
            // Make sure a user was found
            if (user) {
                // If found, check password is a match
                const result = await bcrypt.compare(password, user.password);
                if (result) {
                    // If match, log them in, create session and redirect to home page
                    req.session.username = username;
                    req.session.loggedIn = true;
                    req.session.userId = user.id;
    
                    res.redirect('/');
                } else {
                    // wrong password -> show error page
                    throw new Error('Please Check your Credentials as They Do Not Match your Account.');
                }
            } else {
                // no user found -> show error page
                throw new Error('Please Check your Credentials as They Do Not Match your Account.');
            }
        })
        .catch(err => {
            // If not found, show error page
            // Display Error if one occurs
            console.log(err);
            res.redirect(`/error?error=${err}`);
        });
});

// GET -> logout -> /users/logout
router.get('/logout', (req, res) => {
    const { username, loggedIn, userId } = req.session;
    res.render('users/logout', { username, loggedIn, userId });
});

// DELETE -> logout -> /users/logout
router.delete('/logout', (req, res) => {
    // Destroy user session
    req.session.destroy(() => {
        res.redirect('/');
    });
});

/*******************************************/
/*****          Export Router          *****/
/*******************************************/
module.exports = router;
