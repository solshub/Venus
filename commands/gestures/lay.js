module.exports = {
	run: async ({script, message}) => {
		try {
			const path = `./data/gifs/gestures/${message.cmd.help.name}`;		
			const embed = {
				color: process.env.COL_BLUE,
				description: `💤 <@${message.author.id}> se deitou no chão...`
			}
			
			script.sendGif(embed, path, message);
		} catch(e) { script.error(message, e, 'send lay down gesture') }
	},

	help: {
		aliases: ['lay-down', 'laydown', 'lay-down-and-die', 'laydownanddie', 'die'],
		description: 'Use quando quiser deitar no chão e morrer.'
	}
};