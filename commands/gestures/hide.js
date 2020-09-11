module.exports = {
	run: async ({script, message}) => {
		try {
			const path = `./data/gifs/gestures/${message.cmd.help.name}`;		
			const embed = {
				color: process.env.COL_BLUE,
				description: `👉👈 <@${message.author.id}> se escondeu!`
			}
			
			script.sendGif(embed, path, message);
		} catch(e) { script.error(message, e, 'send hide gesture') }
	},

	help: {
		aliases: ['esconde', 'esconder', 'vergonha'],
		description: 'Use quando estiver com vergonha. :3'
	}
};