const fs = require('fs');
const Discord = require("discord.js");
const { prefix, token } = require("./../../config.json");

module.exports = {
	name: 'help',
	description: 'Informs the user of the commands they can use, their purposes, and how to use them',
    usage: ".help <command>; .help for all commands",
	execute(message, args) {
        const reply = new Discord.MessageEmbed()
            .setColor("#800000")
            .setTitle(`Commands:`)
            .setAuthor(options = {
                name: `Reply to ${message.author.tag}`,
                iconURL: message.author.avatarURL(),
                url: message.url
            })
            .setTimestamp();

        const commandFolders = fs.readdirSync('./commands');
        for (const folder of commandFolders) {	// iterate through command directories
            // get all javascript files in directory
            const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {	// iterate through commands in directory
                const command = require(`./../${folder}/${file}`);

                // handles aliases
                if (args.length > 0) {  // if specific command is specified
                    if (command.name !== args[0].toLowerCase()) {
                        if (!command.aliases || !command.aliases.includes(args[0].toLowerCase())) {
                            continue;
                        }
                    }
                }

                // gather command information
                var description = "";
                if (command.description) { description += "Description: " + command.description + "\n"; }
                if (command.usage) { description += "Usage: \`" + command.usage + "\`\n"; }
                if (command.aliases) { description += "Aliases: " + command.aliases.join(", ") + "\n"; }
                if (command.permissions) { description += "Roles: " + command.permissions.join(", ") + "\n"; }

                // handles commands with certain permissions (hides restricted commands from users who can't use them)
                if (command.permissions) {
                    let authorRoles = message.member.roles.cache.map(role => role.name);	// get role names;
                    let commonRoles = command.permissions.filter(element => authorRoles.includes(element))
                    if (commonRoles.length === 0) continue;

                    if (args.length > 0) {  // sends restrcied command info to user via dm
                        reply.addField(prefix + command.name, description);
                        message.author.send(reply);
                        return;
                    }
                }
                
                reply.addField(prefix + command.name, description);
                if (args.length > 0) {  // exits command if argument has been found
                    message.channel.send({ embeds: [reply] });
                    return;
                }
            }
        }

        if (reply.fields.length > 0) {  // sends sorted list to user via dm
            reply.fields.sort((a, b) => (a.name > b.name) ? 1 : -1);
            message.author.send(reply);
        }
        else {  // handles commands that don't exist/cannot be used
            const errorReply = new Discord.MessageEmbed()
                .setColor("#800000")
                .setTitle(`ERROR: You cannot use \`${args[0].toLowerCase()}\`, or it doesn't exist`)
                .setAuthor(options = {
                    name: `Reply to ${message.author.tag}`,
                    iconURL: message.author.avatarURL(),
                    url: message.url
                })
                .setTimestamp();
            message.channel.send(errorReply);
        }
	},
};