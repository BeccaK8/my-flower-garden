/*******************************************/
/*****     Schema and Dependencies     *****/
/*******************************************/
const mongoose = require('../utils/connection');

const { Schema, model } = mongoose;

/*******************************************/
/*****        Schema Definition        *****/
/*******************************************/
const ContainerSchema = new Schema({
    name: { type: String, required: true },
    location: { type: String },
    qty: { 
        type: Number, 
        required: true, 
        default: 1 
    },
    linerQty: { type: Number, default: 0 },
    active: {type: Boolean, default: true }
}, {
    timestamps: true
});

const SectionSchema =  new Schema({
    name: { type: String, required: true },
    containers: [ContainerSchema]
}, {
    timestamps: true
});

const GardenSchema = new Schema({
    name: { type: String, required: true },
    desc: { type: String },
    icon: { type: String },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sections: [SectionSchema]
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
