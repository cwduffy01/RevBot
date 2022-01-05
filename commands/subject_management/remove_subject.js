const { exec } = require("child_process");
const Discord = require("discord.js");
const FileSystem = require("fs");

module.exports = {
    name: "remove_subject",
    description: "Removes a subject from the course information JSON file",
    args: true,
    usage: "<acronym1> <acronym2> <acronym3>...; use \"all\" to remove all subjects",
    aliases: ["remove_subjects"],
    permissions: ["Mod"],
    execute(message, args) {
        const subjectDict = require("../../subjects.json");
        
        const invalidArgs = [];
        if (args[0] == "all") {     // remove all keys
            var keys = Object.keys(subjectDict);
            for (key of keys) {
                delete subjectDict[key];
            }
        }
        else {
            for (arg of args) {
                let re = new RegExp(`(${arg})`, "gi");
                if (!re.test(Object.keys(subjectDict).join(" "))) {  // if arg not in subjectDict
                    invalidArgs.push(arg);
                }
                else {
                    delete subjectDict[arg];
                }
            }
        }

        const json_string = JSON.stringify(subjectDict, null, 4);
        FileSystem.writeFile("./subjects.json", json_string, (error) => {
            if (error) throw error;
        });
        
        const reply = new Discord.MessageEmbed()
                .setColor("#800000")
                .setTitle(`Subjects have been removed!`)
                .setAuthor(options = {
                    name: `Reply to ${message.author.tag}`,
                    iconURL: message.author.avatarURL(),
                    url: message.url
                })
                .setTimestamp();
        if (invalidArgs.length > 0) {
            reply.addField(name="Invalid Arguments:", value=invalidArgs.join(", "), inline=true);
        }
        message.channel.send({ embeds: [reply] });
    }
};