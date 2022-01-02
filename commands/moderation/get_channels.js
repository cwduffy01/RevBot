const fs = require("fs");

module.exports = {
	name: 'get_channels',
	description: "Sends the client's channelDict as a json file",
    aliases: ["get_channel"],
	permissions: ["Mod"],
	async execute(message, args) {
        try { await message.channel.send({ files: ["./channels.json"] }); }
		catch (error) {
            fs.writeFile("./channels.json", "{}", (e) => {
                if (e) throw e;
            });
			await message.channel.send({ files: ["./channels.json"] }); 
		}
    }
}