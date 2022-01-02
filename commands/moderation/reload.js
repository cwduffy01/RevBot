const fs = require("fs");
const Discord = require("discord.js");

module.exports = {
	name: 'reload',
	description: 'Reloads the code for the specified command',
	permissions: ["Mod"],
	args: true,
	execute(message, args) {
		const commandName = args[0].toLowerCase();
		const command = message.client.commands.get(commandName)
			|| message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));	// gets command by name or alias

		if (!command) {		// handles commands that don't exist
			const reply = new Discord.MessageEmbed()
				.setColor("#800000")
				.setTitle(`ERROR: There is no command with name or alias \`${commandName}\``)
				.setAuthor(`Reply to ${message.author.tag}`, message.author.avatarURL(), message.url)
				.setTimestamp();
			message.channel.send(reply);
			return;
		}

		const commandFolders = fs.readdirSync('./commands');
		const folderName = commandFolders.find(folder => fs.readdirSync(`./commands/${folder}`).includes(`${command.name}.js`));
	
		delete require.cache[require.resolve(`../${folderName}/${command.name}.js`)];

		try {	// reloads command's code
			const newCommand = require(`../${folderName}/${command.name}.js`);
			message.client.commands.set(newCommand.name, newCommand);
			const reply = new Discord.MessageEmbed()
				.setColor("#800000")
				.setTitle(`Command \`${newCommand.name}\` was reloaded!`)
				.setAuthor(`Reply to ${message.author.tag}`, message.author.avatarURL(), message.url)
				.setTimestamp();
			message.channel.send(reply);
		} catch (error) {	// handles errors thrown by code
			console.error(error);
			const reply = new Discord.MessageEmbed()
				.setColor("#800000")
				.setTitle(`ERROR: I had trouble reloading that command!`)
				.setDescription(`Command Name: \`${command.name}\`:\nError: \`${error.message}\``)
				.setAuthor(`Reply to ${message.author.tag}`, message.author.avatarURL(), message.url)
				.setTimestamp();
			message.channel.send(reply);
		}
	},
};