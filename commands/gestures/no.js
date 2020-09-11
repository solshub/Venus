module.exports = {
	run: async ({script, message}) => {
		try {
			const path = `./data/gifs/gestures/${message.cmd.help.name}`;		
			const embed = {
				color: process.env.COL_BLUE,
				description: `🙅 <@${message.author.id}> nega!`
			}
			
			script.sendGif(embed, path, message);
		} catch(e) { script.error(message, e, 'send negate gesture') }
	},

	help: {
		aliases: ['nope', 'negar', 'negado', 'negação', 'nega'],
		description: 'Use quando quiser chorar. :c'
	}
};