const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const member = message.mentions.members.first();
    const Name = args.slice(1).join(' ').toLowerCase().split(', ');
    const Character = await CharacterModel.find({ owner: message.member.id, name: Name }).collation({ locale: 'en', strength: 2 });
    const exists = await CharacterModel.find({ name: Name }).collation({ locale: 'en', strength: 2 });

    if(!member) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`You need to specify the member that you want to give characters!`)
        return message.channel.send(embed)
    }
    if(member.user.bot) {
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
    if(!Character) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`🔍 You specified a character that you dont own!`)
        return message.channel.send(embed)
    }
    else {
        Character.forEach(async(Char) => await CharacterModel.updateMany({ owner: message.member.id, name: Char.name }, { $set: { owner: member.id }}))

        message.channel.send(`You have gifted \`${Character}\` to **${member.user.username}**`)
        console.log(chalk.green(`${chalk.bold(message.member.user.username)} gifted ${chalk.bold(member.user.username)} the character ${chalk.bold(Character)}`))
    }
};

module.exports.help = {
    name: "gift",
    aliases: ["g"],
    description: "Gift a character.",
    category: "Inventory",
};