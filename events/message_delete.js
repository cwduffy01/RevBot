const Discord = require("discord.js");

module.exports = {
	name: 'messageDelete',
	execute(message, client) {
        const logsChannel = message.guild.channels.cache.find(channel => channel.id === client.logsChannelID);

        const reply = new Discord.MessageEmbed()
            .setColor("#FF0000")
            .setTitle(`Message Deleted in #${message.channel.name}`)
            .setAuthor(options = {
                name: `Message by @${message.author.tag}`,
                iconURL: message.author.avatarURL(),
                url: message.url
            })
            .setTimestamp();

        if (message.content) { reply.addField("Message:", message.content); }

        logsChannel.send({ embeds: [reply] });
	},
};