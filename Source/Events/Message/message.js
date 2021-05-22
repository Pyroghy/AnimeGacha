const mongoose = require('mongoose');
require('dotenv').config();

module.exports = async(bot, message) => {
    const CharacterModel = mongoose.model('Characters');
    const Husbando = await CharacterModel.aggregate([{ $match: { owner: 'null', gender: 'Male' }}, { $sample: { size: 1 }}]);
    const Character = await CharacterModel.aggregate([{ $match: { owner: 'null' }}, { $sample: { size: 1 }}]);
    const Waifu = await CharacterModel.aggregate([{ $match: { owner: 'null', gender: 'Female' }}, { $sample: { size: 1 }}]);
    const Profile = mongoose.model('Profiles');
    const User = await Profile.findOne({ id: message.member.id });
    const prefix = process.env.PREFIX;
    const args = message.content.slice(prefix.length).trim().split(' ');
    const commandName = args.shift().toLowerCase();
    const command = bot.commands.get(commandName) || bot.commands.get(bot.aliases.get(commandName));

    if(Husbando[0] === undefined || Character[0] === undefined || Waifu[0] === undefined) { 
        return message.channel.send('There are currently no claimable characters!')
    }
    if(message.channel.type === 'dm') { return }
    if(!message.content.startsWith(prefix) || message.author.bot) { return }
    if(!User) {
        Profile.create({
            id: message.member.id,
            username: message.member.user.username,
            image: message.member.user.avatarURL()
        })
    }
	if(command) { command.run(bot, message, args) }
};