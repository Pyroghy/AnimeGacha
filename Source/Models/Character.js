const { model, Schema } = require('mongoose');

const characterSchema = new Schema({
    Owner: String,
    Name: String,
    Url: String,
    Id: String,
    Gender: String,
    Series: Object,
    Image: String,
    Stats: Object
});

model('Characters', characterSchema, 'Characters');