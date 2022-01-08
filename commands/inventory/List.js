const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
    config: {
        name: "list",
        aliases: ["l"],
        description: "List your characters!",
        category: "Inventory",
    },
    run: async(bot, message, args) => {
        const characterModel = mongoose.model('Characters');
        const profileModel = mongoose.model('Profiles');
        const member = message.mentions.members.first() || message.member;
        const character = await characterModel.find({ owners: { guild: message.guild.id, owner: member.id }}).sort({ 'series.title': 1, name: 1 });
        const characterList = character.map((character) => `**${character.name}** - \`${character.series.title}\``)
        const previous = new MessageButton().setCustomId('previous').setLabel('Previous').setStyle('PRIMARY');
        const next = new MessageButton().setCustomId('next').setLabel('Next').setStyle('PRIMARY');
        const userProfile = await profileModel.findOne({ id: member.id });
        const guildIndex = userProfile.guilds.indexOf(userProfile.guilds.find(User => User.guild === message.guild.id))
        const charPerPage = 20;
        let page = 0;
        let pages = []

        if(args.length === 1 && args.join(' ') !== `<@!${member.id}>` || member.user.bot) {
            const embed = new MessageEmbed()
                .setColor('2f3136')
                .setTitle(`You specified an invalid user!`)
            return message.channel.send({ embeds: [embed] })
        }
        if(characterList.length === 0) {
            if(member.id === message.member.id) {
                return message.channel.send('You have no claimed characters!')
            }
            if(member.id !== message.member.id) {
                return message.channel.send(`**${member.user.username}** has no claimed characters!`)
            }
        }
        if(characterList.length > charPerPage) { 
            pages = [new MessageActionRow().addComponents([previous, next])];
        }

        const embed = new MessageEmbed()
            .setColor(userProfile.guilds[guildIndex].Color)
            .setTitle(`${member.user.username}'s claimed characters`)
            .setDescription(characterList.slice((page) * charPerPage, charPerPage).join('\n'))
            .setThumbnail(userProfile.guilds[guildIndex].image)
            .setFooter({ text: `Page ${page + 1}/${Math.ceil(characterList.length/charPerPage)} [${characterList.length} Characters]` })
        message.channel.send({ embeds: [embed], components: pages }).then(async(message) => {
            const buttonCollector = message.createMessageComponentCollector({ time: 120000 });

            buttonCollector.on('collect', async(button) => {
                if(button.customId === 'previous') { page -= 1 }
                if(button.customId === 'next') { page += 1 }
                if(page < 0) { page = Math.floor(characterList.length/charPerPage) }
                if(page > Math.floor(characterList.length/charPerPage)) { page = 0 }

                embed.setColor(userProfile.guilds[guildIndex].Color)
                embed.setTitle(`${member.user.username}'s claimed characters`)
                embed.setDescription(characterList.slice(page * charPerPage, (page + 1) * charPerPage).join('\n'))
                embed.setThumbnail(userProfile.guilds[guildIndex].image)
                embed.setFooter({ text: `Page ${page + 1}/${Math.ceil(characterList.length/charPerPage)} [${characterList.length} Characters]` })
                button.deferUpdate();
                return message.edit({ embeds: [embed], components: pages })
            })
        })
    }
};