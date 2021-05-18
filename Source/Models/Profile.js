const { model, Schema } = require('mongoose');

const profileSchema = new Schema({
    id: String,
    username: String,
    image: String
});

model('Profiles', profileSchema, 'Profiles');