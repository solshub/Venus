module.exports = {
	run: async ({client, script, message}) => {
    let action = script.getAction(message);
    action.message = 'deu um presente para';
    script.monitor.action({client, script, message}, action);
	},

	help: {
		aliases: ['presentear', 'presente', 'dar-presente', 'give-gift'],
		description: 'Dê um presente para alguém que você gosta.'
	}
};