module.exports = {
	run: async ({client, script, message}) => {
    let action = script.getAction(message);
    action.message = 'pediu desculpas para';
    script.monitor.action({client, script, message}, action);
	},

	help: {
		aliases: ['desculpa', 'desculpe', 'perdão', 'perdão', 'desculpar', 'desculpar-se'],
		description: 'Peça desculpas sinceras para alguém...'
	}
};