const mongoose = require('mongoose');
const chalk = require('chalk');
require('dotenv').config();

module.exports = (bot, ready) => {
    mongoose.connect(process.env.MONGO, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        require('../../../Source/Models/Characters.js');
        require('../../../Source/Models/Profile.js');
        console.log(chalk.green('Database Status: Online'));
        console.log(`Logged in as ${bot.user.username}`)
        bot.user.setPresence({
            status: 'online',
            activity: {
                name: 'With Boobies',
                type: 'PLAYING'
            }
        })
    });
};