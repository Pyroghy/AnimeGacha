const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports = bot => {
    mongoose.connect(process.env.MONGO, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        require('../utils/models/Character.js');
        require('../utils/models/Profile.js');

        console.log(chalk.green('Database Status: Online'));
        console.log(`Logged in as ${chalk.bold(bot.user.username)}`)
    });
};
