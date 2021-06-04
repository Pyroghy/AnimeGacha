const { model, Schema } = require('mongoose');

const seriesSchema = new Schema({
    id: String,
    series: String,
    image: String
});

model('Series', seriesSchema, 'Series');