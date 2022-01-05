const Discord = require("discord.js");

module.exports = {
	name: 'messageUpdate',
	execute(oldMessage, newMessage, client) {
        if (!message.author.bot) {
            const logsChannel = oldMessage.guild.channels.cache.find(channel => channel.id === client.logsChannelID);

            const reply = new Discord.MessageEmbed()
                .setColor("#FFFF00")
                .setTitle(`Message Edited in #${newMessage.channel.name}`)
                .setAuthor(options = {
                    name: `Message by @${newMessage.author.tag}`,
                    iconURL: newMessage.author.avatarURL(),
                    url: newMessage.url
                })
                .setTimestamp();
    
            if (oldMessage.content) { reply.addField("Original:", oldMessage.content); }
            if (newMessage.content) { reply.addField("Edited:", newMessage.content); }
    
            logsChannel.send({ embeds: [reply] });
        }
	},
};