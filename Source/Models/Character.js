const { model, Schema } = require('mongoose');

const characterSchema = new Schema({
    owner: String,
    name: String,
    charURL: String,
    id: String,
    gender: String,
    series: String,
    image: String,
    stats: Object
});

model('Characters', characterSchema, 'Characters');