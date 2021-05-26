const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const Name = args.join(' ');
    const MemberID = message.member.id;
    const Character = await CharacterModel.findOne({ owners: { $elemMatch: { guild: message.guild.id, owner: MemberID }}, name: Name }).collation({ locale: 'en', strength: 2 });
    const Exists = await CharacterModel.findOne({ name: Name }).collation({ locale: 'en', strength: 2 });

    if(!Name) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`You must specify the character you want to unclaim!`)
        return message.channel.send(embed)
    }
    if(!Exists) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`🔍 There is no character named \`${Name}\`!`)
        return message.channel.send(embed)
    }
    if(!Character) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`🔍 You dont own \`${Name}\`!`)
        return message.channel.send(embed)
    }
    else {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setAuthor(`Are you sure you want to unclaim ${Character.name}?`, Character.image, Character.charURL)
            .setFooter(`React with 🗑️ to unclaim | React with ❌ to cancel`)
        message.channel.send(embed).then(message => {
            message.react('🗑️'); message.react('❌');
            const filter = (reaction, user) => user.id === MemberID;
            const collector = message.createReactionCollector(filter, { max: 1, time: 15000 });
                
            collector.on('collect', async(reaction, user) => {
                if(user.id === MemberID) {
                    if(reaction.emoji.name === '🗑️') {
                        const Unclaim = await CharacterModel.updateOne({ owners: { guild: message.guild.id, owner: MemberID }, id: Character.id }, { $set: { 'owners.$.owner': 'null' }});

                        if(Unclaim.n === 1) {
                            message.edit(embed.setAuthor(`${Character.name} was unclaimed by ${user.username}`, Character.image, Character.charURL).setFooter(''))
                            console.log(chalk.red(`The character ${chalk.bold(Character.name)} was unclaimed by ${chalk.bold(user.username)}`));
                        } else {
                            message.channel.send(`There was a problem with unclaiming **${Character.name}**`)
                        }
                        collector.stop(); message.reactions.removeAll();
                    }
                    if(reaction.emoji.name === '❌') {
                        collector.stop(); message.delete();
                    }
                    if(reaction.emoji.name !== '❌' || reaction.emoji.name !== '🗑️') {
                        collector.empty(); reaction.users.remove(user);
                    }
                }
            });
            collector.on('end', (collected, reason) => {
                console.log(chalk.green(`The Character ${chalk.bold(Character.name)} was not unclaimed`))
                if(reason === 'time') { message.delete() }
            });
        });
    }
};

module.exports.help = {
    name: "unclaim",
    aliases: ["uc"],
    description: "Unclaim a character.",
    category: "Inventory",
};