const { model, Schema } = require('mongoose');

const characterSchema = new Schema({
    owner: String,
    name: String,
    charURL: String,
    gender: String,
    series: String,
    image: String
});

model('Characters', characterSchema, 'Characters');