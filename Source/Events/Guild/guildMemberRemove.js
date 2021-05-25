const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports = async(bot, member) => {
    const ProfileModel = mongoose.model('Profiles');
    
    if(member.bot) { return }
    else {
        await ProfileModel.updateOne({ 'owners.guild': member.guild.id, id: member.id }, { $pull: { images: { 'guild': member.guild.id }}});
        return console.log(chalk.bold.green(`The User ${member.id} was deleted from the guild ${member.guild.id}`))
    }
};