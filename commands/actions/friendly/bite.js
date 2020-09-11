module.exports = {
	run: async ({client, script, message}) => {
    let action = script.getAction(message);
    action.message = 'deu uma mordida em';
    script.monitor.action({client, script, message}, action);
	},

	help: {
		aliases: ['morder', 'morde', 'moide', 'moider', 'mordida', 'moidida', 'morda', 'moida'],
		description: 'Dê uma mordida em alguém!'
	}
};