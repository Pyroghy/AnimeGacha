const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports = async(bot, message) => {
    const profileModel = mongoose.model('Profiles');
    const member = message.mentions.members.first() || message.member;
    const user = await profileModel.findOne({ id: message.member.id });
    const prefix = process.env.PREFIX;
    const args = message.content.slice(prefix.length).trim().split(' ');
    const commandName = args.shift().toLowerCase();
    const command = bot.commands.get(commandName) || bot.commands.get(bot.aliases.get(commandName));

    if(!message.content.startsWith(prefix) || message.author.bot) { return }
    if(message.channel.type === 'dm') { return }
    if(!user) {
        await profileModel.create({ 
            id: member.id, 
            guilds: [
                { 
                    guild: message.guild.id, 
                    character: "None set",
                    color: "2f3136",
                    image: member.user.avatarURL() 
                }
            ], 
            badges: [] 
        }).then(console.log(`${chalk.bold(message.member.id)} now has a profile`))
    }
    else {
        const findGuild = await profileModel.findOne({ id: member.id, 'guilds.guild': message.guild.id })

        if(!findGuild) {
            await profileModel.updateOne({ id: member.id },
            { 
                $push: { 
                    guilds: [
                        { 
                            guild: message.guild.id, 
                            character: "None set",
                            color: "2f3136",
                            image: member.user.avatarURL() 
                        }
                    ]
                } 
            }).then(console.log(chalk.green(`[${chalk.white.bold(message.guild.id)}] ${chalk.bold(findGuild.id)} is now registered`)))
        }
    }
	if(command) { 
        command.run(bot, message, args)
    }
};
