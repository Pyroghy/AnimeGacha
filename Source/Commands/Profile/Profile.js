const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

module.exports.run = async(bot, message, args) => {
    const member = message.mentions.members.first() || message.member;
    const Character = mongoose.model('Characters');
    const Profile = mongoose.model('Profiles');
    const Waifus = await Character.aggregate([{ $match: { owner: member.id, gender: 'Female' }}]);
    const Husbandos = await Character.aggregate([{ $match: { owner: member.id, gender: 'Male' }}]);
    const Total = await Character.aggregate([{ $match: { owner: member.id }}]);
    const User = await Profile.findOne({ id: member.id });
    if(User === null) { return }
    const Check = await Character.findOne({ owner: member.id, image: User.image }).collation({ locale: 'en', strength: 2 });

    if(!User) {
        const embed = new MessageEmbed()
            .setColor("2f3136")
            .setTitle(`${member.user.username}'s Profile`)
            .setDescription(`**Husbandos Claimed**: \`${Husbandos.length}\`\n**Waifus Claimed**: \`${Waifus.length}\`\n**Total Claimed**: \`${Total.length}\``)
            .setThumbnail(member.user.avatarURL())
        return message.channel.send(embed)
    }
    if(!Check) {
        const embed = new MessageEmbed()
            .setColor("2f3136")
            .setTitle(`${User.username}'s Profile`)
            .setDescription(`**Husbandos Claimed**: \`${Husbandos.length}\`\n**Waifus Claimed**: \`${Waifus.length}\`\n**Total Claimed**: \`${Total.length}\``)
            .setThumbnail(member.user.avatarURL())
        return message.channel.send(embed)
    }
    if(User) {
        const embed = new MessageEmbed()
            .setColor("2f3136")
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
    category: "Profile",
};