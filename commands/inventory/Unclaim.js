const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports = {
    config: {
        name: "unclaim",
        aliases: ["uc"],
        description: "Unclaim a character.",
        category: "Inventory",
    },
    run: async(bot, message, args) => {
        const characterModel = mongoose.model('Characters');
        const name = args.join(' ');
        const member = message.member;
        const exists = await characterModel.findOne({ name: name }).collation({ locale: 'en', strength: 2 });
        const character = await characterModel.findOne({ owners: { guild: message.guild.id, owner: message.member.id }, name: name }).collation({ locale: 'en', strength: 2 });

        if(!name) {
            const embed = new MessageEmbed()
                .setColor('EED202')
                .setTitle(`You must specify the character you want to unclaim!`)
            return message.channel.send({ embeds: [embed] })
        }
        if(!exists) {
            const embed = new MessageEmbed()
                .setColor('2f3136')
                .setTitle(`🔍 There is no character named \`${name}\`!`)
            return message.channel.send({ embeds: [embed] })
        }
        if(!character) {
            const embed = new MessageEmbed()
                .setColor('2f3136')
                .setTitle(`🔍 You dont own \`${exists.name}\`!`)
            return message.channel.send({ embeds: [embed] })
        }
        else {
            const unclaim = new MessageButton().setCustomId('unclaim').setLabel('Unclaim').setStyle('SUCCESS')
            const cancel = new MessageButton().setCustomId('cancel').setLabel('Cancel').setStyle('DANGER')
            const options = new MessageActionRow().addComponents(unclaim, cancel);
            const embed = new MessageEmbed()
                .setColor('2f3136')
                .setTitle(`Unclaim ${character.name}?`)
                .setDescription(`**character**: ${character.name}\n**Series**: ${character.series.title}\n**Gender**: ${character.gender}`)
                .setThumbnail(character.image)
            message.channel.send({ embeds: [embed], components: [options] }).then(message => {
                const buttonFilter = button => button.clicker.user.id === member.id;
                const buttonCollector = message.createMessageComponentCollector({ buttonFilter, max: 1, time: 120000 });
            
                buttonCollector.on('collect', async(button) => {
                    button.deferUpdate();
                    const optionsDisabled = new MessageActionRow().addComponents(unclaim.setDisabled(), cancel.setDisabled());
                    
                    if(button.customId === 'unclaim') {
                        const unclaim = await characterModel.updateOne({ 'owners.guild': message.guild.id, 'owners.owner': member.id, id: character.id }, { $set: { 'owners.$.owner': 'null' }});

                        if(unclaim.n === 1) {
                            embed.setTitle(`${character.name} was unclaimed`)
                            message.edit({ embeds: [embed], components: [optionsDisabled] })
                            console.log(chalk.red(`The character ${chalk.bold(character.name)} was unclaimed by ${chalk.bold(member.user.username)}`));
                        } else {
                            return message.channel.send(`There was a problem with unclaiming **${character.name}**`)
                        }
                    }
                    if(button.customId === 'cancel') {
                        embed.setTitle(`${character.name} was not unclaimed`)
                        message.edit({ embeds: [embed], components: [optionsDisabled] })
                    }
                });
                buttonCollector.on('end', (collected, reason) => {
                    console.log(chalk.green(`The character ${chalk.bold(character.name)} was not unclaimed`))
                    if(reason === 'time') { message.delete() }
                });
            });
        }
    }
};