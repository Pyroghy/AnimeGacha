const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const ProfileModel = mongoose.model('Profiles');
    const Name = args.join(' ');
    const Character = await CharacterModel.findOne({ Owner: message.member.id, Name: Name }).collation({ locale: 'en', strength: 2 });
    const Exists = await CharacterModel.findOne({ Name: Name }).collation({ locale: 'en', strength: 2 });
    const User = await ProfileModel.findOne({ Id: message.member.id });

    if(!Name) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`You need to specify a character to set to your profile!`)
        return message.channel.send(embed)
    }
    if(!User) {
        if(!Character) {
            const embed = new MessageEmbed()
                .setColor('2f3136')
                .setTitle(`🔍 You dont own \`${Exists.Name}\`!`)
            return message.channel.send(embed)
        }
        else {
            ProfileModel.create({
                id: message.member.id,
                username: message.member.user.username,
                image: Character.Image
            })
            const embed = new MessageEmbed()
                .setColor('2f3136')
                .setAuthor(`${Character.Name} has been set to your profile!`, Character.Image)
            return message.channel.send(embed)
        }
    }
    if(!Exists) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`🔍 There is no character named \`${Name}\`!`)
        return message.channel.send(embed)
    }
    if(!Character) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`🔍 You dont own \`${Exists.Name}\`!`)
        return message.channel.send(embed)
    }
    if(User.image === Character.Image) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`\`${Character.Name}\` is already set to your profile!`)
        return message.channel.send(embed)
    }
    else {        
        const Update = await ProfileModel.updateOne({ Id: message.member.id }, { $set: { Image: Character.Image }});
        
        if(Update.n === 1) {
            const embed = new MessageEmbed()
                .setColor('2f3136')
                .setAuthor(`${Character.Name} has been set to your profile!`, Character.Image)
            return message.channel.send(embed)
        } else {
            return message.channel.send(`There was a problem with setting **${Character.Name}** to your profile`)
        }
    }
};

module.exports.help = {
    name: "set",
    description: "Set up your profile",
    category: "Inventory",
};