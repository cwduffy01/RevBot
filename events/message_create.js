const Discord = require("discord.js");
const fs = require("fs");

module.exports = {
	name: 'messageCreate',
	execute(message, client) {
        if (message.content.startsWith(client.prefix) && !message.author.bot) {
            const args = message.content.slice(client.prefix.length).trim().split(/[\s-,]+/g);	// split string by space to get args
            const commandName = args.shift().toLowerCase();		// command name is first in list
    
            const command = client.commands.get(commandName) || 
                            client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));	// get command by name/alias
    
            if (!command) return;	// break if command doesn't exist

            // handles the case in which the json files get deleted somehow

            ["subjects", "channels"].forEach(tok => {
                if (!fs.readdirSync('.').includes(`${tok}.json`)) {
                    fs.writeFile(`./${tok}.json`, "{}", (error) => {if (error) throw error;});
                }
            });
            
            // handles commands with required roles
            if (command.permissions) {
                let authorRoles = message.member.roles.cache.map(role => role.name);	// get role names
                let commonRoles = command.permissions.filter(element => authorRoles.includes(element))
                if (commonRoles.length === 0) return;
            }
    
            // handles no arguments when they are required
            if (command.args && args.length === 0) {
                const reply = new Discord.MessageEmbed()
                    .setColor("#800000")
                    .setTitle(`ERROR: No arguments were provided.`)
                    .setAuthor(options = {
                        name: `Reply to ${message.author.tag}`,
                        iconURL: message.author.avatarURL(),
                        url: message.url
                    })
                    .setTimestamp();
                if (command.usage) {
                    reply.setDescription(`Arguments must take the form: \`${client.prefix}${command.name} ${command.usage}\``);
                }
                message.channel.send({ embeds: [reply] });
                return;
            }
    
            try {
                command.execute(message, args);		// attempt to execute command
            } catch (error) {
                console.error(error);
                const reply = new Discord.MessageEmbed()
                    .setColor("#800000")
                    .setTitle(`ERROR: Sorry! I had trouble executing your command.`)
                    .setAuthor(options = {
                        name: `Reply to ${message.author.tag}`,
                        iconURL: message.author.avatarURL(),
                        url: message.url
                    })
                    .setTimestamp();
                message.channel.send({ embeds: [reply] });
            }
        }
	},
};