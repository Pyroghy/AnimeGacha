const mongoose = require('mongoose');
require('dotenv').config();

module.exports = async(bot, message) => {
    const ProfileModel = mongoose.model('Profiles');
    const User = await ProfileModel.findOne({ id: message.member.id });
    const prefix = process.env.PREFIX;
    const args = message.content.slice(prefix.length).trim().split(' ');
    const commandName = args.shift().toLowerCase();
    const command = bot.commands.get(commandName) || bot.commands.get(bot.aliases.get(commandName));

    if(message.author.bot) { return } 
    if(!User) {
        ProfileModel.create({
            id: message.member.id,
            username: message.member.user.username,
            images: {
                guild: message.guild.id,
                image: message.member.user.avatarURL()
            }
        })
    }
    if(message.channel.type === 'dm') { return }
    if(!message.content.startsWith(prefix) || message.author.bot) { return }
	if(command) { command.run(bot, message, args) }
};