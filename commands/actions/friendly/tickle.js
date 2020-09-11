module.exports = {
	run: async ({client, script, message}) => {
    let action = script.getAction(message);
    action.message = 'fez cócegas em';
    script.monitor.action({client, script, message}, action);
	},

	help: {
		aliases: ['cócegas', 'cosquinhas', 'coceguinhas', 'cóceguinhas'],
		description: 'Faça cosquinhas (ou coceguinhas se preferir) em alguém!'
	}
};
