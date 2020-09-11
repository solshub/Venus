module.exports = {
	run: async ({client, script, message}) => {
    let action = script.getAction(message);
    action.message = 'deu amor para';
    script.monitor.action({client, script, message}, action);
	},

	help: {
		aliases: ['amar', 'ama', 'amor', 'amo'],
		description: 'Dê amor pra quem merece. ~'
	}
};