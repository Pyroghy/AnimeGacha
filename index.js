const { Client, Collection } = require('discord.js');
const chalk = require('chalk');
const bot = new Client({ intents: [ "GUILDS", "GUILD_MEMBERS", "GUILD_BANS", "GUILD_INTEGRATIONS", "GUILD_WEBHOOKS", "GUILD_INVITES", "GUILD_PRESENCES", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "DIRECT_MESSAGES", "DIRECT_MESSAGE_REACTIONS" ]});
require('dotenv').config();
const fs = require('fs');

bot.commands = new Collection();
bot.aliases = new Collection();

fs.readdirSync('./commands/').forEach(dirs => {
	const commands = fs.readdirSync(`./commands/${dirs}/`).filter(files => files.endsWith('.js'));

	for(const file of commands) {
		const command = require(`./commands/${dirs}/${file}`);

		if(command.config.name) {
			bot.commands.set(command.config.name, command);
			console.log(chalk.green(`Loaded command ${chalk.bold(command.config.name)}`));
		}
		if(command.config.aliases) {
			command.config.aliases.forEach(alias => bot.aliases.set(alias, command.config.name));
		}
	}
});

const events = fs.readdirSync(`./events/`).filter(files => files.endsWith('.js'));

for(const file of events) {
	const event = require(`./events/${file}`);
	const eventName = file.split(".")[0];

	bot.on(eventName, event.bind(null, bot));
	console.log(chalk.green(`Loaded event ${chalk.bold(eventName)}`));
}

bot.login(process.env.TOKEN)