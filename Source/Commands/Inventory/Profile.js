const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const ProfileModel = mongoose.model('Profiles');
    const Member = message.mentions.members.first() || message.member;
    const Waifus = await CharacterModel.aggregate([{ $match: { Owner: Member.id, Gender: 'Female' }}]);
    const Husbandos = await CharacterModel.aggregate([{ $match: { Owner: Member.id, Gender: 'Male' }}]);
    const Total = await CharacterModel.aggregate([{ $match: { Owner: Member.id }}]);
    const User = await ProfileModel.findOne({ Id: Member.id });

    if(args.length === 1 && args.join(' ') !== `<@!${Member.id}>` || Member.user.bot) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`You specified an invalid user!`)
        return message.channel.send(embed)
    }
    if(!User) {
        ProfileModel.create({
            id: Member.id,
            username: Member.user.username,
            image: Member.user.avatarURL()
        })
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`${Member.user.username}'s Profile`)
            .setDescription(`**Husbandos Claimed**: \`${Husbandos.length}\`\n**Waifus Claimed**: \`${Waifus.length}\`\n**Total Claimed**: \`${Total.length}\``)
            .setThumbnail(Member.user.avatarURL())
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