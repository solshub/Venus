module.exports = {
	run: async ({client, script, message}) => {
    let action = script.getAction(message);
    action.message = 'deu um tapa no rosto de';
    script.monitor.action({client, script, message}, action);
	},

	help: {
		aliases: ['estapear', 'estapeia', 'tapa', 'bater', 'bate', 'bofetada', 'bofete'],
		description: 'Dê um tapa na cara de quem merece!'
	}
};