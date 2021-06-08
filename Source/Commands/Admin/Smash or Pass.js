const { MessageButton, MessageActionRow } = require('discord-buttons');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const Character = await CharacterModel.aggregate([{ $match: { Gender: 'Female' }}, { $sample: { size: 1 }}]);
    const MemberID = message.member.id;
    const embed = new MessageEmbed().setColor('2f3136').setTitle(Character[0].Name).setURL(Character[0].Url).setDescription(`**Series**: ${Character[0].Series.Title}`) .setImage(Character[0].Image)
    const smash = new MessageButton().setStyle('green').setLabel('Smash').setID('smash')
    const pass = new MessageButton().setStyle('red').setLabel('Pass').setID('pass')
    const Options = new MessageActionRow().addComponent(smash).addComponent(pass);
        
    message.channel.send({ embed: embed, component: Options }).then(message => {
        const ButtonFilter = button => button.clicker.user.id === MemberID;
        const MessageFilter = message => message.member.id === MemberID;
        const ButtonCollector = message.createButtonCollector(ButtonFilter, { max: 1, time: 120000 });
        const MessageCollector = message.channel.createMessageCollector(MessageFilter, { max: 1, time: 120000 });
        const OptionsDisabled = new MessageActionRow().addComponent(smash.setDisabled()).addComponent(pass.setDisabled());

        MessageCollector.on('collect', async(msg) => {
            if(msg.content.startsWith('!')) {
                const Percent = Math.round(parseInt(Character[0].Stats.Pass) + 1 * 100/parseInt(Character[0].Stats.Smash));
                const Passes = parseInt(Character[0].Stats.Pass) + 1;
                await CharacterModel.updateOne({ Id: Character[0].Id }, { $set: { 'Stats.Pass': Passes }});
                const embed = new MessageEmbed()
                    .setColor('2f3136')
                    .setTitle(Character[0].Name)
                    .setURL(Character[0].Url)
                    .setDescription(`${Percent}% of people decided to pass ${Character[0].Name}\n**Series**: ${Character[0].Series.Title}`) 
                    .setImage(Character[0].Image)
                    .setFooter(`${msg.member.user.username} chose to pass ${Character[0].Name}`)
                ButtonCollector.stop(); MessageCollector.stop();
                return message.edit({ embed: embed, component: OptionsDisabled })
            }
        });
        ButtonCollector.on('collect', async(button) => {
            MessageCollector.stop(); button.defer();
            if(button.id === 'smash') {
                const Percent = Math.round(parseInt(Character[0].Stats.Smash) + 1 * 100/parseInt(Character[0].Stats.Pass));
                const Smashes = parseInt(Character[0].Stats.Smash) + 1;
                await CharacterModel.updateOne({ Id: Character[0].Id }, { $set: { 'Stats.Smash': Smashes }});
                const embed = new MessageEmbed()
                    .setColor('2f3136')
                    .setTitle(Character[0].Name)
                    .setURL(Character[0].Url)
                    .setDescription(`${Percent}% of people decided to smash ${Character[0].Name}\n**Series**: ${Character[0].Series.Title}`) 
                    .setImage(Character[0].Image)
                    .setFooter(`${button.clicker.user.username} chose to smash ${Character[0].Name}`)
                return message.edit({ embed: embed, component: OptionsDisabled })
            }
            if(button.id === 'pass') {
                const Percent = Math.round(parseInt(Character[0].Stats.Pass) + 1 * 100/parseInt(Character[0].Stats.Smash));
                const Passes = parseInt(Character[0].Stats.Pass) + 1;
                await CharacterModel.updateOne({ Id: Character[0].Id }, { $set: { 'Stats.Pass': Passes }});
                const embed = new MessageEmbed()
                    .setColor('2f3136')
                    .setTitle(Character[0].Name)
                    .setURL(Character[0].Url)
                    .setDescription(`${Percent}% of people decided to pass ${Character[0].Name}\n**Series**: ${Character[0].Series.Title}`) 
                    .setImage(Character[0].Image)
                    .setFooter(`${button.clicker.user.username} chose to pass ${Character[0].Name}`)
                return message.edit({ embed: embed, component: OptionsDisabled })
            }
        });
    })
};

module.exports.help = {
    name: 'smp',
    aliases: ['smp'],
    category: 'Admin',
};