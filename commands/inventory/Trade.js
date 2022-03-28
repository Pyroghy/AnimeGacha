const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports = {
    config: {
        name: "trade",
        aliases: ["t"],
        description: "Trade a character.",
        category: "Inventory",
    },
    run: async (bot, message, args) => {
        const characterModel = mongoose.model('Characters');
        const member = message.member;
        const targetMember = message.mentions.members.first();
        const memberGive = args.slice(1).join(' ').split(/[ ,]+/);
        const memberCharacterGive = await characterModel.find({ name: memberGive }).collation({ locale: 'en', strength: 2 }).sort({ name: 1 }); // finds all characters in the given args
        const memberCharacterExistsList = memberCharacterGive.map(character => character.name);
        const memberCharacterGiveList = memberCharacterGive.filter(character => { //owned list - returns all owned characters from args
            if (character.owners[message.guild.id] === member.id) return character.name;
        });

        if (!targetMember) {
            const embed = new MessageEmbed()
                .setColor('FF0000')
                .setTitle(`You need to specify the Member that you want to trade with!`)
            return message.channel.send({ embeds: [embed] })
        }
        if (targetMember.id === member.id) {
            const embed = new MessageEmbed()
                .setColor('FF0000')
                .setTitle(`You cannot trade with yourself!`)
            return message.channel.send({ embeds: [embed] })
        }
        if (targetMember.user.bot) {
            const embed = new MessageEmbed()
                .setColor('EED202')
                .setTitle(`You cannot gift characrers to bots!`)
            return message.channel.send({ embeds: [embed] })
        }
        if (!args.slice(1).join(' ')) {
            const embed = new MessageEmbed()
                .setColor('EED202')
                .setTitle(`You need to specify the character(s) you want to trade!`)
            return message.channel.send({ embeds: [embed] })
        }
        if (memberGive.length > memberCharacterExistsList.length) {
            const embed = new MessageEmbed()
                .setColor('EED202')
                .setTitle(`🔍 You specified a character that doesnt exist!`)
            return message.channel.send({ embeds: [embed] })
        }
        if (memberGive.length > memberCharacterGiveList.length) {
            const embed = new MessageEmbed()
                .setColor('EED202')
                .setTitle(`🔍 You specified a character that you dont own!`)
            return message.channel.send({ embeds: [embed] })
        }
        else {
            message.delete()
            const memberOffer = memberCharacterGiveList.join(', ').replace(/, ([^,]*)$/, '\` and \`$1');
            const embed = new MessageEmbed()
                .setColor('2f3136')
                .addFields({ name: `**${member.user.username}'s Offerings**`, value: `\`${memberOffer}\``, inline: false })
                .setFooter({ text: 'Type -t [character(s)] to trade or -c to cancel the trade' })
            message.channel.send({ content: `Hey ${targetMember}, **${member.user.username}** wants to trade with you!`, embeds: [embed] }).then(botMessage => {
                const messageFilter = message => message.member.id === member.id || message.member.id === targetMember.id;
                const messageCollector = message.channel.createMessageCollector({ messageFilter });

                messageCollector.on('collect', async (message) => {
                    if (message.member.id === targetMember.id) {
                        const argz = message.content.slice(1).trim().split(' ');
                        if (message.content.startsWith('-t')) {
                            const targetMemberGive = argz.slice(1).join(' ').split(', ');
                            const tMCharacterGive = await characterModel.find({ name: targetMemberGive }).collation({ locale: 'en', strength: 2 }).sort({ name: 1 }); // finds all characters in the given args
                            const tMCharacterExistsList = memberCharacterGive.map(character => character.name);
                            const tMCharacterGiveList = memberCharacterGive.filter(character => { //owned list - returns all owned characters from args
                                if (character.owners[message.guild.id] === targetMember.id) return character.name;
                            });

                            if (!argz.slice(1).join(' ')) {
                                const embed = new MessageEmbed()
                                    .setColor('EED202')
                                    .setTitle(`You need to specify the character(s) you want to trade!`)
                                return message.channel.send({ embeds: [embed] })
                            }
                            if (targetMemberGive.length > tMCharacterExistsList.length) {
                                const embed = new MessageEmbed()
                                    .setColor('EED202')
                                    .setTitle(`🔍 You specified a character that doesnt exist!`)
                                return message.channel.send({ embeds: [embed] })
                            }
                            if (targetMemberGive.length > tMCharacterGiveList.length) {
                                const embed = new MessageEmbed()
                                    .setColor('EED202')
                                    .setTitle(`🔍 You specified a character that you dont own!`)
                                return message.channel.send({ embeds: [embed] })
                            }
                            else {
                                message.delete()
                                const targetMemberOffer = tMCharacterGiveList.join(', ').replace(/, ([^,]*)$/, '\` and \`$1');
                                const confirm = new MessageButton().setCustomId('confirm').setLabel('Confirm').setStyle('SUCCESS')
                                const unconfirm = new MessageButton().setCustomId('unconfirm').setLabel('Unconfirm').setStyle('DANGER')
                                const options = new MessageActionRow().addComponents([confirm, unconfirm]);
                                embed.setColor('2f3136')
                                embed.setTitle('Trade Offer')
                                embed.fields[0] = { name: `❌ _ _**${member.user.username}'s Offerings**`, value: `\`${memberOffer}\``, inline: false }
                                embed.addFields({ name: `❌ _ _**${targetMember.user.username}'s Offerings**`, value: `\`${targetMemberOffer}\``, inline: false })
                                embed.setFooter({ text: 'Type -c to cancel the trade' })
                                botMessage.edit({ content: null, embeds: [embed], components: [options] }).then(message => {
                                    const buttonFilter = button => button.user.id === member.id || button.user.id === targetMember.id;
                                    const buttonCollector = message.createMessageComponentCollector({ buttonFilter, time: 120000 });
                                    const clicked = buttonCollector.users;

                                    buttonCollector.on('collect', async (button) => {
                                        button.deferUpdate();

                                        const memberClicker = clicked.has(member.id)
                                        const targetMemberClicker = clicked.has(targetMember.id)

                                        if (button.customId === 'confirm') {
                                            if (button.user.id === member.id) {
                                                embed.fields[0] = { name: `✅ _ _**${member.user.username}'s Offerings**`, value: `\`${memberOffer}\``, inline: false }
                                            }
                                            if (button.user.id === targetMember.id) {
                                                embed.fields[1] = { name: `✅ _ _**${targetMember.user.username}'s Offerings**`, value: `\`${targetMemberOffer}\``, inline: false }
                                            }
                                            message.edit({ embeds: [embed], components: [options] })
                                        }

                                        if (button.customId === 'unconfirm') {
                                            clicked.delete(button.user.id);

                                            if (button.user.id === member.id) {
                                                embed.fields[0] = { name: `❌ _ _**${member.user.username}'s Offerings**`, value: `\`${memberOffer}\``, inline: false }
                                            }
                                            if (button.user.id === targetMember.id) {
                                                embed.fields[1] = { name: `❌ _ _**${targetMember.user.username}'s Offerings**`, value: `\`${targetMemberOffer}\``, inline: false }
                                            }
                                            message.edit({ embeds: [embed], components: [options] })
                                        }

                                        if (memberClicker && targetMemberClicker) {
                                            let time = 3;
                                            const interval = setInterval(() => {
                                                if (time <= 0) {
                                                    clearInterval(interval); // do i even need this if button collecter is done?
                                                    return buttonCollector.stop('completed');
                                                }

                                                embed.setFooter({ text: `Trade ending in ${time--} second(s)` })
                                                message.edit({ embeds: [embed], components: [options] })
                                            }, 1000);
                                        }
                                    });
                                    buttonCollector.on('end', (collected, reason) => {
                                        messageCollector.stop();
                                        if (reason === 'time') {
                                            embed.setColor('FF0000')
                                            embed.setTitle('Trade Time Limit Expired')
                                            embed.setFooter({ text: '' })
                                            return message.edit({ embeds: [embed] })
                                        }
                                        if (reason === 'completed') {
                                            memberCharacterGive.forEach(async (char) => await characterModel.updateMany({ [`owners.${message.guild.id}`]: member.id, id: char.Id }, { $set: { [`owners.${message.guild.id}`]: targetMember.id } }))
                                            tMCharacterGive.forEach(async (char) => await characterModel.updateMany({ [`owners.${message.guild.id}`]: targetMember.id, id: char.Id }, { $set: { [`owners.${message.guild.id}`]: member.id } }))
                                            console.log(chalk.green(`${chalk.bold(member.user.username)} traded ${chalk.bold(memberOffer).replaceAll('`', '')} to ${chalk.bold(targetMember.user.username)}`))
                                            console.log(chalk.green(`${chalk.bold(targetMember.user.username)} traded ${chalk.bold(targetMemberOffer).replaceAll('`', '')} to ${chalk.bold(member.user.username)}`))
                                            embed.setColor('00FF00')
                                            embed.setTitle('Trade Completed!')
                                            embed.fields[0] = { name: `✅ _ _**${member.user.username}'s Offerings**`, value: `\`${memberOffer}\``, inline: false }
                                            embed.fields[1] = { name: `✅ _ _**${targetMember.user.username}'s Offerings**`, value: `\`${targetMemberOffer}\``, inline: false }
                                            embed.setFooter({ text: '' })
                                            return message.edit({ embeds: [embed] })
                                        }
                                    })
                                })
                            }
                        }
                    }
                    if (message.content.startsWith('-c')) messageCollector.stop('cancel')
                });
                messageCollector.on('end', (collected, reason) => {
                    if (reason === 'cancel') {
                        embed.setColor('FF0000')
                        embed.setTitle('Trade Cancelled')
                        embed.setFooter({ text: '' })
                        return message.edit(embed)
                    }
                });
            })
        }
    }
};