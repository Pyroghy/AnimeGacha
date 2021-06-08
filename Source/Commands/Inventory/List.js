const { MessageButton, MessageActionRow } = require('discord-buttons');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const ProfileModel = mongoose.model('Profiles');
    const Member = message.mentions.members.first() || message.member;

    if(args.length === 1 && args.join(' ') !== `<@!${Member.id}>` || Member.user.bot) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`You specified an invalid user!`)
        return message.channel.send(embed)
    }
    
    const Character = await CharacterModel.find({ Owner: Member.id }).sort({ 'Series.Title': 1, Name: 1 });
    const CharPerPage = 20;
    const CharacterList = Character.map((Character) => `**${Character.Name}** - \`${Character.Series.Title}\``)
    
    if(CharacterList.length === 0) {
        if(Member.id === message.member.id) {
            return message.channel.send('You have no claimed characters!')
        }
        if(Member.id !== message.member.id) {
            return message.channel.send(`**${Member.user.username}** has no claimed characters!`)
        }
    }

    const User = await ProfileModel.findOne({ id: Member.id });
    let page = 0;
    const previous = new MessageButton().setStyle('blurple').setLabel('Previous').setID('previous')
    const next = new MessageButton().setStyle('blurple').setLabel('Next').setID('next')
    const Pages = new MessageActionRow().addComponent(previous).addComponent(next);
    const embed = new MessageEmbed()
        .setColor('2f3136')
        .setTitle(`${Member.user.username}'s claimed characters`)
        .setDescription(CharacterList.slice((page) * CharPerPage, CharPerPage).join('\n'))
        .setThumbnail(User.image)
        .setFooter(`Page ${page + 1}/${Math.ceil(CharacterList.length/CharPerPage)} [${CharacterList.length} Characters]`)
    let Send;
    if(CharacterList.length > CharPerPage) { Send =  { embed: embed, component: Pages } }
    if(CharacterList.length < CharPerPage) { Send =  embed }
    message.channel.send(Send).then(async(message) => {
        const ButtonFilter = button => button.clicker.user.id === button.clicker.user.id;
        const ButtonCollector = message.createButtonCollector(ButtonFilter, { time: 120000 });

        ButtonCollector.on('collect', async(button) => {
            if(button.id === 'previous') { page -= 1 }
            if(button.id === 'next') { page += 1 }
            if(page < 0) { page = Math.floor(CharacterList.length/CharPerPage) }
            if(page > Math.floor(CharacterList.length/CharPerPage)) { page = 0 }

            embed.setColor('2f3136')
            embed.setTitle(`${Member.user.username}'s claimed characters`)
            embed.setDescription(CharacterList.slice(page * CharPerPage, (page + 1) * CharPerPage).join('\n'))
            embed.setThumbnail(User.image)
            embed.setFooter(`Page ${page + 1}/${Math.ceil(CharacterList.length/CharPerPage)} [${CharacterList.length} Characters]`)
            button.defer();
            return message.edit({ embed: embed, component: Pages })
        })
    })
};

module.exports.help = {
    name: "list",
    aliases: ["l"],
    description: "List your characters!",
    category: "Inventory",
};