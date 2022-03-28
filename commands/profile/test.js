const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

module.exports.run = async(bot, message, args) => {
    const characterModel = mongoose.model('Characters');
    const ProfileModel = mongoose.model('Profiles');
    const Member = message.mentions.members.first() || message.member;
    const Husbandos = await characterModel.aggregate([{ $match: { Owners: { Guild: message.guild.id, Owner: Member.id }, Gender: 'Male' }}]);
    const Waifus = await characterModel.aggregate([{ $match: { Owners: { Guild: message.guild.id, Owner: Member.id }, Gender: 'Female' }}]);
    const Total = await characterModel.aggregate([{ $match: { Owners: { Guild: message.guild.id, Owner: Member.id }}}]);
    const User = await ProfileModel.findOne({ Id: Member.id });
    const Exists = await ProfileModel.findOne({ Id: Member.id, 'Guilds.Guild': message.guild.id });

    if(args.length === 1 && args.join(' ') !== `<@!${Member.id}>` || Member.user.bot) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`You specified an invalid user!`)
        return message.channel.send(embed)
    }
    if(!User) {
        await ProfileModel.create({ Id: Member.id, Color: "2f3136", Guilds: [{ Guild: message.guild.id, Character: "None set", Image: Member.user.avatarURL() }], Badges: [] })
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`${Member.user.username}'s Profile`)
            .setDescription(`**Displayed Character**: \`None set\`\n\n**Husbandos Claimed**: \`${Husbandos.length}\`\n**Waifus Claimed**: \`${Waifus.length}\`\n**Total Claimed**: \`${Total.length}\``)
            .setThumbnail(Member.user.avatarURL())
        return message.channel.send(embed)
    }
    if(!Exists) {
        await ProfileModel.updateOne({ Id: Member.id }, { $push: { Color: "2f3136", Guilds: [{ Guild: message.guild.id, Character: "None set", Image: Member.user.avatarURL() }]}});
        const embed = new MessageEmbed()
            .setColor(User.Color)
            .setTitle(`${Member.user.username}'s Profile`)
            .setDescription(`**Displayed Character**: \`None set\`\n\n**Husbandos Claimed**: \`${Husbandos.length}\`\n**Waifus Claimed**: \`${Waifus.length}\`\n**Total Claimed**: \`${Total.length}\`\n\n${User.Badges.join(' ')}`)
            .setThumbnail(Member.user.avatarURL())
        return message.channel.send(embed)
    }
    if(User) {
        const GuildList = User.Guilds;
        const GuildIndex = GuildList.indexOf(GuildList.find(User => User.Guild === message.guild.id))
        const embed = new MessageEmbed()
            .setColor(User.Color)
            .setTitle(`${Member.user.username}'s Profile`)
            .setDescription(`**Displayed Character**: \`${GuildList[GuildIndex].Character}\`\n\n**Husbandos Claimed**: \`${Husbandos.length}\`\n**Waifus Claimed**: \`${Waifus.length}\`\n**Total Claimed**: \`${Total.length}\`\n\n${User.Badges.join(' ')}`)
            .setThumbnail(GuildList[GuildIndex].Image)
        message.channel.send(embed)
    }
};

module.exports.config = {
    name: "test",
    aliases: ["a"]
};