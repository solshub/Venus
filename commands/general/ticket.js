module.exports = {
	run: async ({client, script, message}) => {
		try {
			const subject = (() => {
				const mention = message.mentions.users.first();
				return mention && mention.id; })();
				
			script.monitor.ticket({client, script, message}, (subject ? subject : message.author.id));
		} catch(e) { script.error(message, e, 'give ticket') }
	},

	help: {
		aliases: ['alerta', 'alertar', 'ajuda', 'ajudar', 'salva', 'salvar'],
		usage: '@[usuário]',
		description: 'mande, manualmente, um ticket para Alex. Apenas Sol pode usar este comando.'
	}
};