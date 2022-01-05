const Discord = require("discord.js");

module.exports = {
	name: "guildBanAdd",
	execute(guild, user, client) {
        const logsChannel = guild.channels.cache.find(channel => channel.id === client.logsChannelID);

        const reply = new Discord.MessageEmbed()
            .setColor("#FF0000")
            .setTitle(`@${user.tag} was Banned`)
            .setThumbnail(user.avatarURL())
            .setTimestamp();
        logsChannel.send({ embeds: [reply] });
	},
};