module.exports = {
	run: async ({client, script, message}) => {
		let action = script.getAction(message);
		action.message = 'colocou uma coleira em';
		script.monitor.action({client, script, message}, action);
	},

	help: {
		aliases: ['collar', 'dog-collar', 'coleira', 'encoleirar'],
		description: 'Shh! Esse comando é secreto! Não use se não souber o que está fazendo.',
		hidden: true
	}
};