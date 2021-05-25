const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');

    const Character = await CharacterModel.findOne({ owners: { $elemMatch: { guild: message.guild.id }} });

    if(message.member.hasPermission('ADMINISTRATOR')) {
        if(!Character) {
            await CharacterModel.updateMany({}, { $push: { owners: { 'guild': message.guild.id, 'owner': 'null' }}});
            return console.log('Characters are now claimable')
        }
        if(Character) {
            return console.log('You cannot do this command anymore!')
        }
    }
    else {
        return message.channel.send('You cannot do this!')
    }
};

module.exports.help = {
    name: "setup",
    description: "Set the server up with the database",
    category: "Admin",
};