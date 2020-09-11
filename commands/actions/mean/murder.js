module.exports = {
	run: async ({client, script, message}) => {
    let action = script.getAction(message);
    action.message = 'assassinou';
    script.monitor.action({client, script, message}, action);
	},

	help: {
		aliases: ['kill', 'assassinar', 'matar', 'mata'],
		description: 'MATE ALGUÉM!'
	}
};