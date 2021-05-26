const { used } = require('../../Events/Message/cooldown.js');
const { MessageEmbed } = require('discord.js');
const Duration = require('humanize-duration');
const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const Waifu = await CharacterModel.aggregate([{ $match: { owners: { $elemMatch: { guild: message.guild.id, owner: 'null' }}, gender: 'Female' }}, { $sample: { size: 1 }}]);

    if(!Waifu[0]) { return }
    if(!args.length) {
        const embed = new MessageEmbed()
            .setTitle(Waifu[0].name)
            .setColor('2f3136')
            .setURL(Waifu[0].charURL)
            .setDescription(`**Series**: ${Waifu[0].series}`) 
            .setImage(Waifu[0].image)
            .setFooter(`React with any emoji to claim ${Waifu[0].name}`)
        message.channel.send(embed).then(message => {
            const filter = user => user.id === user.id;
            const collector = message.createReactionCollector(filter, { max: 1, time: 30000});

            collector.on('collect', async(reaction, user) => {
                const cooldown = used.get(user.id);
                
                if(cooldown) {
                    const remaining = Duration(cooldown - Date.now());
                    message.channel.send(`<@!${user.id}>, You need to wait ${remaining} before claiming another character!`)
                    collector.empty(); reaction.users.remove(user);
                }
                else {
                    const Claim = await CharacterModel.updateOne({ owners: { guild: message.guild.id, owner: 'null' }, id: Waifu[0].id }, { $set: { 'owners.$.owner': user.id }});

                    if(Claim.n === 1) {
                        message.edit(embed.setFooter(`Claimed by ${user.username}`, user.avatarURL()))
                        console.log(chalk.green(`The character ${chalk.bold(Waifu[0].name)} was claimed by ${chalk.bold(user.username)}`));
                    } else {
                        return message.channel.send(`There was a problem with claiming **${Waifu[0].name}**`)
                    }
                    collector.stop(); reaction.users.remove(user);
                    used.set(user.id, Date.now() + 5000);
                }
                setTimeout(() => used.delete(user.id), 5000);
            });
            collector.on('end', (collected, reason) => {
                if(reason === 'time') {
                    console.log(chalk.red(`The Character ${chalk.bold(Waifu[0].name)} was not claimed`))
                    message.edit(embed.setFooter(`${Waifu[0].name} is now unclaimable`))
                }
            });
        });
    }
};

module.exports.help = {
    name: "waifu",
    aliases: ["w"],
    description: "Roll and claim for a waifu!",
    category: "Gacha",
};