const { MessageEmbed } = require('discord.js');

module.exports.run = (bot, message, args) => {
    if(!args.length) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`${bot.user.username} Commands List`)
            .addFields(
                { name: `**__Gacha__**`, value: '**Husbando** - `Roll for a husbando`\n**Roll** - `Roll for a husbando or a waifu`\n**Waifu** - `Roll for a waifu`', inline: false },
                { name: `**__Inventory__**`, value: '**Gift** - `Gift someone a character`\n**Trade** - `Trade with someone`\n**List** - `List all of your characters`\n**Unclaim** - `Unclaim one of your characters`', inline: false },
                { name: `**__Profile__**`, value: '**Profile** - `View yours or someone elses profile`\n**Set** - `Set stuff to your profile`', inline: false },
                { name: `**__Search__**`, value: '**Search** - `Search for characters or series`', inline: false },
                { name: `**__Misc__**`, value: '**Help** - `Get help`', inline: false },
            )
            .setFooter('Bot Created by Pyroghy#0008', 'https://cdn.discordapp.com/avatars/382960339018579969/a_499517deeda3f59df9bf0e95418ea95f.gif?size=128')
        return message.channel.send(embed)
    }
};

module.exports.help = {
    name: "help"
};