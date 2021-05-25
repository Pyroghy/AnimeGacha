const { model, Schema } = require('mongoose');

const profileSchema = new Schema({
    id: String,
    username: String,
    character: String,
    images: Array
});

model('Profiles', profileSchema, 'Profiles');