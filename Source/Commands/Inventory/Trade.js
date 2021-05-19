const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const member = message.member;
    const wewber = message.mentions.members.first();
    const MemberGive = args.slice(1).join(' ').toLowerCase().split(', ');
    const MCharacterGive = await CharacterModel.find({ owner: member.id, name: MemberGive }).collation({ locale: 'en', strength: 2 }).sort({ name: 1 });
    const exists = await CharacterModel.find({ name: MemberGive }).collation({ locale: 'en', strength: 2 });

    if(!wewber) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`You need to specify the member that you want to trade with!`)
        return message.channel.send(embed)
    }
    if(wewber.user.bot) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`You cannot gift characrers to bots!`)
        return message.channel.send(embed)
    }
    if(!exists) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`🔍 You specified an invalid character!`)
        return message.channel.send(embed)
    }
    if(!MCharacterGive) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`🔍 You specified a character that you dont own!`)
        return message.channel.send(embed)
    }
    else {
        const MCharacterList = MCharacterGive.map((Character) => `**${Character.name}**`)
        const MemberOffer = MCharacterList.join(', ').replace(/, ([^,]*)$/, ' and $1');
        message.channel.send(`Hey ${wewber}, **${member.user.username}** wants to trade with you!`).then(message => {
            const filter = message => message.member.id === member.id || wewber.id;
            const collector = message.channel.createMessageCollector(filter, { time: 120000 });
            
            collector.on('collect', async(message) => {
                if(message.member.id === wewber.id) {
                    const argz = message.content.slice(1).trim().split(' ');
                    if(message.content.startsWith('-t')) {
                        const WewberGive = argz.slice(1).join(' ').toLowerCase().split(', ');
                        const WCharacterGive = await CharacterModel.find({ owner: wewber.id, name: WewberGive }).collation({ locale: 'en', strength: 2 }).sort({ name: 1 });
                        const exists = await CharacterModel.find({ owner: wewber.id, name: WewberGive }).collation({ locale: 'en', strength: 2 });

                        if(!exists) {
                            const embed = new MessageEmbed()
                                .setColor('2f3136')
                                .setTitle(`🔍 You specified an invalid character!`)
                            return message.channel.send(embed)
                        }
                        if(!WCharacterGive) {
                            const embed = new MessageEmbed()
                                .setColor('2f3136')
                                .setTitle(`🔍 You specified a character that you dont own!`)
                            return message.channel.send(embed)
                        }
                        else {
                            const WCharacterList = WCharacterGive.map((Character) => `**${Character.name}**`)
                            const WewberOffer = WCharacterList.join(', ').replace(/, ([^,]*)$/, ' and $1');
                            const embed = new MessageEmbed()
                                .setColor('2f3136')
                                .setTitle('Trade Offer')
                                .addFields(
                                    { name: `**${member.user.username}'s Offerings**`, value: `${MemberOffer}_ _`, inline: false },
                                    { name: `**${wewber.user.username}'s Offerings**`, value: `${WewberOffer}_ _`, inline: false },
                                )
                                .setFooter('React with ✅ to seal the deal!')
                            message.channel.send(embed).then(message => {
                                const filter = (reaction, user) => reaction.emoji.name === '✅' && user.id === member.id && wewber.id;
                                const collector = message.createReactionCollector(filter, { max: 2, time: 120000}); message.react('✅')
                                collector.on('collect', (reaction, user) => { 
                                    collector.stop()
                                });
                                collector.on('end', (collected, reason) => {
                                    message.reactions.removeAll();
                                    if(reason === 'time') {
                                        console.log(chalk.bold.red(`The trade was closed`))
                                        return message.channel.send('**The trade was closed**')
                                    }
                                    else {
                                        MCharacterGive.forEach(async(Char) => await CharacterModel.updateMany({ owner: member.id, name: Char.name }, { $set: { owner: wewber.id }}))
                                        WCharacterGive.forEach(async(Char) => await CharacterModel.updateMany({ owner: wewber.id, name: Char.name }, { $set: { owner: member.id }}))

                                        console.log(chalk.green(`${chalk.bold(member.user.username)} traded ${chalk.bold(MemberOffer).replaceAll('**', '')} to ${chalk.bold(wewber.user.username)}`))
                                        console.log(chalk.green(`${chalk.bold(wewber.user.username)} traded ${chalk.bold(WewberOffer).replaceAll('**', '')} to ${chalk.bold(member.user.username)}`))
                                        return message.edit(embed.setFooter(`Trade Completed!`))
                                    }
                                });
                            })
                        }
                    }
                }
                if(message.content.startsWith('-c')) {
                    collector.stop()
                }
            });
            collector.on('end', collected => {
                console.log(chalk.bold.red(`The trade was closed`))
                return message.channel.send('**The trade was closed**')
            });
        })
    }
};

module.exports.help = {
    name: "trade",
    aliases: ["t"],
    description: "Trade a character.",
    category: "Inventory",
};