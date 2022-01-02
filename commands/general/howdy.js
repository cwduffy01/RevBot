module.exports = {
	name: 'howdy',
	description: 'Greets the bot with the proper Aggie greeting!',
	execute(message, args) {
        message.channel.send(`Howdy, <@${message.author.id}>!`)
	},
};