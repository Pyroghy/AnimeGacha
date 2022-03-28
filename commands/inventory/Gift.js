const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports = {
    config: {
        name: "gift",
        aliases: ["g"],
        description: "Gift a character.",
        category: "Inventory",
    },
    run: async (bot, message, args) => {
        const characterModel = mongoose.model('Characters');
        const member = message.mentions.members.first();
        const giftingCharacters = args.slice(1).join(' ').split(', ');
        const character = await characterModel.find({ [`owners.${message.guild.id}`]: message.member.id, name: giftingCharacters }).collation({ locale: 'en', strength: 2 });
        const exists = await characterModel.find({ name: giftingCharacters }).collation({ locale: 'en', strength: 2 });
        const characterList = character.map(char => char.name);
        const existsList = exists.map(char => char.name);

        if (!member) {
            const embed = new MessageEmbed()
                .setColor('FF0000')
                .setTitle(`You need to specify the member that you want to give characters!`)
            return message.channel.send({ embeds: [embed] })
        }
        if (member.id === message.member.id) {
            const embed = new MessageEmbed()
                .setColor('FF0000')
                .setTitle(`You cannot gift yourself characters!`)
            return message.channel.send({ embeds: [embed] })
        }
        if (member.user.bot) {
            const embed = new MessageEmbed()
                .setColor('FF0000')
                .setTitle(`You cannot gift characters to bots!`)
            return message.channel.send({ embeds: [embed] })
        }
        if (!args.slice(1).join(' ')) {
            const embed = new MessageEmbed()
                .setColor('EED202')
                .setTitle(`You need to specify the character(s) you want to gift!`)
            return message.channel.send({ embeds: [embed] })
        }
        if (giftingCharacters.length > existsList.length) {
            const embed = new MessageEmbed()
                .setColor('EED202')
                .setTitle(`🔍 You specified a character that doesnt exist!`)
            return message.channel.send({ embeds: [embed] })
        }
        if (giftingCharacters.length > characterList.length) {
            const embed = new MessageEmbed()
                .setColor('EED202')
                .setTitle(`🔍 You specified a character that you dont own!`)
            return message.channel.send({ embeds: [embed] })
        }
        else {
            character.forEach(async (char) => await characterModel.updateMany({ [`owners.${message.guild.id}`]: message.member.id, id: char.Id }, { $set: { [`owners.${message.guild.id}`]: member.id } }))

            const CharacterGift = characterList.join(', ').replace(/, ([^,]*)$/, '\` and \`$1');
            const embed = new MessageEmbed()
                .setColor('00FF00')
                .setTitle(`You have gifted \`${CharacterGift}\` to **${member.user.username}**`)
            message.channel.send({ embeds: [embed] })
            console.log(chalk.green(`${chalk.bold(message.member.user.username)} gifted ${chalk.bold(member.user.username)} the character(s) ${chalk.bold(CharacterGift).replaceAll('`', '')}`))
        }
    }
};