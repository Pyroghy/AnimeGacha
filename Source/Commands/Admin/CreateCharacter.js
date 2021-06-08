const { MessageButton, MessageActionRow } = require('discord-buttons');
const { MessageEmbed } = require('discord.js');
const Duration = require('humanize-duration');
const mongoose = require('mongoose');
const chalk = require('chalk');
const Created = new Map();

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const CharacterData = args.join(' ').split(', ');
    const Member = message.member;
    const cooldown = Created.get(Member.id);

    if(cooldown) {
        const remaining = Duration(cooldown - Date.now());
        message.channel.send(`<@!${Member.id}>, You need to wait ${remaining} before creating another characrer!`)
    }
    else {
        if(!CharacterData[0]) {
            return message.channel.send('You need to specify the characters name!')
        }
    
        let Gender;
    
        const CharacterSearch = await CharacterModel.aggregate([{ $search: { 'index': 'Search', 'text': { query: CharacterData[0], path: 'Name' }}}]).collation({ locale: 'en', strength: 2 }).sort({ score: { $meta: "textScore" }})
    
        if(CharacterSearch[0]) {
            return message.channel.send('You cannot create a character with the same name as an existing character!')
        }
        if(CharacterData[1].toLowerCase() === 'female') { Gender = 'Female' }
        if(CharacterData[1].toLowerCase() === 'male') { Gender = 'Male' }
        else {
            return message.channel.send('You did not specify a valid gender!')
        }
        if(!CharacterData[2].toLowerCase().endsWith('.jpg')) {
            if(!CharacterData[2].toLowerCase().endsWith('.jpeg')) {
                if(!CharacterData[2].toLowerCase().endsWith('.png')) {
                    if(!CharacterData[2].toLowerCase().endsWith('.webm')) {
                        return message.channel.send('That is not a valid image!')
                    }
                }
            }
        }
    
        const Confirm = new MessageButton().setStyle('green').setLabel('Confirm').setID('confirm')
        const Cancel = new MessageButton().setStyle('red').setLabel('Cancel').setID('cancel')
        const Options = new MessageActionRow().addComponent(Confirm).addComponent(Cancel);
        const embed = new MessageEmbed()
            .setAuthor(`Character Creation Preview`)
            .setTitle(CharacterData[0])
            .setColor('2f3136')
            .setDescription(`**Series**: CUSTOM\n**Gender**: ${Gender}`)
            .setImage(CharacterData[2])
            .setFooter(`Canceling will make you start over`)
        message.channel.send({ embed: embed, component: Options }).then(message => {
            const ButtonFilter = button => button.clicker.user.id === Member.id;
            const ButtonCollector = message.createButtonCollector(ButtonFilter, { max: 1, time: 60000 });
            const OptionsDisabled = new MessageActionRow().addComponent(Confirm.setDisabled()).addComponent(Cancel.setDisabled());
        
            ButtonCollector.on('collect', async(button) => {
                button.defer();
                if(button.id === 'confirm') { 
                    await CharacterModel.create({ 
                        Owner: "null", 
                        Name: CharacterData[0], 
                        Url: null,
                        Id: null,
                        Gender: Gender,
                        Series: {
                            Title: "CUSTOM",
                            Type: "CUSTOM"
                        },
                        Image: CharacterData[2],
                        Stats: {
                            Smash: 0,
                            Pass: 0
                        }
                    })
    
                    embed.setFooter('Character was successfully created')
                    message.edit({ embed: embed, component: OptionsDisabled })
                    console.log(chalk.green(`${chalk.bold(Member.user.username)} created a custom character called ${chalk.bold(CharacterData[0])}`))
                    Created.set(Member.id, Date.now() + 600000);
                }
                if(button.id === 'cancel') {
                    embed.setFooter('Character creation was canceled')
                    message.edit({ embed: embed, component: OptionsDisabled })
                    console.log(chalk.red(`Character creation was canceled`))
                }
            })
            ButtonCollector.on('end', (collected, reason) => {
                if(reason === 'time') {
                    embed.setFooter('Character creation time expired')
                    message.edit({ embed: embed, component: OptionsDisabled })
                    console.log(chalk.red(`Character creation time expired`))
                }
            })
        })
    }
    setTimeout(() => Created.delete(Member.id), 600000);
};

module.exports.help = {
    name: "createcharacter",
    aliases: ["cc"],
    description: "Create a custom character",
    category: "Admin",
};