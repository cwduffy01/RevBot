const Discord = require("discord.js");

module.exports = {
	name: 'available',
	description: 'Informs the user of the subjects from which courses can be added',
    aliases: ["available_subjects"],
	execute(message, args) {
        const subjectDict = require("../../subjects.json");

        // extract category names from dictionary
        subjectAcronyms = Object.keys(subjectDict);
        var subjectTitles = [];
        for (acronym of subjectAcronyms) {
            subjectTitles.push(acronym.toUpperCase() + " - " + subjectDict[acronym]["subjectName"]);
        }
        subjectTitles.sort();

        const reply = new Discord.MessageEmbed()
            .setColor("#800000")
            .setTitle(`You can add courses from the following subjects:`)
            .setDescription(subjectTitles.join('\n'))
            .addField("\u200b", "Tag a moderator to request additional subjects!")
            .setAuthor(`Reply to ${message.author.tag}`, message.author.avatarURL(), message.url)
            .setTimestamp();
        message.channel.send(reply);
	},
};