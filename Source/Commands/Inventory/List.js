const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

module.exports.run = async(bot, message, args) => {
    const Model = mongoose.model('Characters');
    const Profile = mongoose.model('Profiles');
    const member = message.mentions.members.first() || message.member;
    if(member.id === bot.user.id) { return }
    const User = await Profile.findOne({ id: member.id });
    const Character = await Model.find({ owner: member.id }).sort({ series: 1, name: 1 });
    const CharPerPage = 20;
    const CharacterList = Character.map((Character) => `**${Character.name}** - \`${Character.series}\``)

    if(CharacterList.length === 0) {
        return message.reply('You have no claimed characters!')
    }
    if(CharacterList.length <= CharPerPage) {
        const embed = new MessageEmbed()
            .setColor("2f3136")
            .setTitle(`${member.user.username}'s claimed characters`)
            .setDescription(CharacterList.join('\n'))
            .setThumbnail(User.image)
            .setFooter(`Page 1/1 [${CharacterList.length} Characters]`)
        return message.channel.send(embed);
    }
    else {
        let page = 0;
        const embed = new MessageEmbed()
            .setColor("2f3136")
            .setTitle(`${member.user.username}'s claimed characters`)
            .setDescription(CharacterList.slice((page) * CharPerPage, CharPerPage).join('\n'))
            .setThumbnail(User.image)
            .setFooter(`Page ${page + 1}/${Math.ceil(CharacterList.length/CharPerPage)} [${CharacterList.length} Characters]`)
        const msg = await message.channel.send(embed);
        await msg.react('⬅'); await msg.react('➡');
        const filter = (reaction, user) => user.id === user.id && (reaction.emoji.name === '⬅' || reaction.emoji.name === '➡');
        const collector = msg.createReactionCollector(filter, { time: 300000 });
        
        collector.on('collect', async(reaction, user) => {
            if(reaction.emoji.name === '⬅') { 
                page -= 1
                reaction.users.remove(user);
            }
            else if(reaction.emoji.name === '➡') {
                page += 1
                reaction.users.remove(user);
            }
        
            if(page < 0) { page = Math.floor(CharacterList.length/CharPerPage) }
            else if(page > Math.floor(CharacterList.length/CharPerPage)) { page = 0 }
        
            const newEmbed = new MessageEmbed()
                .setColor("2f3136")
                .setTitle(`${member.user.username}'s claimed characters`)
                .setDescription(CharacterList.slice(page * CharPerPage, (page + 1) * CharPerPage).join('\n'))
                .setThumbnail(User.image)
                .setFooter(`Page ${page + 1}/${Math.ceil(CharacterList.length/CharPerPage)} [${CharacterList.length} Characters]`)
            return msg.edit(newEmbed);
        })
    }
};

module.exports.help = {
    name: "list",
    aliases: ["l"],
    description: "List your characters!",
    category: "Inventory",
};