const mongoose = require('mongoose');

module.exports = async(bot, message) => {
    if(message.author.bot) { return }

    const ProfileModel = mongoose.model('Profiles');
    const User = await ProfileModel.findOne({ Id: message.member.id });
    const prefix = process.env.PREFIX;
    const args = message.content.slice(prefix.length).trim().split(' ');
    const commandName = args.shift().toLowerCase();
    const command = bot.commands.get(commandName) || bot.commands.get(bot.aliases.get(commandName));
 
    if(!User) {
        ProfileModel.create({
            Id: message.member.id,
            Username: message.member.user.username,
            Image: message.member.user.avatarURL()
        })
    }
    if(message.channel.type === 'dm') { return }
    if(!message.content.startsWith(prefix) || message.author.bot) { return }
	if(command) { command.run(bot, message, args) }
};
