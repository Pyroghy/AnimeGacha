const { model, Schema } = require('mongoose');

const profileSchema = new Schema({
    id: String,
    guilds: Array,
    badges: Array
});

model('Profiles', profileSchema, 'Profiles');