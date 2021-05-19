const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const Name = args.join(' ');
    const Character = await CharacterModel.findOne({ $text: { $search: Name }}).collation({ locale: 'en', strength: 2 }).sort({ score: { $meta: "textScore" }})

    if(!Character || Name.toLowerCase() !== Character.name.toLowerCase()) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`🔍 There is no character named \`${Name}\`!`)
        return message.channel.send(embed)
    }
    else {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(Character.name)
            .setURL(Character.charURL)
            .setDescription(`**Series**: ${Character.series}\n**Gender**: ${Character.gender}`)
            .setThumbnail(Character.image)
        if(Character.owner === 'null') {
            embed.setFooter(`Is not claimed by anyone`)
        } else {
            const owner = bot.users.cache.find(owner => owner.id === Character.owner)
            embed.setFooter(`Owned By: ${owner.username}`, owner.avatarURL())
        }
        return message.channel.send(embed)
    }
};

module.exports.help = {
    name: "charactersearch",
    aliases: ["cs"],
    description: "Search for a character.",
    category: "Search",
};