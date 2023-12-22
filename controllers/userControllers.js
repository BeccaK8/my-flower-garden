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
    const { username, loggedIn, userId } = req.session;

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
        }
    );
});


/*******************************************/
/*****          Export Router          *****/
/*******************************************/
module.exports = router;
