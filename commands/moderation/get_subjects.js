const fs = require("fs");

module.exports = {
	name: 'get_subjects',
	description: "Sends the client's subjectDict as a json file",
    aliases: ["get_subject"],
	permissions: ["Mod"],
	async execute(message, args) {
		try { await message.channel.send({ files: ["./subjects.json"] }); }
		catch (error) {
            fs.writeFile("./subjects.json", "{}", (e) => {
                if (e) throw e;
            });
			await message.channel.send({ files: ["./subjects.json"] }); 
		}
    }
}