const { model, Schema } = require('mongoose');

const characterSchema = new Schema({
    owners: Array,
    name: String,
    id: String,
    gender: String,
    series: Object,
    image: String
});

model('Characters', characterSchema, 'Characters');