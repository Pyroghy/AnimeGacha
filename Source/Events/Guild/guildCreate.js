const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports = async(bot, guild) => {
    const CharacterModel = mongoose.model('Characters');
    
    await CharacterModel.updateMany({}, { $push: { owners: { 'guild': guild.id, 'owner': 'null' }}});
    return console.log(chalk.bold.green(`New Guild ID Registered: ${guild.id}`))
};