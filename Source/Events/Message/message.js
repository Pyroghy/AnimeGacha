const mongoose = require('mongoose');
require('dotenv').config();

module.exports = async(bot, message) => {
    const Profile = mongoose.model('Profiles');
    const User = await Profile.findOne({ id: message.member.id });
    const prefix = process.env.PREFIX;
    const args = message.content.slice(prefix.length).trim().split(' ');
    const commandName = args.shift().toLowerCase();
    const command = bot.commands.get(commandName) || bot.commands.get(bot.aliases.get(commandName));

    if(message.channel.type === 'dm') { return }
    if(!message.content.startsWith(prefix) || message.author.bot) { return }
    if(!User) {
        Profile.create({
            id: message.member.id,
            username: message.member.user.username,
            image: message.member.user.avatarURL()
        })
    }
	if(command) { command.run(bot, message, args) }
};