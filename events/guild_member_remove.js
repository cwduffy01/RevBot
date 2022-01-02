const Discord = require("discord.js");

module.exports = {
	name: "guildMemberRemove",
	execute(member, client) {
        const logsChannel = member.guild.channels.cache.find(channel => channel.id === client.logsChannelID);

        // calculates difference between now and server join date in years, days, hours...
        var diff = Math.floor((Date.now() - member.joinedAt) / 1000);
        const years = Math.floor(diff / (60 * 60 * 24 * 365));
        diff -= years * 60 * 60 * 24 * 365;
        const days = Math.floor(diff / (60 * 60 * 24));
        diff -= days * 60 * 60 * 24;
        const hours = Math.floor(diff / (60 * 60));
        diff -= hours * 60 * 60;
        const minutes = Math.floor(diff / 60);
        diff -= minutes * 60;
        const seconds = diff;

        var serverAge = "";
        if (years > 0) { serverAge += years + "y " };
        if (days > 0) { serverAge += days + "d " };
        if (hours > 0) { serverAge += hours + "h " };
        if (minutes > 0) { serverAge += minutes + "m " };
        serverAge += seconds + "s ";

        // roles of user, excluding everyone
        const roles = member.roles.cache.map(role => role.name).filter(roleName => roleName !== "@everyone");

        const reply = new Discord.MessageEmbed()
            .setColor("#FF8800")
            .setTitle(`@${member.user.tag} Left the Server`)
            .setThumbnail(member.user.avatarURL())
            .setTimestamp();

        if (serverAge) { reply.addField("Server Age:", serverAge); }
        if (member.nickname) { reply.addField("Nickname:", member.nickname); }
        if (roles.length > 0) { reply.addField("Roles:", roles.join(", ")); }

        logsChannel.send(reply);
	},
};