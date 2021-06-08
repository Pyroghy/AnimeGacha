const { MessageButton, MessageActionRow } = require('discord-buttons');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const Member = message.member;
    const Wewber = message.mentions.members.first();
    const MemberGive = args.slice(1).join(' ').split(', ');
    const MCharacterGive = await CharacterModel.find({ Owner: Member.id, Name: MemberGive }).collation({ locale: 'en', strength: 2 }).sort({ Name: 1 });
    const MCharacterList = MCharacterGive.map((Character) => Character.Name);
    const MExists = await CharacterModel.find({ Name: MemberGive }).collation({ locale: 'en', strength: 2 });
    const MExistsList = MExists.map((Character) => Character.Name);

    if(!Wewber) {
        const embed = new MessageEmbed()
            .setColor('FF0000')
            .setTitle(`You need to specify the Member that you want to trade with!`)
        return message.channel.send(embed)
    }
    if(Wewber.id === Member.id) {
        const embed = new MessageEmbed()
            .setColor('FF0000')
            .setTitle(`You cannot trade with yourself!`)
        return message.channel.send(embed)
    }
    if(Wewber.user.bot) {
        const embed = new MessageEmbed()
            .setColor('EED202')
            .setTitle(`You cannot gift characrers to bots!`)
        return message.channel.send(embed)
    }
    if(!args.slice(1).join(' ')) {
        const embed = new MessageEmbed()
            .setColor('EED202')
            .setTitle(`You need to specify the character(s) you want to trade!`)
        return message.channel.send(embed)
    }
    if(MemberGive.length > MExistsList.length) {
        const embed = new MessageEmbed()
            .setColor('EED202')
            .setTitle(`🔍 You specified a character that doesnt exist!`)
        return message.channel.send(embed)
    }
    if(MemberGive.length > MCharacterList.length) {
        const embed = new MessageEmbed()
            .setColor('EED202')
            .setTitle(`🔍 You specified a character that you dont own!`)
        return message.channel.send(embed)
    }
    else {
        message.delete()
        const MemberOffer = MCharacterList.join(', ').replace(/, ([^,]*)$/, '\` and \`$1');
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .addFields({ name: `**${Member.user.username}'s Offerings**`, value: `\`${MemberOffer}\``, inline: false })            
            .setFooter('Type -t [character(s)] to trade or -c to cancel the trade')
        message.channel.send(`Hey ${Wewber}, **${Member.user.username}** wants to trade with you!`, embed).then(BotMessage => {
            const MessageFilter = message => message.member.id === Member.id || message.member.id === Wewber.id;
            const MessageCollector = message.channel.createMessageCollector(MessageFilter);
            
            MessageCollector.on('collect', async(message) => {
                if(message.member.id === Wewber.id) {
                    const argz = message.content.slice(1).trim().split(' ');
                    if(message.content.startsWith('-t')) {
                        const WewberGive = argz.slice(1).join(' ').split(', ');
                        const WCharacterGive = await CharacterModel.find({ Owner: Wewber.id, Name: WewberGive }).collation({ locale: 'en', strength: 2 }).sort({ Name: 1 });
                        const WCharacterList = WCharacterGive.map((Character) => Character.Name);
                        const WExists = await CharacterModel.find({ Name: WewberGive }).collation({ locale: 'en', strength: 2 });
                        const WExistsList = WExists.map((Character) => Character.Name);

                        if(!argz.slice(1).join(' ')) {
                            const embed = new MessageEmbed()
                                .setColor('EED202')
                                .setTitle(`You need to specify the character(s) you want to trade!`)
                            return message.channel.send(embed)
                        }
                        if(WewberGive.length > WExistsList.length) {
                            const embed = new MessageEmbed()
                                .setColor('EED202')
                                .setTitle(`🔍 You specified a character that doesnt exist!`)
                            return message.channel.send(embed)
                        }
                        if(WewberGive.length > WCharacterList.length) {
                            const embed = new MessageEmbed()
                                .setColor('EED202')
                                .setTitle(`🔍 You specified a character that you dont own!`)
                            return message.channel.send(embed)
                        }
                        else {
                            message.delete()
                            const WewberOffer = WCharacterList.join(', ').replace(/, ([^,]*)$/, '\` and \`$1');
                            const Confirm = new MessageButton().setStyle('green').setLabel('Confirm').setID('confirm')
                            const Unconfirm = new MessageButton().setStyle('red').setLabel('Unconfirm').setID('unconfirm')
                            const Options = new MessageActionRow().addComponent(Confirm).addComponent(Unconfirm);
                            embed.setColor('2f3136')
                            embed.setTitle('Trade Offer')
                            embed.fields[0] = { name: `❌ _ _**${Member.user.username}'s Offerings**`, value: `\`${MemberOffer}\``, inline: false }
                            embed.addFields({ name: `❌ _ _**${Wewber.user.username}'s Offerings**`, value: `\`${WewberOffer}\``, inline: false })
                            embed.setFooter('Type -c to cancel the trade')
                            BotMessage.edit({ content: null, embed: embed, component: Options }).then(message => {
                                const ButtonFilter = button => button.clicker.user.id === Member.id || button.clicker.user.id === Wewber.id;
                                const ButtonCollector = message.createButtonCollector(ButtonFilter, { time: 120000 });
                                const clicked = ButtonCollector.users;
                                var AcceptCount = 0;
                            
                                ButtonCollector.on('collect', async(button) => { button.defer();
                                    const MemberClicker = clicked.has(Member.id)
                                    const WewberClicker = clicked.has(Wewber.id)
                    
                                    if(button.id === 'confirm' && clicked.size !== AcceptCount + 1) { return AcceptCount = clicked.size }
                                    if(button.id === 'unconfirm' && clicked.size === AcceptCount + 1) { AcceptCount = clicked.size }
                                    if(button.id === 'confirm') { 
                                        AcceptCount += 1;
                        
                                        if(button.clicker.user.id === Member.id) { 
                                            embed.fields[0] = { name: `✅ _ _**${Member.user.username}'s Offerings**`, value: `\`${MemberOffer}\``, inline: false }
                                        }
                                        if(button.clicker.user.id === Wewber.id) {             
                                            embed.fields[1] = { name: `✅ _ _**${Wewber.user.username}'s Offerings**`, value: `\`${WewberOffer}\``, inline: false } 
                                        }
                                        message.edit({ embed: embed, component: Options })
                                    }
                                    if(button.id === 'unconfirm') { 
                                        AcceptCount -= 1; clicked.delete(button.clicker.user.id);
                        
                                        if(button.clicker.user.id === Member.id) { 
                                            embed.fields[0] = { name: `❌ _ _**${Member.user.username}'s Offerings**`, value: `\`${MemberOffer}\``, inline: false }
                                        }
                                        if(button.clicker.user.id === Wewber.id) {             
                                            embed.fields[1] = { name: `❌ _ _**${Wewber.user.username}'s Offerings**`, value: `\`${WewberOffer}\``, inline: false } 
                                        }
                                        message.edit({ embed: embed, component: Options })
                                    }
                                    if(AcceptCount < 0) { AcceptCount = 0 }
                                    if(AcceptCount > 2) { AcceptCount = 2 }
                                    if(MemberClicker && WewberClicker && AcceptCount === 2) {
                                        var Time = 3;
                                        const interval = setInterval(() => {
                                            const Timer = Math.abs(Time--)

                                            if(Timer === 0) { 
                                                clearInterval(interval); 
                                                return ButtonCollector.stop('completed') 
                                            }

                                            embed.setFooter(`Trade ending in ${Timer === 1 ? `${Timer} second` : `${Timer} seconds`}`)
                                            message.edit({ embed: embed, component: Options })
                                        }, 1000);
                                    }
                                });
                                ButtonCollector.on('end', (collected, reason) => {
                                    MessageCollector.stop();
                                    if(reason === 'time') { 
                                        embed.setColor('FF0000')
                                        embed.setTitle('Trade Time Limit Expired')
                                        embed.setFooter('')
                                        return message.edit(embed)
                                    }
                                    if(reason === 'completed') {
                                        MCharacterGive.forEach(async(Char) => await CharacterModel.updateMany({ Owner: Member.id, Id: Char.Id }, { $set: { Owner: Wewber.id }}))
                                        WCharacterGive.forEach(async(Char) => await CharacterModel.updateMany({ Owner: Wewber.id, Id: Char.Id }, { $set: { Owner: Member.id }}))
                                        console.log(chalk.green(`${chalk.bold(Member.user.username)} traded ${chalk.bold(MemberOffer).replaceAll('`', '')} to ${chalk.bold(Wewber.user.username)}`))
                                        console.log(chalk.green(`${chalk.bold(Wewber.user.username)} traded ${chalk.bold(WewberOffer).replaceAll('`', '')} to ${chalk.bold(Member.user.username)}`))
                                        embed.setColor('00FF00') 
                                        embed.setTitle('Trade Completed!')
                                        embed.fields[0] = { name: `✅ _ _**${Member.user.username}'s Offerings**`, value: `\`${MemberOffer}\``, inline: false }
                                        embed.fields[1] = { name: `✅ _ _**${Wewber.user.username}'s Offerings**`, value: `\`${WewberOffer}\``, inline: false }
                                        embed.setFooter('')
                                        return message.edit(embed)
                                    }
                                })
                            })
                        }
                    }
                }
                if(message.content.startsWith('-c')) { MessageCollector.stop('cancel') }
            });
            MessageCollector.on('end', (collected, reason) => {
                if(reason === 'cancel') {
                    embed.setColor('FF0000')
                    embed.setTitle('Trade Cancelled')
                    embed.setFooter('')
                    return message.edit(embed)
                }
            });
        })
    }
};

module.exports.help = {
    name: "trade",
    aliases: ["t"],
    description: "Trade a character.",
    category: "Inventory",
};