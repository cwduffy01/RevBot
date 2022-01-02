const Discord = require("discord.js");

module.exports = {
	name: "guildMemberAdd",
	execute(member, client) {
        const logsChannel = member.guild.channels.cache.find(channel => channel.id === client.logsChannelID);

        // calculate difference between now and account creation date in years, days, hours...
        var diff = Math.floor((Date.now() - member.user.createdAt) / 1000);
        const years = Math.floor(diff / (60 * 60 * 24 * 365));
        diff -= years * 60 * 60 * 24 * 365;
        const days = Math.floor(diff / (60 * 60 * 24));
        diff -= days * 60 * 60 * 24;
        const hours = Math.floor(diff / (60 * 60));
        diff -= hours * 60 * 60;
        const minutes = Math.floor(diff / 60);
        diff -= minutes * 60;
        const seconds = diff;

        var accountAge = "";
        if (years > 0) { accountAge += years + "y " };
        if (days > 0) { accountAge += days + "d " };
        if (hours > 0) { accountAge += hours + "h " };
        if (minutes > 0) { accountAge += minutes + "m " };
        accountAge += seconds + "s ";

        const reply = new Discord.MessageEmbed()
            .setColor("#00FF00")
            .setTitle(`@${member.user.tag} Joined the Server!`)
            .setThumbnail(member.user.avatarURL())
            .setTimestamp();

        if (accountAge) { reply.addField("Account Age:", accountAge); }
        
        logsChannel.send(reply);
	},
};