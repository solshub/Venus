module.exports = {
	run: async ({client, script, message}) => {
    let action = script.getAction(message);
    action.message = 'ficou cutucando';
    script.monitor.action({client, script, message}, action);
	},

	help: {
		aliases: ['cutucar', 'cutuca', 'tocar', 'toca', 'irritar', 'irrita'],
		description: 'Cutuque alguém de um jeito bem chato!'
	}
};