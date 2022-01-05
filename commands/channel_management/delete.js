const Discord = require("discord.js");
const FileSystem = require("fs");

module.exports = {
    name: "delete",
    description: "Deletes the channels for the specified courses",
    args: true,
    usage: "<course1> <course2> <course3>...; arguments can take the form <subject_acronym>, <subject_acronym> <course_number>, "
           + "<subject_acronym> <course_number>-<section_number>. All channels that contain an argument will be deleted. Use \"all\" "
           + "to delete all course channels and categories.",
    aliases: ["delete_course", "delete_courses"],
    permissions: ["Mod"],
    async execute(message, args) {
        const subjectDict = require("../../subjects.json");
        const channelsDict = require("../../channels.json");

        // parses arguments into an array of groups of arguments
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

        for (group of argGroups) {
            const subjectAcronym = group[0];
            const channelName = group.join("-");
            const categoryName = subjectAcronym.toUpperCase() + " - " + subjectDict[subjectAcronym]["subjectName"];
            var textChannels = channelsDict[categoryName]["text"];  // text channels in specified category

            // marks channel in argGroup for deletion
            var channelsToDelete = [];
            for (textChannelName of textChannels) {
                if (textChannelName.includes(channelName)) {
                    channelsToDelete.push(textChannelName);
                }
            }

            // removes deleted channels from channel dictionary
            textChannels = textChannels.filter(channelName => { return !channelsToDelete.includes(channelName); })
            channelsDict[categoryName]["text"] = textChannels;

            // if all text channels have been deleted
            if (textChannels.length === 0) {
                channelsToDelete.push(categoryName);    // delete category
                channelsToDelete.push(...channelsDict[categoryName]["voice"])   // delete voice channels
                delete channelsDict[categoryName];
            }

            // delete all channels marked for deletion
            for (deleteChannel of channelsToDelete) {
                const channel = message.guild.channels.cache.find(channel => channel.name === deleteChannel);
                await channel.delete();
            }
        }

        const json_string = JSON.stringify(channelsDict, null, 4);
        FileSystem.writeFile("./channels.json", json_string, (error) => {
            if (error) throw error;
        });

        const reply = new Discord.MessageEmbed()
            .setColor("#800000")
            .setTitle(`Channels have been removed!`)
            .setAuthor(options = {
                name: `Reply to ${message.author.tag}`,
                iconURL: message.author.avatarURL(),
                url: message.url
            })
            .setTimestamp();
        if (invalidArgs.length > 0) { reply.addField(name="Invalid Arguments:", value=invalidArgs.join(", "), inline=true); }
        
        message.channel.send({ embeds: [reply] });
    }
}