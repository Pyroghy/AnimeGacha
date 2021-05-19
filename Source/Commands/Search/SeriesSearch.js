const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

module.exports.run = async(bot, message, args) => {
    const Model = mongoose.model('Characters');
    const Series = args.join(' ');
    const SeriesName = await Model.findOne({ $text: { $search: Series }}).collation({ locale: 'en', strength: 2 }).sort({ score: { $meta: "textScore" }});

    if(!SeriesName || Series.toLowerCase() !== SeriesName.series.toLowerCase()) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`🔍 There is no series called \`${Series}\`!`)
        return message.channel.send(embed)
    }

    const SeriesChar = await Model.find({ series: SeriesName.series }).collation({ locale: 'en', strength: 2 }).sort({ name: 1 });
    const CharPerPage = 20;
    const CharacterList = SeriesChar.map((Character) => `**${Character.name}** - [<@${Character.owner}>]`)

    if(CharacterList.length <= CharPerPage) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(SeriesName.series)
            .setDescription(CharacterList.join('\n'))
            .setFooter(`Page 1/1 [${CharacterList.length} Characters]`)
        return message.channel.send(embed)
    }
    else {
        let page = 0;
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(SeriesName.series)
            .setDescription(CharacterList.slice((page) * CharPerPage, CharPerPage).join('\n'))
            .setFooter(`Page ${page + 1}/${Math.ceil(CharacterList.length/CharPerPage)} [${CharacterList.length} Characters]`)
        const msg = await message.channel.send(embed);
        await msg.react('⬅'); await msg.react('➡');
        const filter = (reaction, user) => user.id === user.id && (reaction.emoji.name === '⬅' || reaction.emoji.name === '➡');
        const collector = msg.createReactionCollector(filter);
        
        collector.on('collect', async(reaction, user) => {
            if(reaction.emoji.name === '⬅') { 
                page -= 1
                reaction.users.remove(user);
            }
            else if(reaction.emoji.name === '➡') {
                page += 1
                reaction.users.remove(user);
            }
        
            if(page < 0) { page = Math.floor(CharacterList.length/CharPerPage) }
            else if(page > Math.floor(CharacterList.length/CharPerPage)) { page = 0 }
        
            const newEmbed = new MessageEmbed()
                .setColor('2f3136')
                .setTitle(SeriesName.series)
                .setDescription(CharacterList.slice(page * CharPerPage, (page + 1) * CharPerPage).join('\n'))
                .setFooter(`Page ${page + 1}/${Math.ceil(CharacterList.length/CharPerPage)} [${CharacterList.length} Characters]`)
            return msg.edit(newEmbed);
        })
    }
};

module.exports.help = {
    name: "seriessearch",
    aliases: ["ss"],
    description: "Search for a series.",
    category: "Search",
};