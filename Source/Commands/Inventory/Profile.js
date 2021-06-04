const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const ProfileModel = mongoose.model('Profiles');
    const member = message.mentions.members.first() || message.member;
    const Waifus = await CharacterModel.aggregate([{ $match: { owner: member.id, gender: 'Female' }}]);
    const Husbandos = await CharacterModel.aggregate([{ $match: { owner: member.id, gender: 'Male' }}]);
    const Total = await CharacterModel.aggregate([{ $match: { owner: member.id }}]);
    const User = await ProfileModel.findOne({ id: member.id });

    if(args.length === 1 && args.join(' ') !== `<@!${member.id}>` || member.user.bot) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`You specified an invalid user!`)
        return message.channel.send(embed)
    }
    if(!User) {
        ProfileModel.create({
            id: member.id,
            username: member.user.username,
            image: member.user.avatarURL()
        })
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`${member.user.username}'s Profile`)
            .setDescription(`**Husbandos Claimed**: \`${Husbandos.length}\`\n**Waifus Claimed**: \`${Waifus.length}\`\n**Total Claimed**: \`${Total.length}\``)
            .setThumbnail(member.user.avatarURL())
        return message.channel.send(embed)
    }
    if(User) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`${User.username}'s Profile`)
            .setDescription(`**Husbandos Claimed**: \`${Husbandos.length}\`\n**Waifus Claimed**: \`${Waifus.length}\`\n**Total Claimed**: \`${Total.length}\``)
            .setThumbnail(User.image)
        return message.channel.send(embed)
    }
};

module.exports.help = {
    name: "profile",
    aliases: ["p"],
    description: "Check yours or another users profile!",
    category: "Inventory",
};