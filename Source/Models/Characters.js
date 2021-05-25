const { model, Schema } = require('mongoose');

const characterSchema = new Schema({
    owners: Array,
    name: String,
    charURL: String,
    id: Array,
    gender: String,
    series: String,
    image: String
});

model('Characters', characterSchema, 'Characters');