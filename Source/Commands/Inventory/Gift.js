const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const member = message.mentions.members.first();
    const Name = args.slice(1).join(' ').split(', ');
    const Character = await CharacterModel.find({ owners: { $elemMatch: { guild: message.guild.id, owner: message.member.id }}, name: Name }).collation({ locale: 'en', strength: 2 });
    const CharacterList = Character.map((Character) => Character.name);
    const Exists = await CharacterModel.find({ name: Name }).collation({ locale: 'en', strength: 2 });
    const ExistsList = Exists.map((Character) => Character.name);

    if(!member) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`You need to specify the member that you want to give characters!`)
        return message.channel.send(embed)
    }
    if(member.user.bot) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`You cannot gift characters to bots!`)
        return message.channel.send(embed)
    }
    if(!args.slice(1).join(' ')) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`You need to specify the character(s) you want to gift!`)
        return message.channel.send(embed)
    }
    if(Name.length !== ExistsList.length) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`🔍 You specified a character that doesnt exist!`)
        return message.channel.send(embed)
    }
    if(Name.length !== CharacterList.length) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`🔍 You specified a character that you dont own!`)
        return message.channel.send(embed)
    }
    else {        
        const CharacterList = Character.map((Character) => `${Character.name}`)
        const CharacterGift = CharacterList.join(', ').replace(/, ([^,]*)$/, '\` and \`$1');

        Character.forEach(async(Char) => await CharacterModel.updateMany({ 'owners.guild': message.guild.id, id: Char.id }, { $set: { 'owners.$.owner': member.id }}))

        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`You have gifted \`${CharacterGift}\` to **${member.user.username}**`)
        message.channel.send(embed)
        console.log(chalk.green(`${chalk.bold(message.member.user.username)} gifted ${chalk.bold(member.user.username)} the character(s) ${chalk.bold(CharacterGift).replaceAll('`', '')}`))
    }
};

module.exports.help = {
    name: "gift",
    aliases: ["g"],
    description: "Gift a character.",
    category: "Inventory",
};