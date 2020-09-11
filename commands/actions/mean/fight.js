module.exports = {
	run: async ({client, script, message}) => {
    let action = script.getAction(message);
    action.message = 'caiu na porrada com';
    script.monitor.action({client, script, message}, action);
	},

	help: {
		aliases: ['lutar', 'luta', 'brigar', 'briga', 'attack', 'atacar'],
		description: 'Caia na porrada com outra pessoa!'
	}
};