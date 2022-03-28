const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

module.exports.run = async (bot, message, args) => {
    const characterModel = mongoose.model('Characters');
    const profileModel = mongoose.model('Profiles');
    const member = message.mentions.members.first() || message.member;
    const husbandos = await characterModel.aggregate([{ $match: { [`owners.${message.guild.id}`]: member.id, gender: 'Male' } }]);
    const waifus = await characterModel.aggregate([{ $match: { [`owners.${message.guild.id}`]: member.id, gender: 'Female' } }]);
    const total = await characterModel.aggregate([{ $match: { [`owners.${message.guild.id}`]: member.id } }]);
    const userProfile = await profileModel.findOne({ id: member.id });
    const exists = await profileModel.findOne({ id: member.id, 'guilds.guild': message.guild.id });

    if (args.length === 1 && args.join(' ') !== `<@!${member.id}>` || member.user.bot) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`You specified an invalid user!`)
        return message.channel.send({ embeds: [embed] })
    }
    if (!userProfile) {
        await profileModel.create({
            id: message.member.id,
            guilds: {
                [message.guild.id]: {
                    character: "None set",
                    image: member.user.avatarURL(),
                    color: "2f3136",
                }
            },
            badges: []
        })

        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`${member.user.username}'s Profile`)
            .setDescription(`**Displayed character**: \`None set\`\n\n**husbandos Claimed**: \`${husbandos.length}\`\n**waifus Claimed**: \`${waifus.length}\`\n**total Claimed**: \`${total.length}\``)
            .setThumbnail(member.user.avatarURL())
        return message.channel.send({ embeds: [embed] })
    }
    if (!exists) {
        await profileModel.updateOne({ id: member.id }, { $push: { color: "2f3136", guilds: [{ guild: message.guild.id, character: "None set", image: member.user.avatarURL() }] } });

        const embed = new MessageEmbed()
            .setColor(userProfile.color)
            .setTitle(`${member.user.username}'s Profile`)
            .setDescription(`**Displayed character**: \`None set\`\n\n**husbandos Claimed**: \`${husbandos.length}\`\n**waifus Claimed**: \`${waifus.length}\`\n**total Claimed**: \`${total.length}\`\n\n${userProfile.badges.join(' ')}`)
            .setThumbnail(member.user.avatarURL())
        return message.channel.send({ embeds: [embed] })
    }
    if (userProfile) {
        const embed = new MessageEmbed()
            .setColor(userProfile.guilds[message.guild.id].color)
            .setTitle(`${member.user.username}'s Profile`)
            .setDescription(`**Displayed character**: \`${userProfile.guilds[message.guild.id].character}\`\n\n**husbandos Claimed**: \`${husbandos.length}\`\n**waifus Claimed**: \`${waifus.length}\`\n**total Claimed**: \`${total.length}\`\n\n${userProfile.badges.join(' ')}`)
            .setThumbnail(userProfile.guilds[message.guild.id].image)
        return message.channel.send({ embeds: [embed] })
    }
};

module.exports.config = {
    name: "profile",
    aliases: ["p"],
    description: "Check yours or another users profile!",
    category: "Inventory",
};