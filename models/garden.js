/*******************************************/
/*****     Schema and Dependencies     *****/
/*******************************************/
const mongoose = require('../utils/connection');

const { Schema, model } = mongoose;

/*******************************************/
/*****        Schema Definition        *****/
/*******************************************/
const GardenSchema = new Schema({
    name: { type: String, required: true },
    desc: { type: String },
    icon: { type: String },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

/*******************************************/
/*****      Create Garden Model        *****/
/*******************************************/
const Garden = model('Garden', GardenSchema);

/*******************************************/
/*****      Export Garden Model        *****/
/*******************************************/
module.exports = Garden;
