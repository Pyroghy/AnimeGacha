const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports.run = async(bot, message, args) => {
    const Model = mongoose.model('Characters');
    const member = message.mentions.members.first();
    const Name = args.slice(1).join(' ').toLowerCase().split(', ');
    const Character = await Model.find({ owner: message.member.id, name: Name }).collation({ locale: 'en', strength: 2 });
    const exists = await Model.find({ name: Name }).collation({ locale: 'en', strength: 2 });

    if(!member) {
        const embed = new MessageEmbed()
            .setColor("2f3136")
            .setTitle(`You need to specify the member that you want to give characters!`)
        return message.channel.send(embed)
    }
    if(member.user.bot) {
        const embed = new MessageEmbed()
            .setColor("2f3136")
            .setTitle(`You cannot gift characrers to bots!`)
        return message.channel.send(embed)
    }
    if(!exists) {
        const embed = new MessageEmbed()
            .setColor("2f3136")
            .setTitle(`🔍 There is no character named \`${Name}\`!`)
        return message.channel.send(embed)
    }
    if(!Character) {
        const embed = new MessageEmbed()
            .setColor("2f3136")
            .setTitle(`🔍 You dont own \`${Name}\`!`)
        return message.channel.send(embed)
    }
    else {
        Character.forEach(async(Char) => {
            const Gift = await Model.updateMany({ owner: message.member.id, name: Char.name }, { $set: { owner: member.id }});
    
            if(Gift.n === 1) {
                message.channel.send(`You have gifted \`${Char.name}\` to **${member.user.username}**`)
                console.log(chalk.green(`${chalk.bold(message.member.user.username)} gifted ${chalk.bold(member.user.username)} the character ${chalk.bold(Char.name)}`))
            } else {
                message.channel.send(`There was a problem with gifting **${Char.name}**`)
            }
        })
    }
};

module.exports.help = {
    name: "gift",
    aliases: ["g"],
    description: "Gift a character.",
    category: "Inventory",
};