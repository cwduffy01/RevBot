const Discord = require("discord.js");

module.exports = {
    name: "drop",
    description: "Removes a user's access to the text channel for a specific course",
    args: true,
    usage: "<course1> <course2> <course3>...; arguments take the form <subject_acronym> <course_number> or "
           + "<subject_acronym> <course_number>-<section_number>; use \"all\" to remove access to all channels",
    aliases: ["drop_course", "drop_courses"],
    async execute(message, args) {
        const channelsDict = require("../../channels.json");

        const argGroups = [];
        const invalidArgs = [];
        var tempArr = [];
        const acronymRe = /^[a-z]{4}$/i;  // searches for a 4-letter token
        const numberRe = /^[1-9]\d{2}$/;  // searches for 3-digit integers that don't start with 0
        if (args[0].toLowerCase() === "all") {  // adds all subject acronyms to argGroups
            for (categoryName of Object.keys(channelsDict)) {
                argGroups.push([categoryName.split(" ").shift().toLowerCase()]);
            }
        }
        else {
            for (let i = 0; i < args.length; i++) {
                if (numberRe.test(args[i])) {   // add 3-digit numbers to group
                    tempArr.push(args[i]);
                }
                else if (acronymRe.test(args[i])) {     // acronym marks new group
                    argGroups.push(tempArr);
                    tempArr = [];
                    tempArr.push(args[i]);
                }
                else {
                    invalidArgs.push(args[i]);
                }
            }
            argGroups.push(tempArr);
            argGroups.shift();  // first group has no acryonyms, which are required
        }

        for (var group of argGroups) {
            const subjectAcronym = group[0];
            const courseNumber = group[1];
            const sectionNumber = group[2];

            // find category specified in argGroup
            const categoryChannel = message.guild.channels.cache.find(channel => channel.type === "GUILD_CATEGORY" && 
                                                                                 channel.name.includes(subjectAcronym.toUpperCase()));

            if (categoryChannel) {
                var invalid = true;
                const accessedChannels = categoryChannel.children.filter(channel => channel.permissionsFor(message.author).has("VIEW_CHANNEL"));
                const courseChannelName = subjectAcronym + "-" + courseNumber;
                // remove permissions from all channels specified in arguments
                for ([key, channel] of categoryChannel.children) {
                    if (args[0].toLowerCase() === "all" || channel.name.includes(courseChannelName)) {
                        await channel.permissionOverwrites.delete(message.author);
                        invalid = false;
                        accessedChannels.delete(channel.id);
                    }
                }
                if (invalid) {  // true if no channels in category have perms for the user
                    invalidArgs.push(...group);
                }

                const accessedTextChannels = accessedChannels.filter(channel => channel.type === "GUILD_TEXT");
                if (accessedTextChannels.size === 0) {  // if user has access to 0 text channels in category
                    for ([key, channel] of accessedChannels) {  // remove access from voice channels as well
                        await channel.permissionOverwrites.delete(message.author);
                    }
                }
            }
            else {
                invalidArgs.push(...group); 
            }
        }

        const reply = new Discord.MessageEmbed()
            .setColor("#800000")
            .setTitle(`Courses have been removed from your sidebar!`)
            .setAuthor(options = {
                name: `Reply to ${message.author.tag}`,
                iconURL: message.author.avatarURL(),
                url: message.url
            })
            .setTimestamp();
        if (args[0].toLowerCase() !== "all" && invalidArgs.length > 0) { 
            reply.addField(name="Invalid Arguments:", value=invalidArgs.join(", "), inline=true); 
        }
        message.channel.send({ embeds: [reply] });
    }
}