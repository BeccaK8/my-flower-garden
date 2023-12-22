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


/*******************************************/
/*****          Export Router          *****/
/*******************************************/
module.exports = router;
