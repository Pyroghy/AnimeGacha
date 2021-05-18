const { MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const chalk = require('chalk');

module.exports.run = (bot, message, args) => {
    return message.channel.send('Trade command is currently unavailable')
};

module.exports.help = {
    name: "trade",
    aliases: ["t"],
    description: "Trade a character.",
    category: "Inventory",
};