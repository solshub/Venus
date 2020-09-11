module.exports = {
	run: async ({client, script, message}) => {
		try {
			script.monitor.manage({client, script, message}, 'hide');
		} catch(e) { script.error(message, e, 'hide mail') }
	},

	help: {
		aliases: ['esconder', 'esconde', 'ocultar', 'oculta'],
		description: 'Use esse comando para ocultar ou expor correios que você recebeu.',
		usage: '[id-da-mensagem]'
	}
};