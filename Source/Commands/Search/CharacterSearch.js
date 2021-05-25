const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const MemberID = message.member.id;
    const CharacterName = args.join(' ');

    if(!CharacterName) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`🔍 You must specify a character to look up!`)
        return message.channel.send(embed)
    }

    const CharacterSearch = await CharacterModel.aggregate([{ $search: { 'index': 'default', 'text': { query: CharacterName, path: 'name' }}}]).collation({ locale: 'en', strength: 2 }).sort({ score: { $meta: "textScore" }})

    if(!CharacterSearch[0]) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`🔍 There is no character named \`${CharacterName}\`!`)
        return message.channel.send(embed)
    }
    
    const CharacterMatch = await CharacterModel.aggregate([{ $match: { owners: { $elemMatch: { guild: message.guild.id }}, name: CharacterSearch[0].name}}]);
    const CharacterList = CharacterMatch.map((Character, index) => `**${index + 1}**) **${Character.name}** - \`${Character.series}\``)
    const Guild = CharacterMatch[0].owners.find(go => go.guild === message.guild.id);
    const Index = CharacterMatch[0].owners.indexOf(Guild);

    if(CharacterList.length === 1) {
        if(CharacterMatch[0]) {
            const embed = new MessageEmbed()
                .setColor('2f3136')
                .setTitle(CharacterMatch[0].name)
                .setURL(CharacterMatch[0].charURL)
                .setDescription(`**Series**: ${CharacterMatch[0].series}\n**Gender**: ${CharacterMatch[0].gender}`)
                .setThumbnail(CharacterMatch[0].image)
            if(CharacterMatch[0].owners[Index].owner === 'null') {
                embed.setFooter(`Is not claimed by anyone`)
            } else {
                const owner = bot.users.cache.find(owner => owner.id === CharacterMatch[0].owners[Index].owner)
                embed.setFooter(`Owned By ${owner.username}`, owner.avatarURL())
            }
            return message.channel.send(embed);
        }
    }
    else {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`Multiple Characters Have The Name \`${CharacterMatch[0].name}\`!`)
            .setDescription(CharacterList.slice(0, 20))
            .setFooter('Type the number of the character you want to see')
        message.channel.send(embed).then(async(BotMessage) => {
            const filter = message => message.member.id;
            const collector = message.channel.createMessageCollector(filter, { time: 120000});

            collector.on('collect', message => {
                const Num = message.content;

                if(message.member.id === MemberID) {
                    if(CharacterMatch[Num - 1]) {
                        const embed = new MessageEmbed()
                            .setColor('2f3136')
                            .setTitle(CharacterMatch[Num - 1].name)
                            .setURL(CharacterMatch[Num - 1].charURL)
                            .setDescription(`**Series**: ${CharacterMatch[Num - 1].series}\n**Gender**: ${CharacterMatch[Num - 1].gender}`)
                            .setThumbnail(CharacterMatch[Num - 1].image)
                        if(CharacterMatch[Num - 1].owners[Index].owner === 'null') {
                            embed.setFooter(`Is not claimed by anyone`)
                        } else {
                            const owner = bot.users.cache.find(owner => owner.id === CharacterMatch[Num - 1].owners[Index].owner)
                            embed.setFooter(`Owned By ${owner.username}`, owner.avatarURL())
                        }
                        message.delete(); collector.stop();
                        return BotMessage.edit(embed);
                    }
                }
                if(message.content.startsWith('!')) {
                    collector.stop();
                }
            });
        });
    }
};

module.exports.help = {
    name: "charactersearch",
    aliases: ["cs", "sc"],
    description: "Search for a character",
    category: "Search",
};