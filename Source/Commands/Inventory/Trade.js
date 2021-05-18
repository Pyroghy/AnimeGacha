const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const member = message.member;
    const wewber = message.mentions.members.first();
    const MemberGive = args.slice(1).join(' ').toLowerCase().split(', ');
    const MCharacterGive = await CharacterModel.find({ name: MemberGive }).collation({ locale: 'en', strength: 2 }).sort({ name: 1 });
    const CharacterList = MCharacterGive.map((Character) => `**${Character.name}**`)
    const MemberOffer = CharacterList.slice(0, -1).join(', ') + ' and ' + CharacterList.slice(-1);
    const embed = new MessageEmbed()
        .setColor("2f3136")
        .setDescription(MemberOffer)
    message.channel.send(`Hey ${wewber}, **${member.user.username}** wants to trade with you!`, embed).then(message => {
        const filter = message => message.member.id === member.id || wewber.id;
        const collector = message.channel.createMessageCollector(filter, { time: 120000 });
        
        collector.on('collect', async(message) => {
            if(message.member.id === wewber.id) {
                const argz = message.content.slice(1).trim().split(' ');
                if(message.content.startsWith('-t')) {
                    const WewberGive = argz.slice(1).join(' ').toLowerCase().split(', ');
                    const WCharacterGive = await CharacterModel.find({ name: WewberGive }).collation({ locale: 'en', strength: 2 }).sort({ name: 1 });
                    const CharacterList = WCharacterGive.map((Character) => `**${Character.name}**`)
                    const WemberOffer = CharacterList.slice(0, -1).join(', ') + ' and ' + CharacterList.slice(-1);
                    const embed = new MessageEmbed()
                        .setColor("2f3136")
                        .addFields(
                            { name: `${member.user.username}'s Offerings`, value: MemberOffer, inline: false },
                            { name: `${wewber.user.username}'s Offerings`, value: WemberOffer, inline: false },
                        )
                        .setFooter('React with ✅ to seal the deal!')
                    message.channel.send(embed).then(message => {
                        const filter = (reaction, user) => reaction.emoji.name === '✅' && user.id === member.id && wewber.id;
                        const collector = message.createReactionCollector(filter, { max: 2, time: 120000}); message.react('✅')
                        collector.on('collect', (reaction, user) => { 
                            collector.stop()
                        });
                        collector.on('end', (collected, reason) => {
                            if(reason === 'time') {
                                return message.channel.send('The trade was cancelled')
                            }
                            else {
                                MCharacterGive.forEach(async(Char) => await CharacterModel.updateMany({ owner: member.id, name: Char.name }, { $set: { owner: wewber.id }}))
                                WCharacterGive.forEach(async(Char) => await CharacterModel.updateMany({ owner: wewber.id, name: Char.name }, { $set: { owner: member.id }}))
                                return message.channel.send('**Trade Completed!**')
                            }
                        });
                    })
                }
            }
            if(message.content.startsWith('-c')) {
                collector.stop()
            }
        });
        collector.on('end', collected => {
            return message.channel.send(`**${message.member.user.username}** closed the trade`)
        });
    })
};

module.exports.help = {
    name: "trade",
    aliases: ["t"],
    description: "Trade a character.",
    category: "Inventory",
};