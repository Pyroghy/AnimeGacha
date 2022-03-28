const { Claimed } = require('../../utils/rollCooldown.js');
const { MessageEmbed } = require('discord.js');
const duration = require('humanize-duration');
const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports = {
    config: {
        name: "husbando",
        aliases: ["h"],
        description: "Roll and claim for a husbando!",
        category: "Gacha",
    },
    run: async (bot, message, args) => {
        const characterModel = mongoose.model('Characters');
        const profileModel = mongoose.model('Profiles');
        const husbando = await characterModel.aggregate([{ $match: { [`owners.${message.guild.id}`]: null, gender: 'Male' } }, { $sample: { size: 1 } }]);

        if (husbando[0] === undefined) return message.channel.send('There are no male claimable characters')

        if (!args.length) {
            const embed = new MessageEmbed()
                .setTitle(husbando[0].name)
                .setColor('04A2FF')
                .setDescription(`**Series**: ${husbando[0].series.title}`)
                .setImage(husbando[0].image)
                .setFooter({ text: `React with any emoji to claim ${husbando[0].name}` });
            message.channel.send({ embeds: [embed] }).then(message => {
                const reactionCollector = message.createReactionCollector({ max: 1, time: 30000 });

                reactionCollector.on('collect', async (reaction, user) => {
                    const cooldown = Claimed.get(user.id);
                    const userProfile = await profileModel.findOne({ id: user.id });

                    if (cooldown) {
                        const remaining = duration(cooldown - Date.now());
                        message.channel.send(`<@!${user.id}>, You need to wait ${remaining} before claiming another character!`)
                        reactionCollector.empty(); reaction.users.remove(user);
                    }
                    else {
                        const claim = await characterModel.updateOne({ [`owners.${message.guild.id}`]: null, id: husbando[0].id }, { $set: { [`owners.${message.guild.id}`]: user.id } });

                        if (claim.n === 1) {
                            message.edit({ embeds: [embed.setFooter({ text: `Claimed by ${user.username}`, iconURL: userProfile.guilds[message.guild.id].image })] })
                            console.log(chalk.green(`[${chalk.white.bold(message.guild.id)}] ${chalk.bold(user.id)} claimed ${chalk.hex('04A2FF').bold(husbando[0].name)}`));

                        } else {
                            return message.channel.send(`There was a problem with claiming **${husbando[0].name}**`)
                        }
                        reactionCollector.stop(); reaction.users.remove(user);
                        Claimed.set(user.id, Date.now() + 5000);
                    }
                    setTimeout(() => Claimed.delete(user.id), 5000);
                });
                reactionCollector.on('end', (collected, reason) => {
                    if (reason === 'time') {
                        message.edit({ embeds: [embed.setFooter({ text: `${husbando[0].name} is now unclaimable` })] });
                        console.log(chalk.red(`[${chalk.white.bold(message.guild.id)}] ${chalk.hex('04A2FF').bold(husbando[0].name)} was not claimed`));
                    }
                });
            });
        }
    }
};