module.exports = {
	run: async ({script, message}) => {
		try {
			const path = `./data/gifs/gestures/${message.cmd.help.name}`;		
			const embed = {
				color: process.env.COL_BLUE,
				description: `🙁 <@${message.author.id}> está chorando...`
			}
			
			script.sendGif(embed, path, message);
		} catch(e) { script.error(message, e, 'send cry gesture') }
	},

	help: {
		aliases: ['sad', 'triste', 'tristeza', 'chorar', 'chora', 'chorando', 'crying'],
		description: 'Use quando quiser chorar. :c'
	}
};