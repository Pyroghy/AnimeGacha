const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
    config: {
        name: "set",
        aliases: ["s"],
        description: "Set changes to your profile!",
        category: "Profile",
    },
    run: async(bot, message, args) => {
        const characterModel = mongoose.model('Characters');
        const profileModel = mongoose.model('Profiles');
        const name = args.join(' ');
        const character = await characterModel.findOne({ owners: { guild: message.guild.id, owner: message.member.id }, name: name }).collation({ locale: 'en', strength: 2 });
        const exists = await characterModel.findOne({ name: name }).collation({ locale: 'en', strength: 2 });
        const user = await profileModel.findOne({ id: message.member.id });
        const guildList = user.guilds;
        const guildIndex = guildList.indexOf(guildList.find(guilds => guilds.guild === message.guild.id))

        //Set character

        //Set color

        if(!name) {
            const embed = new MessageEmbed()
                .setColor('2f3136')
                .setTitle(`You need to specify a character to set to your profile!`)
            return message.channel.send({ embeds: [embed] })
        }
        if(!character) {
            const embed = new MessageEmbed()
                .setColor('2f3136')
                .setTitle(`🔍 You dont own \`${exists.name}\`!`)
            return message.channel.send({ embeds: [embed] })
        }
        if(!user) {
            profileModel.create({ 
                id: message.member.id, 
                guilds: [
                    { 
                        guild: message.guild.id, 
                        character: "None set",
                        color: "2f3136",
                        image: message.member.user.avatarURL() 
                    }
                ], 
                badges: [] 
            })
            const embed = new MessageEmbed()
                .setColor('2f3136')
                .setAuthor({ name: `${character.name} has been set to your profile!`, iconURL: character.image })
            return message.channel.send({ embeds: [embed] })
        }
        if(!exists) {
            const embed = new MessageEmbed()
                .setColor('2f3136')
                .setTitle(`🔍 There is no character named \`${name}\`!`)
            return message.channel.send({ embeds: [embed] })
        }
        if(guildList[guildIndex].image === character.image) {
            const embed = new MessageEmbed()
                .setColor('2f3136')
                .setTitle(`\`${character.name}\` is already set to your profile!`)
            return message.channel.send({ embeds: [embed] })
        }
        else {
            const update = await profileModel.updateOne({ 
                id: message.member.id, 
                'guilds.guild': message.guild.id
            }, { 
                $set: { 
                    guilds: [{
                        guild: message.guild.id,
                        character: character.name, 
                        image: character.image,
                        color: guildList[guildIndex].color
                    }]
                }
            });
            if(update.n === 1) {
                const embed = new MessageEmbed()
                    .setColor('2f3136')
                    .setAuthor({ name: `${character.name} has been set to your profile!`, iconURL: character.image })
                return message.channel.send({ embeds: [embed] })
            } else {
                console.log(update)
                return message.channel.send(`There was a problem with setting **${character.name}** to your profile`)
            }
        }
    }
};
