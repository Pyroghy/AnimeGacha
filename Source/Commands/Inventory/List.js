const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const ProfileModel = mongoose.model('Profiles');
    const member = message.mentions.members.first() || message.member;

    if(args.length === 1 && args.join(' ') !== `<@!${member.id}>` || member.user.bot) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`You specified an invalid user!`)
        return message.channel.send(embed)
    }
    
    const Character = await CharacterModel.find({ owners: { $elemMatch: { guild: message.guild.id, owner: member.id }}}).sort({ series: 1, name: 1 });
    const CharPerPage = 20;
    const CharacterList = Character.map((Character) => `**${Character.name}** - \`${Character.series}\``)
    
    if(CharacterList.length === 0) {
        if(member.id === message.member.id) {
            return message.channel.send('You have no claimed characters!')
        }
        if(member.id !== message.member.id) {
            return message.channel.send(`**${member.user.username}** has no claimed characters!`)
        }
    }

    const User = await ProfileModel.findOne({ id: member.id });
    const Guild = User.images.find(gi => gi.guild === message.guild.id);
    const Index = User.images.indexOf(Guild);
    let page = 0;
    const embed = new MessageEmbed()
        .setColor('2f3136')
        .setTitle(`${member.user.username}'s claimed characters`)
        .setDescription(CharacterList.slice((page) * CharPerPage, CharPerPage).join('\n'))
        .setThumbnail(User.images[Index].image)
        .setFooter(`Page ${page + 1}/${Math.ceil(CharacterList.length/CharPerPage)} [${CharacterList.length} Characters]`)
    message.channel.send(embed).then(async(message) => {
        if(CharacterList.length > CharPerPage) {
            await message.react('⬅'); await message.react('➡');
        }

        const filter = (reaction, user) => user.id === user.id && (reaction.emoji.name === '⬅' || reaction.emoji.name === '➡');
        const collector = message.createReactionCollector(filter, { time: 300000 });
            
        collector.on('collect', async(reaction, user) => {
            if(reaction.emoji.name === '⬅') { page -= 1; reaction.users.remove(user) }
            if(reaction.emoji.name === '➡') { page += 1; reaction.users.remove(user) }
            if(page < 0) { page = Math.floor(CharacterList.length/CharPerPage) }
            if(page > Math.floor(CharacterList.length/CharPerPage)) { page = 0 }
            
            const newEmbed = new MessageEmbed()
                .setColor('2f3136')
                .setTitle(`${member.user.username}'s claimed characters`)
                .setDescription(CharacterList.slice(page * CharPerPage, (page + 1) * CharPerPage).join('\n'))
                .setThumbnail(User.images[Index].image)
                .setFooter(`Page ${page + 1}/${Math.ceil(CharacterList.length/CharPerPage)} [${CharacterList.length} Characters]`)
            return message.edit(newEmbed);
        })
    })

};

module.exports.help = {
    name: "list",
    aliases: ["l"],
    description: "List your characters!",
    category: "Inventory",
};