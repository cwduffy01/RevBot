const Discord = require("discord.js");

module.exports = {
	name: "guildBanAdd",
	execute(ban) {
        const logsChannel = ban.guild.channels.cache.find(channel => channel.id === ban.client.logsChannelID);

        const reply = new Discord.MessageEmbed()
            .setColor("#FF0000")
            .setTitle(`@${ban.user.tag} was Banned`)
            .setThumbnail(ban.user.avatarURL())
            .setTimestamp();
        logsChannel.send({ embeds: [reply] });
	},
};