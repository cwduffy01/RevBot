const { JSDOM } = require("jsdom")
const axios = require('axios');
const Discord = require("discord.js");
const FileSystem = require("fs");

module.exports = {
    name: "add_subject",
    description: "Scrapes the Texas A&M University Course Descriptions page and creates a JSON file based on the course data",
    args: true,
    usage: "<acronym1> <acronym2> <acronym3>...; use \"all\" to add all subjects",
    aliases: ["add_subjects"],
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

        const document = await scrape(url);
        const ul = document.querySelector("div #atozindex");    // get unordered list of subjects
        const subjects = ul.querySelectorAll("li");             // get all list elements (subjects)
        const subjectAcronyms = {};

        for (subject of subjects) {
            let text = subject.querySelector("a").textContent;    // full subject title
            let subjectTitle = text.replace("&amp;", "&").replace(/\s\s+/g, ' ').replace(/  +/g, ' ').trim();   // reformatting some characters
            let tokens = subjectTitle.split(/[^\w&']|_/).map(e => {return e.trim();});    // split by whitespace and punctuation other than & and '
            tokens = tokens.filter(x => x !== '');  // remove empty strings
            let subjectAcronym = tokens.shift().toLowerCase();
            tokens.pop();   // remove acronym at end of tokens
            let subjectName = tokens.join(" ");

            subjectAcronyms[subjectAcronym] = subjectName;
        }

        const invalidArgs = [];
        const duplicateArgs = [];
        if (args[0] === "all") {
            args = Object.keys(subjectAcronyms);
        }
        for (arg of args) {
            let re = new RegExp(`(${arg})`, "gi");
            if (!re.test(Object.keys(subjectAcronyms).join(" "))) {
                invalidArgs.push(arg);
            }
            else {
                let re = new RegExp(`(${arg})`, "gi");
                if (re.test(Object.keys(subjectDict).join(" "))) {
                    duplicateArgs.push(arg.toUpperCase());
                }
                else {
                    const acronym = arg.toLowerCase();
                    subjectDict[acronym] = {
                        "subjectName": subjectAcronyms[acronym],
                        "courses": {}
                    };

                    const subjectDocument = await scrape(url + acronym + '/');   // scrape through subject page
                    const courses = subjectDocument.querySelectorAll(".courseblock");   // get all courses
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
        if (invalidArgs.length > 0 || duplicateArgs.length > 0) {
            if (invalidArgs.length > 0) { reply.addField(name="Invalid Arguments:", value=invalidArgs.join(", "), inline=true); }
            if (duplicateArgs.length > 0) { reply.addField(name="Previously Added:", value=duplicateArgs.join(", "), inline=true); }
        }
        message.channel.send({ embeds: [reply] });
    },
};