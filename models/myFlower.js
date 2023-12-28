/*******************************************/
/*****     Schema and Dependencies     *****/
/*******************************************/
const mongoose = require('../utils/connection');

const { Schema, model } = mongoose;

/*******************************************/
/*****        Schema Definition        *****/
/*******************************************/
const MyFlowerSchema = new Schema({
    myFlowerName: { type: String, required: true },
    externalApiId: { type: Number },
    commonName: { type: String },
    scientificName: { type: String },
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
const MyFlower = model('MyFlower', MyFlowerSchema);

/*******************************************/
/*****      Export Garden Model        *****/
/*******************************************/
module.exports = MyFlower;
