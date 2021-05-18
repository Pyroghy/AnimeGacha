const { used } = require('../../Events/Message/cooldown.js');
const { MessageEmbed } = require('discord.js');
const Duration = require('humanize-duration');
const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports.run = async(bot, message, args) => {
    const Character = mongoose.model('Characters');
    const Roll = await Character.aggregate([{ $match: { owner: 'null' }}, { $sample: { size: 1 }}]);

    if(Roll[0] === undefined) { 
        return message.channel.send('There are currently no claimable characters!')
    }
    if(!args.length) {
        const embed = new MessageEmbed()
            .setTitle(Roll[0].name)
            .setColor("2f3136")
            .setURL(Roll[0].charURL)
            .setDescription(`**Series**: ${Roll[0].series}`) 
            .setImage(Roll[0].image)
            .setFooter(`React with any emoji to claim ${Roll[0].name}`)
        message.channel.send(embed).then(message => {
            const filter = user => user.id === user.id;
            const collector = message.createReactionCollector(filter, { max: 1, time: 30000});

            collector.on('collect', async(reaction, user) => {
                const cooldown = used.has(user.id);
                    
                if(cooldown) {
                    const remaining = Duration(cooldown - Date.now(), { units: ['ms'], round: true});
                    message.channel.send(`<@!${user.id}>, You need to wait ${remaining} before claiming another character!`)
                    collector.empty(); reaction.users.remove(user);
                }
                else {
                    const Claim = await Character.updateOne({ name: Roll[0].name }, { $set: { owner: user.id }});

                    if(Claim.n === 1) {
                        message.edit(embed.setFooter(`Claimed by ${user.username}`, user.avatarURL()))
                        console.log(chalk.green(`The character ${chalk.bold(Roll[0].name)} was claimed by ${chalk.bold(user.username)}`));
                    } else {
                        message.channel.send(`There was a problem with claiming **${Roll[0].name}**`)
                    }
                    collector.stop(); reaction.users.remove(user);
                    used.add(user.id);
                }
                setTimeout(() => { used.delete(user.id)}, 5000);
            });
            collector.on('end', (collected, reason) => {
                if(reason === 'time') {
                    console.log(chalk.red(`The Character ${chalk.bold(Roll[0].name)} was not claimed`))
                    message.edit(embed.setFooter(`${Roll[0].name} is now unclaimable`))
                }
            });
        });
    }
};

module.exports.help = {
    name: "roll",
    aliases: ["r"],
    description: "Roll and claim for a character!",
    category: "Gacha",
};