module.exports = {
	run: async ({client, script, message}) => {
    let action = script.getAction(message);
    action.message = 'abraçou';
    script.monitor.action({client, script, message}, action);
	},

	help: {
		aliases: ['abraçar', 'abraça'],
		description: 'Abraçe outra pessoa, distribuir abraços é sempre bom!'
	}
};