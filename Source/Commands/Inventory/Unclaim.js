const { MessageButton, MessageActionRow } = require('discord-buttons');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const Name = args.join(' ');
    const Member = message.member;
    const Exists = await CharacterModel.findOne({ Name: Name }).collation({ locale: 'en', strength: 2 });
    const Character = await CharacterModel.findOne({ Owner: Member.id, Name: Name }).collation({ locale: 'en', strength: 2 });

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
        const Options = new MessageActionRow().addComponent(unclaim).addComponent(cancel);
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setAuthor(`Are you sure you want to unclaim ${Character.Name}?`, Character.Image, Character.Url)
        message.channel.send({ embed: embed, component: Options }).then(message => {
            const ButtonFilter = button => button.clicker.user.id === Member.id;
            const ButtonCollector = message.createButtonCollector(ButtonFilter, { max: 1, time: 120000 });
        
            ButtonCollector.on('collect', async(button) => {
                button.defer()
                if(button.id === 'unclaim') {
                    const OptionsDisabled = new MessageActionRow().addComponent(unclaim.setDisabled()).addComponent(cancel.setDisabled());
                    const Unclaim = await CharacterModel.updateOne({ Owner: Member.id, Id: Character.Id }, { $set: { Owner: 'null' }});

                    if(Unclaim.n === 1) {
                        embed.setAuthor(`${Character.Name} was unclaimed by ${Member.user.username}`, Character.Image, Character.Url)
                        message.edit({ embed: embed, component: OptionsDisabled })
                        console.log(chalk.red(`The character ${chalk.bold(Character.Name)} was unclaimed by ${chalk.bold(Member.user.username)}`));
                    } else {
                        return message.channel.send(`There was a problem with unclaiming **${Character.Name}**`)
                    }
                }
                if(button.id === 'cancel') {
                    message.delete() 
                    message.channel.send(`**${Character.Name}** was not unclaimed`)
                }
            });
            ButtonCollector.on('end', (collected, reason) => {
                console.log(chalk.green(`The Character ${chalk.bold(Character.Name)} was not unclaimed`))
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