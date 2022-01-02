const Discord = require("discord.js");

module.exports = {
	name: 'messageUpdate',
	execute(oldMessage, newMessage, client) {
        const logsChannel = oldMessage.guild.channels.cache.find(channel => channel.id === client.logsChannelID);

        const reply = new Discord.MessageEmbed()
            .setColor("#FFFF00")
            .setTitle(`Message Edited in #${newMessage.channel.name}`)
            .setAuthor(`Message by @${newMessage.author.tag}`, newMessage.author.avatarURL(), newMessage.url)
            .setTimestamp();

        if (oldMessage.content) { reply.addField("Original:", oldMessage.content); }
        if (newMessage.content) { reply.addField("Edited:", newMessage.content); }

        logsChannel.send(reply);
	},
};