module.exports = {
	run: async ({client, script, message}) => {
		try {
			script.monitor.manage({client, script, message}, 'delete');
		} catch(e) { script.error(message, e, 'delete mail') }
	},

	help: {
		aliases: ['deletar', 'deleta', 'apagar', 'apaga'],
		description: 'Use esse comando para apagar correios que você recebeu.',
		usage: '[id-da-mensagem]'
	}
};