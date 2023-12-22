/*******************************************/
/*****     Schema and Dependencies     *****/
/*******************************************/
const mongoose = require('../utils/connection');

const { Schema, model } = mongoose;

/*******************************************/
/*****        Schema Definition        *****/
/*******************************************/
const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

/*******************************************/
/*****       Create User Model         *****/
/*******************************************/
const User = model('User', UserSchema);

/*******************************************/
/*****       Export User Model         *****/
/*******************************************/
module.exports = User;
