const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports = async(bot, member) => {
    const ProfileModel = mongoose.model('Profiles');
    
    if(member.bot) { return }
    else {
        const User = await ProfileModel.findOne({ id: member.id });

        if(!User) {
            ProfileModel.create({
                id: member.id,
                username: member.user.username,
                image: {
                    guild: member.user.id,
                    image: member.user.avatarURL()
                }
            })
            return console.log(chalk.bold.green(`NEW USER ID REGISTERED`))
        }
        else {
            await ProfileModel.updateOne({ 'owners.guild': member.guild.id, id: member.id }, { $push: { 'images.$.image': member.user.avatarURL() }});
            return console.log(chalk.bold.green(`The User ${member.id} was registed in the guild ${member.guild.id}`))
        }
    }
};