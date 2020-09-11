module.exports = {
	run: async ({script, message}) => {
		try {
			if(message.command == 'ola') message.command = 'olá';
			message.channel.send(script.capitalize(message.command) + '!')
			.catch(e => { script.error(message, e, 'say hi') });
		} catch(e) { script.error(message, e, script.error('say hi')) }
	},

	help: {
		aliases: ['hello', 'olá', 'oi', 'ola', 'yo', 'hey', 'ohayo'],
		description: 'Diga oi!'
	}
};