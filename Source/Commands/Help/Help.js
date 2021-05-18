const { MessageEmbed } = require('discord.js');

module.exports.run = (bot, message, args) => {
    if(!args.length) {
        const embed = new MessageEmbed()
            .setColor("2f3136")
            .setDescription('**Husbando** - `Roll for a husbando`\n**Roll** - `Roll for a husbando or a waifu`\n**Waifu ** - `Roll for a waifu`\n**Help** - `Get help`\n**Gift** - `Gift someone a character`\n**List** - `List all of your characters`\n**Trade** - `Trade with someone`\n**Unclaim** - `Unclaim one of your characters`\n**Profile** - `View yours or someone elses profile`\n**Set** - `Set stuff to your profile`\n**Search** - `Search for characters`')
        return message.channel.send(embed)
    }
};

module.exports.help = {
    name: "help"
};