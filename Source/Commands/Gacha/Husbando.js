const { used } = require('../../Events/Message/cooldown.js');
const { MessageEmbed } = require('discord.js');
const Duration = require('humanize-duration');
const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const Husbando = await CharacterModel.aggregate([{ $match: { Owner: 'null', Gender: 'Male' }}, { $sample: { size: 1 }}]);
    
    if(!Husbando[0]) { return }
    if(!args.length) {
        const embed = new MessageEmbed()
            .setTitle(Husbando[0].Name)
            .setColor('2f3136')
            .setURL(Husbando[0].Url)
            .setDescription(`**Series**: ${Husbando[0].Series.Title}`) 
            .setImage(Husbando[0].Image)
            .setFooter(`React with any emoji to claim ${Husbando[0].Name}`)
        message.channel.send(embed).then(message => {
            const ReactionFilter = user => user.id === user.id;
            const ReactionCollector = message.createReactionCollector(ReactionFilter, { max: 1, time: 30000});

            ReactionCollector.on('collect', async(reaction, user) => {
                const cooldown = used.get(user.id);
                
                if(cooldown) {
                    const remaining = Duration(cooldown - Date.now());
                    message.channel.send(`<@!${user.id}>, You need to wait ${remaining} before claiming another character!`)
                    ReactionCollector.empty(); reaction.users.remove(user);
                }
                else {
                    const Claim = await CharacterModel.updateOne({ Owner: 'null', Id: Husbando[0].Id }, { $set: { Owner: user.id }});
                    
                    if(Claim.n === 1) {
                        message.edit(embed.setFooter(`Claimed by ${user.username}`, user.avatarURL()))
                        console.log(chalk.green(`The character ${chalk.bold(Husbando[0].Name)} was claimed by ${chalk.bold(user.username)}`));
                        
                    } else {
                        return message.channel.send(`There was a problem with claiming **${Husbando[0].Name}**`)
                    }
                    ReactionCollector.stop(); reaction.users.remove(user);
                    used.set(user.id, Date.now() + 5000);
                }
                setTimeout(() => used.delete(user.id), 5000);
            });
            ReactionCollector.on('end', (collected, reason) => {
                if(reason === 'time') {
                    console.log(chalk.red(`The Character ${chalk.bold(Husbando[0].Name)} was not claimed`))
                    message.edit(embed.setFooter(`${Husbando[0].Name} is now unclaimable`))
                }
            });
        });
    }
};

module.exports.help = {
    name: "husbando",
    aliases: ["h"],
    description: "Roll and claim for a husbando!",
    category: "Gacha",
};