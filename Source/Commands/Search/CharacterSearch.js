const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const CharacterName = args.join(' ');

    if(!CharacterName) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`🔍 You must specify a character to look up!`)
        return message.channel.send(embed)
    }

    const CharacterSearch = await CharacterModel.aggregate([{ $search: { 'index': 'Search', 'text': { query: CharacterName, path: 'Name' }}}]).collation({ locale: 'en', strength: 2 }).sort({ score: { $meta: "textScore" }})

    if(!CharacterSearch[0]) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`🔍 There is no character named \`${CharacterName}\`!`)
        return message.channel.send(embed)
    }
    
    const CharacterMatch = await CharacterModel.aggregate([{ $match: { Name: CharacterSearch[0].Name }}]);

    if(CharacterMatch[0]) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(CharacterMatch[0].Name)
            .setURL(CharacterMatch[0].Url)
            .setDescription(`**Series**: ${CharacterMatch[0].Series.Title}\n**Gender**: ${CharacterMatch[0].Gender}`)
            .setThumbnail(CharacterMatch[0].Image)
        if(CharacterMatch[0].Owner === 'null') {
            embed.setFooter(`Is not claimed by anyone`)
        } else {
            const owner = bot.users.cache.find(owner => owner.id === CharacterMatch[0].Owner)
            embed.setFooter(`Owned By ${owner.username}`, owner.avatarURL())
        }
        return message.channel.send(embed);
    }
};

module.exports.help = {
    name: "charactersearch",
    aliases: ["cs", "sc"],
    description: "Search for a character",
    category: "Search",
};