const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const SeriesName = args.join(' ');

    if(!SeriesName) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`🔍 You must specify a series to look up!`)
        return message.channel.send(embed)
    }
    else {
        const SeriesSearch = await CharacterModel.aggregate([{ $search: { 'index': 'Search', 'text': { query: SeriesName, path: 'series' }}}]).collation({ locale: 'en', strength: 2 }).sort({ score: { $meta: "textScore" }});
        
        if(!SeriesSearch[0]) {
            const embed = new MessageEmbed()
                .setColor('2f3136')
                .setTitle(`🔍 There is no series called \`${SeriesName}\`!`)
            return message.channel.send(embed)
        }

        const SeriesChar = await CharacterModel.find({ series: SeriesSearch[0].series }).collation({ locale: 'en', strength: 2 }).sort({ name: 1 });
        const CharPerPage = 20;
        const Guild = SeriesChar[0].owners.find(go => go.guild === message.guild.id);
        const Index = SeriesChar[0].owners.indexOf(Guild);

        const CharacterList = SeriesChar.map((Character) => `**${Character.name}** - [${bot.users.cache.find(owner => owner.id === SeriesChar[0].owners[Index].owner)}]`)
        
        let page = 0;
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(SeriesSearch[0].series)
            .setDescription(CharacterList.slice((page) * CharPerPage, CharPerPage).join('\n'))
            .setFooter(`Page ${page + 1}/${Math.ceil(CharacterList.length/CharPerPage)} [${CharacterList.length} Characters]`)
        message.channel.send(embed).then(async(message) => {
            if(CharacterList.length > CharPerPage) {
                await message.react('⬅'); await message.react('➡');
            }
            
            const filter = (reaction, user) => user.id === user.id && (reaction.emoji.name === '⬅' || reaction.emoji.name === '➡');
            const collector = message.createReactionCollector(filter);
                    
            collector.on('collect', async(reaction, user) => {
                if(reaction.emoji.name === '⬅') { page -= 1; reaction.users.remove(user) }
                if(reaction.emoji.name === '➡') { page += 1; reaction.users.remove(user) }
                if(page < 0) { page = Math.floor(CharacterList.length/CharPerPage) }
                if(page > Math.floor(CharacterList.length/CharPerPage)) { page = 0 }
                    
                const newEmbed = new MessageEmbed()
                    .setColor('2f3136')
                    .setTitle(SeriesSearch[0].series)
                    .setDescription(CharacterList.slice(page * CharPerPage, (page + 1) * CharPerPage).join('\n'))
                    .setFooter(`Page ${page + 1}/${Math.ceil(CharacterList.length/CharPerPage)} [${CharacterList.length} Characters]`)
                return message.edit(newEmbed);
            })
        })
    }
};

module.exports.help = {
    name: "seriessearch",
    aliases: ["ss"],
    description: "Search for a series.",
    category: "Search",
};