const { MessageButton } = require('discord-buttons');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const Name = args.join(' ');
    const Member = message.member;
    const Exists = await CharacterModel.findOne({ name: Name }).collation({ locale: 'en', strength: 2 });
    const Character = await CharacterModel.findOne({ owner: Member.id, name: Name }).collation({ locale: 'en', strength: 2 });

    if(!Name) {
        const embed = new MessageEmbed()
            .setColor('EED202')
            .setTitle(`You must specify the character you want to unclaim!`)
        return message.channel.send(embed)
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
            .setTitle(`🔍 You dont own \`${Exists.name}\`!`)
        return message.channel.send(embed)
    }
    else {
        const unclaim = new MessageButton().setStyle('green').setLabel('Unclaim').setID('unclaim')
        const cancel = new MessageButton().setStyle('red').setLabel('Cancel').setID('cancel')
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setAuthor(`Are you sure you want to unclaim ${Character.name}?`, Character.image, Character.charURL)
        message.channel.send({ embed: embed, buttons: [unclaim, cancel] }).then(message => {
            const filter = (button) => button.clicker.user.id === Member.id;
            const collector = message.createButtonCollector(filter, { max: 1, time: 120000 });
        
            collector.on('collect', async(button) => {
                button.defer()
                if(button.id === 'unclaim') {
                    const Unclaim = await CharacterModel.updateOne({ owner: Member.id, id: Character.id }, { $set: { owner: 'null' }});

                    if(Unclaim.n === 1) {
                        embed.setAuthor(`${Character.name} was unclaimed by ${Member.user.username}`, Character.image, Character.charURL)
                        message.edit({ embed: embed, buttons: [unclaim.setDisabled(), cancel.setDisabled()] })
                        console.log(chalk.red(`The character ${chalk.bold(Character.name)} was unclaimed by ${chalk.bold(Member.user.username)}`));
                    } else {
                        message.channel.send(`There was a problem with unclaiming **${Character.name}**`)
                    }
                }
                if(button.id === 'cancel') {
                    message.delete() 
                    message.channel.send(`**${Character.name}** was not unclaimed`)
                }
            });
            collector.on('end', (collected, reason) => {
                console.log(chalk.green(`The Character ${chalk.bold(Character.name)} was not unclaimed`))
                if(reason === 'time') { message.delete() }
            });
        });
    }
};

module.exports.help = {
    name: "unclaim",
    aliases: ["uc"],
    description: "Unclaim a character.",
    category: "Inventory",
};