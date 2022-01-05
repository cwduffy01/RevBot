const { JSDOM } = require("jsdom")
const axios = require('axios');
const Discord = require("discord.js");
const FileSystem = require("fs");

module.exports = {
    name: "reload_subject",
    description: "Re-scrapes subjects included in the course information JSON file",
    args: true,
    usage: "<acronym1> <acronym2> <acronym3>...; use \"all\" to reload all subjects",
    aliases: ["reload_subjects"],
    permissions: ["Mod"],
    async execute(message, args) {
        const subjectDict = require("../../subjects.json");

        // scrape function
        const scrape = async (url) => {
            const { data } = await axios.get(url);  // http request
            const dom = new JSDOM(data);
            const { document } = dom.window;        // create DOM from site's html
            return document;
        };
        
        const url = "https://catalog.tamu.edu/undergraduate/course-descriptions/";
        const invalidArgs = [];
        if (args[0] === "all") {
            args = Object.keys(subjectDict);
        }
        for (arg of args) {
            let re = new RegExp(`(${arg})`, "gi");
            if (!re.test(Object.keys(subjectDict).join(" "))) {
                invalidArgs.push(arg);
            }
            else {
                const acronym = arg.toLowerCase();
                subjectDict[acronym] = {
                    "subjectName": "",
                    "courses": {}
                };
                const document = await scrape(url + acronym + '/');   // scrape through subject page
                const text = document.querySelector(".page-title").innerHTML;
                const subjectTitle = text.replace("&amp;", "&").replace(/\s\s+/g, ' ').replace(/  +/g, ' ').trim();   // reformatting some characters
                var tokens = subjectTitle.split(/[^\w&']|_/).map(e => {return e.trim();});    // split by whitespace and punctuation other than & and '
                tokens = tokens.filter(x => x !== '');  // remove empty strings
                tokens.shift().toLowerCase();
                tokens.pop();   // remove acronym at end of tokens
                const subjectName = tokens.join(" ");
                subjectDict[acronym]["subjectName"] = subjectName;
                
                const courses = document.querySelectorAll(".courseblock");   // get all courses
                for (course of courses) {
                    let courseTitle = course.querySelector(".courseblocktitle strong").textContent.trim();   // parse course title
                    let courseHours = course.querySelector(".hours strong").textContent.trim();             // parse course credit hours
                    let courseDescription = course.querySelector(".courseblockdesc").textContent.trim();    // parse course description
                    courseHours = courseHours.replace(/\n/g, "");
    
                    courseTitle = courseTitle.replace(/&nbsp;/g, " ");    // replace html characters

                    // handle courses split among two departments
                    if (courseTitle.substring(0, 9).includes('/')) {
                        let tokens = courseTitle.split('/');
                        tokens.shift();
                        courseTitle = tokens.join('/');
                        courseTitle = acronym.toUpperCase() + courseTitle.substring(4);    // replace acronym with correct acronym
                    }

                    // split title into course number and course title
                    let tokens = courseTitle.replace(acronym.toUpperCase(), "").trim().split(" ");
                    let courseNumber = tokens.shift();
                    let courseName = tokens.join(" ");
    
                    subjectDict[acronym]["courses"][courseNumber] = {
                        "courseName": courseName,
                        "courseHours": courseHours,
                        "courseDescription": courseDescription
                    };
                }
            }
        }

        const json_string = JSON.stringify(subjectDict, null, 4);
        FileSystem.writeFile("./subjects.json", json_string, (error) => {
            if (error) throw error;
        });

        const reply = new Discord.MessageEmbed()
            .setColor("#800000")
            .setTitle(`Your request was processed!`)
            .setAuthor(options = {
                name: `Reply to ${message.author.tag}`,
                iconURL: message.author.avatarURL(),
                url: message.url
            })
            .setTimestamp();

        if (invalidArgs.length > 0) { reply.addField(name="Invalid Arguments:", value=invalidArgs.join(", "), inline=true); }
        message.channel.send({ embeds: [reply] });
    },
};