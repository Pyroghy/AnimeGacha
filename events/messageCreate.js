const mongoose = require('mongoose');

module.exports = async(bot, message) => {
    const profileModel = mongoose.model('Profiles');
    const user = await profileModel.findOne({ Id: message.member.id });
    const prefix = process.env.PREFIX;
    const args = message.content.slice(prefix.length).trim().split(' ');
    const commandName = args.shift().toLowerCase();
    const command = bot.commands.get(commandName) || bot.commands.get(bot.aliases.get(commandName));

    if(!message.content.startsWith(prefix) || message.author.bot) { return }
    if(message.channel.type === 'dm') { return }
    if(!user) {
        profileModel.create({
            id: message.member.id,
            guilds: [
                { 
                    guild: message.guild.id, 
                    character: "None set",
                    color: "2f3136",
                    image:message.member.user.avatarURL()
                }
            ], 
            badges: [] 
        })
    }
	if(command) { command.run(bot, message, args) }
};