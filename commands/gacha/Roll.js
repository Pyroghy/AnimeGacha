const { Claimed } = require('../../utils/rollCooldown.js');
const { MessageEmbed } = require('discord.js');
const duration = require('humanize-duration');
const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports = {
    config: {
        name: "roll",
        aliases: ["r"],
        description: "Roll and claim for a character!",
        category: "Gacha",
    },
    run: async(bot, message, args) => {
        const characterModel = mongoose.model('Characters');
        const profileModel = mongoose.model('Profiles');
        const character = await characterModel.aggregate([{ $match: { owners: { guild: message.guild.id, owner: 'null' }}}, { $sample: { size: 1 }}]);

        if(character[0] === undefined) { return message.channel.send('There are no claimable characters for this guild')}

        if(!args.length) {
            let color;

            switch(character[0].gender) {
                case "Female": 
                    color = 'EC49A7';
                    break;
                case 'Male':
                    color = '04A2FF';
                    break;
                default:
                    color = '8371CF';
                    break;
            }

            const embed = new MessageEmbed()
                .setTitle(character[0].name)
                .setColor(color)
                .setDescription(`**Series**: ${character[0].series.title}`) 
                .setImage(character[0].image)
                .setFooter({ text: `React with any emoji to claim ${character[0].name}` });
            message.channel.send({ embeds: [embed] }).then(message => {
                const reactionCollector = message.createReactionCollector({ max: 1, time: 30000});

                reactionCollector.on('collect', async(reaction, user) => {
                    const cooldown = Claimed.get(user.id);
                    const userProfile = await profileModel.findOne({ id: user.id });
                    const guildIndex = userProfile.guilds.indexOf(userProfile.guilds.find(user => user.guild === message.guild.id));

                    if(cooldown) {
                        const remaining = duration(cooldown - Date.now());
                        message.channel.send(`<@!${user.id}>, You need to wait ${remaining} before claiming another character!`)
                        reactionCollector.empty(); reaction.users.remove(user);
                    }
                    else {
                        const claim = await characterModel.updateOne({ 'owners.guild': message.guild.id, 'owners.owner': 'null', id: character[0].id }, { $set: { 'owners.$.owner': user.id }});

                        if(claim.n === 1) {
                            message.edit({ embeds: [embed.setFooter({ text: `Claimed by ${user.username}`, iconURL: userProfile.guilds[guildIndex].image })] })
                            console.log(chalk.green(`[${chalk.white.bold(message.guild.id)}] ${chalk.bold(user.id)} claimed ${chalk.hex(color).bold(character[0].name)}`));
                        } else {
                            return message.channel.send(`There was a problem with claiming **${character[0].name}** in guild ${chalk.bold(message.guild.id)}`);
                        }
                        reactionCollector.stop(); reaction.users.remove(user);
                        Claimed.set(user.id, Date.now() + 5000);
                    }
                    setTimeout(() => Claimed.delete(user.id), 5000);
                });
                reactionCollector.on('end', (collected, reason) => {
                    if(reason === 'time') {
                        message.edit({ embeds: [embed.setFooter({ text: `${character[0].name} is now unclaimable` })] });
                        console.log(chalk.red(`[${chalk.white.bold(message.guild.id)}] ${chalk.hex(color).bold(character[0].name)} was not claimed`));
                    }
                });
            });
        }
    }
};