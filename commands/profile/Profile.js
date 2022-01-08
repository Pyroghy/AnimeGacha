const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

module.exports.run = async(bot, message, args) => {
    const characterModel = mongoose.model('Characters');
    const profileModel = mongoose.model('Profiles');
    const member = message.mentions.members.first() || message.member;
    const husbandos = await characterModel.aggregate([{ $match: { owners: { guild: message.guild.id, owner: member.id }, gender: 'Male' }}]);
    const waifus = await characterModel.aggregate([{ $match: { owners: { guild: message.guild.id, owner: member.id }, gender: 'Female' }}]);
    const total = await characterModel.aggregate([{ $match: { owners: { guild: message.guild.id, owner: member.id }}}]);
    const user = await profileModel.findOne({ id: member.id });
    const exists = await profileModel.findOne({ id: member.id, 'guilds.guild': message.guild.id });

    if(args.length === 1 && args.join(' ') !== `<@!${member.id}>` || member.user.bot) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`You specified an invalid user!`)
        return message.channel.send({ embeds: [embed] })
    }
    if(!user) {
        await profileModel.create({ 
            id: message.member.id, 
            guilds: [
                { 
                    guild: message.guild.id, 
                    character: "None set",
                    color: "2f3136",
                    image: member.user.avatarURL() 
                }
            ], 
            badges: [] 
        })

        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`${member.user.username}'s Profile`)
            .setDescription(`**Displayed character**: \`None set\`\n\n**husbandos Claimed**: \`${husbandos.length}\`\n**waifus Claimed**: \`${waifus.length}\`\n**total Claimed**: \`${total.length}\``)
            .setThumbnail(member.user.avatarURL())
        return message.channel.send({ embeds: [embed] })
    }
    if(!exists) {
        await profileModel.updateOne({ id: member.id }, { $push: { color: "2f3136", guilds: [{ guild: message.guild.id, character: "None set", image: member.user.avatarURL() }]}});

        const embed = new MessageEmbed()
            .setColor(user.color)
            .setTitle(`${member.user.username}'s Profile`)
            .setDescription(`**Displayed character**: \`None set\`\n\n**husbandos Claimed**: \`${husbandos.length}\`\n**waifus Claimed**: \`${waifus.length}\`\n**total Claimed**: \`${total.length}\`\n\n${user.badges.join(' ')}`)
            .setThumbnail(member.user.avatarURL())
        return message.channel.send({ embeds: [embed] })
    }
    if(user) {
        const GuildList = user.guilds;
        const GuildIndex = GuildList.indexOf(GuildList.find(user => user.guild === message.guild.id))
        const embed = new MessageEmbed()
            .setColor(user.color)
            .setTitle(`${member.user.username}'s Profile`)
            .setDescription(`**Displayed character**: \`${GuildList[GuildIndex].character}\`\n\n**husbandos Claimed**: \`${husbandos.length}\`\n**waifus Claimed**: \`${waifus.length}\`\n**total Claimed**: \`${total.length}\`\n\n${user.badges.join(' ')}`)
            .setThumbnail(GuildList[GuildIndex].image)
        return message.channel.send({ embeds: [embed] })
    }
};

module.exports.config = {
    name: "profile",
    aliases: ["p"],
    description: "Check yours or another users profile!",
    category: "Inventory",
};