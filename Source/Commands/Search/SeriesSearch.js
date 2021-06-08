const { MessageButton, MessageActionRow } = require('discord-buttons');
const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');

module.exports.run = async(bot, message, args) => {
    const CharacterModel = mongoose.model('Characters');
    const MemberID = message.member.id;
    const SeriesName = args.join(' ');

    if(!SeriesName) {
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(`🔍 You must specify a series to look up!`)
        return message.channel.send(embed)
    }
    else {
        const SeriesSearch = await CharacterModel.aggregate([{ $search: { 'index': 'Search', 'text': { query: SeriesName, path: 'Series.Title' }}}]).collation({ locale: 'en', strength: 2 }).sort({ score: { $meta: "textScore" }});
        
        if(!SeriesSearch[0]) {
            const embed = new MessageEmbed()
                .setColor('2f3136')
                .setTitle(`🔍 There is no series called \`${SeriesName}\`!`)
            return message.channel.send(embed)
        }

        const SeriesChar = await CharacterModel.find({ 'Series.Title': SeriesSearch[0].Series.Title }).collation({ locale: 'en', strength: 2 }).sort({ Name: 1 });
        const CharPerPage = 20;
        const CharacterList = SeriesChar.map((Character, index) => `${index + 1}). **${Character.Name}**`)
        let page = 0;
        const previous = new MessageButton().setStyle('blurple').setLabel('Previous').setID('previous')
        const next = new MessageButton().setStyle('blurple').setLabel('Next').setID('next')
        const Pages = new MessageActionRow().addComponent(previous).addComponent(next);
        const embed = new MessageEmbed()
            .setColor('2f3136')
            .setTitle(SeriesSearch[0].Series.Title)
            .setDescription(CharacterList.slice((page) * CharPerPage, CharPerPage).join('\n'))
            .setFooter(`Page ${page + 1}/${Math.ceil(CharacterList.length/CharPerPage)} [${CharacterList.length} Characters]`)
        let Send;
        if(CharacterList.length > CharPerPage) { Send =  { embed: embed, component: Pages } }
        if(CharacterList.length < CharPerPage) { Send =  embed }
        message.channel.send(Send).then(async(BotMessage) => {
            const MessageFilter = message => message;
            const ButtonFilter = button => button.clicker.user.id === MemberID;
            const MessageCollector = BotMessage.channel.createMessageCollector(MessageFilter, { time: 120000 });
            const ButtonCollector = BotMessage.createButtonCollector(ButtonFilter, { time: 120000 });

            ButtonCollector.on('collect', async(button) => {
                if(button.id === 'previous') { page -= 1 }
                if(button.id === 'next') { page += 1 }
                if(page < 0) { page = Math.floor(CharacterList.length/CharPerPage) }
                if(page > Math.floor(CharacterList.length/CharPerPage)) { page = 0 }

                embed.setColor('2f3136')
                embed.setTitle(SeriesSearch[0].Series.Title)
                embed.setDescription(CharacterList.slice(page * CharPerPage, (page + 1) * CharPerPage).join('\n'))
                embed.setFooter(`Page ${page + 1}/${Math.ceil(CharacterList.length/CharPerPage)} [${CharacterList.length} Characters]`)
                button.defer();
                return BotMessage.edit({ embed: embed, component: Pages })
            })
            MessageCollector.on('collect', message => {
                const I = message.content - 1;

                if(SeriesChar[I]) {
                    embed.setColor('2f3136')
                    embed.setTitle(SeriesChar[I].Name)
                    embed.setURL(SeriesChar[I].Url)
                    embed.setDescription(`**Series**: ${SeriesChar[I].Series.Title}\n**Gender**: ${SeriesChar[I].Gender}`)
                    embed.setThumbnail(SeriesChar[I].Image)
                if(SeriesChar[I].Owner === 'null') {
                    embed.setFooter(`Is not claimed by anyone`)
                } else {
                    const owner = bot.users.cache.find(owner => owner.id === SeriesChar[I].Owner)
                    embed.setFooter(`Owned By ${owner.username}`, owner.avatarURL())
                }
                    message.delete(); ButtonCollector.stop(); MessageCollector.stop();
                    return BotMessage.edit(embed)
                }
                if(message.content.startsWith('!')) {
                    MessageCollector.stop();
                }
            });
        })
    }
};

module.exports.help = {
    name: "seriessearch",
    aliases: ["ss"],
    description: "Search for a series.",
    category: "Search",
};