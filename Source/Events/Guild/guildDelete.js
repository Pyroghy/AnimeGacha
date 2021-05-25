const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports = async(bot, guild) => {
    const CharacterModel = mongoose.model('Characters');
    
    await CharacterModel.updateMany({ owners: { $elemMatch: { guild: guild.id }}}, { $pull: { owners: { 'guild': guild.id }}});
    return console.log(chalk.bold.red(`The Guild ID ${guild.id} was Deleted`))
};