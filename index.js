const fs = require('fs');
const Discord = require("discord.js");
const { prefix, token, logsChannelID } = require("./config.json");

const { Client, Intents } = require('discord.js');
const it = [
	Intents.FLAGS.GUILDS,
	Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.DIRECT_MESSAGES,
	Intents.FLAGS.GUILD_BANS,
	Intents.FLAGS.GUILD_MEMBERS
]
const client = new Client({ intents: it });

client.commands = new Discord.Collection();
client.prefix = prefix;
client.logsChannelID = logsChannelID;

// initiates the objects that store subject and channel information into files
/* Developer's Note: There is a reason why I have decided to use files instead
 *  of the built-in custom client variables in the discord API. When I ran this 
 *  bot on a web server, it would periodically delete all of the information
 *  stored in these objects. To avoid that, I am using files as a bandaid solution.
 *  It should not be a huge issue considering there is not a lot of information to 
 *  read and write from the files, and there are not very many users in the server.
 */
["subjects", "channels"].forEach(tok => {
	if (!fs.readdirSync('.').includes(`${tok}.json`)) {
		fs.writeFile(`./${tok}.json`, "{}", (error) => {if (error) throw error;});
	}
});

// load all commands from all command files
const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {	// iterate through command directories
	// get all javascript files in directory
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {	// iterate through commands in directory
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name, command);		// set all commands in collection
	}
}

// load all events from all event files using the same process as above
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

client.login(token);