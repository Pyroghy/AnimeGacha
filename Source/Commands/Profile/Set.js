const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

module.exports.run = async(bot, message, args) => {
    const Model = mongoose.model('Characters');
    const Profile = mongoose.model('Profiles');
    const Name = args.join(' ').toLowerCase();
    const Character = await Model.findOne({ owner: message.member.id, name: Name }).collation({ locale: 'en', strength: 2 });
    const exists = await Model.findOne({ name: Name }).collation({ locale: 'en', strength: 2 });
    const User = await Profile.findOne({ id: message.member.id });

    if(!User) { 
        return message.channel.send('Something went wrong please try again')
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
    if(User.image === Character.image) {
        const embed = new MessageEmbed()
            .setColor("2f3136")
            .setTitle(`\`${Character.name}\` is already set to your profile!`)
        return message.channel.send(embed)
    }
    else {        
        const Update = await Profile.updateOne({ id: message.member.id }, { $set: { image: Character.image }});

        if(Update) {
            const embed = new MessageEmbed()
                .setColor("2f3136")
                .setAuthor(`${Character.name} has been set to your profile!`, Character.image)
            return message.channel.send(embed)
        } else {
            return message.channel.send(`There was a problem with claiming **${Character.name}**`)
        }
    }
};

module.exports.help = {
    name: "set",
    description: "set up your profile",
    category: "Profile",
};