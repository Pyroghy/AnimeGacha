const { Client, Collection } = require('discord.js');
const chalk = require('chalk');
require('dotenv').config();
const bot = new Client();
const fs = require('fs');

bot.commands = new Collection();
bot.aliases = new Collection();

fs.readdirSync(`./Source/Events/`).forEach(dirs => {
	const events = fs.readdirSync(`./Source/Events/${dirs}/`).filter(files => files.endsWith('.js'));
	for(const file of events) { 
		if(file === 'cooldown.js') {
			console.log(chalk.green(`Loaded event ${chalk.bold('cooldown')}`));
			continue;
		}
		const event = require(`../Source/Events/${dirs}/${file}`);
		const eventName = file.slice(0, -3);
		bot.on(eventName, event.bind(null, bot));
        console.log(chalk.green(`Loaded event ${chalk.bold(eventName)}`));
	}
});

fs.readdirSync(`./Source/Commands/`).forEach(dirs => {
	const commands = fs.readdirSync(`./Source/Commands/${dirs}/`).filter(files => files.endsWith('.js'));
	for(const file of commands) {
		const command = require(`../Source/Commands/${dirs}/${file}`);
		if(command.help.name) {
			bot.commands.set(command.help.name, command);
			console.log(chalk.green(`Loaded command ${chalk.bold(command.help.name)}`));
		}
        else {
            console.log(chalk.red(`The command ${chalk.bold(command.help.name)} was not loaded`));
			continue;
		}
		if(command.help.aliases) {
			command.help.aliases.forEach(alias => {
				bot.aliases.set(alias, command.help.name);
			});
		}
	}
});

bot.login(process.env.TOKEN)