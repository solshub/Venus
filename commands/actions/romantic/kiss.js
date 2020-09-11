module.exports = {
	run: async ({client, script, message}) => {
    let action = script.getAction(message);
    action.message = 'beijou na boca com';
    script.monitor.action({client, script, message}, action);
	},

	help: {
		aliases: ['beijar', 'beija'],
		description: 'Beije quem você ama.',
		permission: true
	}
};