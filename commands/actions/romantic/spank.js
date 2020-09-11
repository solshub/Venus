module.exports = {
	run: async ({client, script, message}) => {
		let action = script.getAction(message);
		action.message = 'bateu na bunda de';
		script.monitor.action({client, script, message}, action);
	},

	help: {
		aliases: ['butt-slap', 'buttslap', 'slapbutt', 'slap-butt', 'tapão'],
		description: 'De um tapa gostoso na bunda de alguém!',
		nsfw: true,
		hidden: true,
		permission: true
	}
};