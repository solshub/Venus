module.exports = {
	run: async ({client, script, message}) => {
		let action = script.getAction(message);
		action.message = 'deu uma piscadinha para';
		script.monitor.action({client, script, message}, action);
	},

	help: {
		aliases: ['piscar', 'pisca'],
		description: 'Dê uma piscadinha.'
	}
};