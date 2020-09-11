module.exports = {
	run: async ({client, script, message}) => {
		try {
			const path = `./data/gifs/gestures/${message.cmd.help.name}`;		
			const embed = {
				color: process.env.COL_BLUE,
				description: `🐱 <@${message.author.id}> está ronronando!`
			}
			
			await script.sendGif(embed, path, message);
			

			const pet = await client.economy.pet.get(message.author.id);

			if(pet && pet.authorIs == 'pet')
				client.economy.pet.reminder({ owner: pet.subject, pet: message.author }, message);
		} catch(e) { script.error(message, e, 'send purr gesture') }
	},

	help: {
		aliases: ['ronrono', 'ronronar', 'pur', 'cat', 'gato', 'miaumiau', 'miau', 'miar'],
		description: 'Use quando quiser ronronar. :3'
	}
};