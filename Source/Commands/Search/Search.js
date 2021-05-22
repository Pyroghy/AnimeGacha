const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const MemberID = message.member.id;
    const Query = args.slice(1).join(' ');
    const Type = args.slice(0, 1).join(' ');

    if(!Type) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`🔍 You must specify what type you are looking for!`)
        return message.channel.send(embed)
    }
    if(Type === 'character' || Type === 'char' || Type === 'c') {
        if(!Query) {
             const embed = new MessageEmbed()
                .setColor('2f3136')
                .setTitle(`🔍 You must specify a character to look up!`)
             return message.channel.send(embed)
        }
        else {
            const CharacterResults = await CharacterModel.aggregate([{ $search: { 'index': 'Search', 'text': { query: Query, path: 'name' }}}]).collation({ locale: 'en', strength: 2 }).sort({ score: { $meta: "textScore" }})
            const CharacterList = CharacterResults.map((Character, index) => `**${index + 1}**) **${Character.name}** - \`${Character.series}\``)
        
            if(!CharacterResults[0]) {
                const embed = new MessageEmbed()
                    .setColor('2f3136')
                    .setTitle(`🔍 There is no character named \`${Query}\`!`)
                return message.channel.send(embed)
            }
            else {
                const embed = new MessageEmbed()
                    .setColor('2f3136')
                    .setTitle('Character Search')
                    .setDescription(CharacterList.slice(0, 20))
                    .setFooter('Type the number of the character you want to see')
                message.channel.send(embed).then(async(BotMessage) => {
                    const filter = message => message.member.id;
                    const collector = message.channel.createMessageCollector(filter, { time: 120000});
        
                    collector.on('collect', message => {
                        const Num = message.content;

                        if(message.member.id === MemberID) {
                            if(CharacterResults[Num - 1]) {
                                const embed = new MessageEmbed()
                                    .setColor('2f3136')
                                    .setTitle(CharacterResults[Num - 1].name)
                                    .setURL(CharacterResults[Num - 1].charURL)
                                    .setDescription(`**Series**: ${CharacterResults[Num - 1].series}\n**Gender**: ${CharacterResults[Num - 1].gender}`)
                                    .setThumbnail(CharacterResults[Num - 1].image)
                                if(CharacterResults[Num - 1].owner === 'null') {
                                    embed.setFooter(`Is not claimed by anyone`)
                                } else {
                                    const owner = bot.users.cache.find(owner => owner.id === CharacterResults[Num - 1].owner)
                                    embed.setFooter(`Owned By ${owner.username}`, owner.avatarURL())
                                }
                                message.delete(); collector.stop();
                                return BotMessage.edit(embed);
                            }
                        }
                    });
                });
            }
        }
    }
    if(Type === 'series' || Type === 's') {
        if(!Query) {
            const embed = new MessageEmbed()
                .setColor('2f3136')
                .setTitle(`🔍 You must specify a series to look up!`)
            return message.channel.send(embed)
        }
        else {
            const SeriesName = await CharacterModel.aggregate([{ $search: { 'index': 'Search', 'text': { query: Query, path: 'series' }}}]).collation({ locale: 'en', strength: 2 }).sort({ score: { $meta: "textScore" }});
        
            if(!SeriesName[0]) {
                const embed = new MessageEmbed()
                    .setColor('2f3136')
                    .setTitle(`🔍 There is no series called \`${Query}\`!`)
                return message.channel.send(embed)
            }
            
            const SeriesChar = await CharacterModel.find({ series: SeriesName[0].series }).collation({ locale: 'en', strength: 2 }).sort({ name: 1 });
            const CharPerPage = 20;
            const CharacterList = SeriesChar.map((Character) => `**${Character.name}** - [<@${Character.owner}>]`)
            let page = 0;
            const embed = new MessageEmbed()
                .setColor('2f3136')
                .setTitle(SeriesName[0].series)
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
                        .setTitle(SeriesName[0].series)
                        .setDescription(CharacterList.slice(page * CharPerPage, (page + 1) * CharPerPage).join('\n'))
                        .setFooter(`Page ${page + 1}/${Math.ceil(CharacterList.length/CharPerPage)} [${CharacterList.length} Characters]`)
                    return message.edit(newEmbed);
                })
            })
        }
    }
};

module.exports.help = {
    name: "search",
    aliases: ["s"],
    description: "Search for a character or series.",
    category: "Search",
};