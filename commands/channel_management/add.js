const Discord = require("discord.js");
const FileSystem = require("fs");

module.exports = {
    name: "add",
    description: "Grants the user access to the text channel for a specific course",
    args: true,
    usage: ".add <course1> <course2> <course3>...; arguments take the form <subject_acronym> <course_number>-<section_number>",
    aliases: ["add_course", "add_courses"],
    async execute(message, args) {
        const subjectDict = require("../../subjects.json");
        const channelsDict = require("../../channels.json");

        const categoriesToSort = [];
        var sortCategories = false;

        // gets channel by channel name, but creates one if it doesn't exist
        const getChannel = async (channelName, type, parent=undefined, description=undefined) => {
            var channel = message.guild.channels.cache.find(channel => channel.name === channelName);
            if (!channel) {     // create channel
                channel = await message.guild.channels.create(channelName, options={ 
                    type: type,
                    permissionOverwrites: [
                        {
                            id: message.guild.roles.everyone.id,    // private channel
                            deny: ['VIEW_CHANNEL'],
                        },
                    ],
                });

                if (description) { await channel.setTopic(description); }
                if (parent) { 
                    await channel.setParent(parent); 
                    categoriesToSort.push(parent);  // keeps track of categroies with new channels
                }

                // updates dictionary to keep track of course channels
                if (type === "GUILD_CATEGORY") {
                    channelsDict[channelName] = {
                        "text": [],
                        "voice": []
                    }; 
                    sortCategories = true;
                }
                else if (type === "GUILD_TEXT") { channelsDict[parent.name]["text"].push(channelName); }
                else { channelsDict[parent.name]["voice"].push(channelName); }
            }
            return channel;
        }

        // parses arguments into an array of groups of arguments
        const argGroups = [];
        const invalidArgs = [];
        var tempArr = [];
        const acronymRe = /^[a-z]{4}$/i;  // searches for a 4-letter token
        const numberRe = /^[1-9]\d{2}$/;  // searches for 3-digit integers that don't start with 0
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

        for (group of argGroups) {
            const subjectAcronym = group[0];
            const courseNumber = group[1];
            const sectionNumber = group[2];

            if (!courseNumber) {    // a user cannot add just a subject
                invalidArgs.push(subjectAcronym);
                continue;
            }

            if (!Object.keys(subjectDict).includes(subjectAcronym) ||
                !Object.keys(subjectDict[subjectAcronym]["courses"]).includes(courseNumber)) {
                    invalidArgs.push(...group);
                    continue;
                }   // subjects or courses that don't exist are invalid

            const categoryName = subjectAcronym.toUpperCase() + " - " + subjectDict[subjectAcronym]["subjectName"];
            const vc1Name = subjectAcronym.toUpperCase() + " VC1";
            const vc2Name = subjectAcronym.toUpperCase() + " VC2";
            const courseChannelName = subjectAcronym + "-" + courseNumber;

            // gets all channels
            const category = await getChannel(categoryName, "GUILD_CATEGORY");
            const vc1 = await getChannel(vc1Name, "GUILD_VOICE", category);
            const vc2 = await getChannel(vc2Name, "GUILD_VOICE", category);
            const courseTextChannel = await getChannel(courseChannelName, "GUILD_TEXT", category);

            // updates channel permissions for user
            await vc1.permissionOverwrites.create(message.author, {
                VIEW_CHANNEL: true
            });
            await vc2.permissionOverwrites.create(message.author, {
                VIEW_CHANNEL: true
            });
            await courseTextChannel.permissionOverwrites.create(message.author, {
                VIEW_CHANNEL: true
            });

            // does the same for the course section if it is included in args
            if (sectionNumber) {
                const courseDict = subjectDict[subjectAcronym]["courses"][courseNumber];
                const sectionChannelName = subjectAcronym + "-" + courseNumber + "-" + sectionNumber;
                const channelDescription = courseDict["courseName"] + ':\n' + courseDict["courseHours"] + '\n' + courseDict["courseDescription"];
                const sectionTextChannel = await getChannel(sectionChannelName, "text", category, channelDescription);
                await sectionTextChannel.updateOverwrite(message.author, {
                    VIEW_CHANNEL: true
                });
            }
        }    // update dictionary

        // sort channels in categories with new channels
        for (category of [...new Set(categoriesToSort)]) {
            let channels = category.children.filter(channel => channel.type === "text");
            let channelNames = channels.map(channel => channel.name).sort();
            for ([key, channel] of channels) {  // sorts alphabetically
                await channel.setPosition(channelNames.indexOf(channel.name));
            }
        }

        // sorts categories if a new one was created
        if (sortCategories) {
            let categories = message.guild.channels.cache.filter(channel => channel.type === "category" && 
                                                                            Object.keys(channelsDict).includes(channel.name));
            let categoryNames = categories.map(category => category.name).sort();
            let unsortedCount = message.guild.channels.cache.filter(channel => channel.type === "category").size - categories.size;
            for ([key, category] of categories) {   // sorts alphabetically
                await category.setPosition(unsortedCount + categoryNames.indexOf(category.name));   // leaves non-subject categories at the top
            }
        }

        const json_string = JSON.stringify(channelsDict, null, 4);
        FileSystem.writeFile("./channels.json", json_string, (error) => {
            if (error) throw error;
        });

        const reply = new Discord.MessageEmbed()
            .setColor("#800000")
            .setTitle(`Courses have been added to your sidebar!`)
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