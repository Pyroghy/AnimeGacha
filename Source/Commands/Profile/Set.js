const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const ProfileModel = mongoose.model('Profiles');
    const Name = args.join(' ');
    const Character = await CharacterModel.findOne({ owner: message.member.id, name: Name }).collation({ locale: 'en', strength: 2 });
    const exists = await CharacterModel.findOne({ name: Name }).collation({ locale: 'en', strength: 2 });
    const User = await ProfileModel.findOne({ id: message.member.id });

    if(!User) {
        if(!Character) {
            const embed = new MessageEmbed()
                .setColor('2f3136')
                .setTitle(`🔍 You dont own \`${Name}\`!`)
            return message.channel.send(embed)
        }
        else {
            ProfileModel.create({
                id: message.member.id,
                username: message.member.user.username,
                image: Character.image
            })

            const embed = new MessageEmbed()
                .setColor('2f3136')
                .setAuthor(`${Character.name} has been set to your profile!`, Character.image)
            return message.channel.send(embed)
        }
    }
    if(!exists) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`🔍 There is no character named \`${Name}\`!`)
        return message.channel.send(embed)
    }
    if(!Character) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`🔍 You dont own \`${Name}\`!`)
        return message.channel.send(embed)
    }
    if(User.image === Character.image) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`\`${Character.name}\` is already set to your profile!`)
        return message.channel.send(embed)
    }
    else {        
        const Update = await ProfileModel.updateOne({ id: message.member.id }, { $set: { image: Character.image }});

        if(Update) {
            const embed = new MessageEmbed()
                .setColor('2f3136')
                .setAuthor(`${Character.name} has been set to your profile!`, Character.image)
            return message.channel.send(embed)
        } else {
            return message.channel.send(`There was a problem with setting **${Character.name}** to your profile`)
        }
    }
};

module.exports.help = {
    name: "set",
    description: "set up your profile",
    category: "Profile",
};