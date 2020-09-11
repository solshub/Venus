module.exports = {
	run: async ({client, script, message}) => {
		if((message.command == 'give' && !script.contains(message.content, ['give roses', 'give rose', 'give a rose'])) ||
		(message.command == 'dar' && !script.contains(message.content, ['dar rosas', 'dar rosa', 'dar flores', 'dar flor'])))
			return script.delete(`desculpa desculpa, eu não conheço nenhum comando com o nome \`${message.command}\`.`, message);

		let action = script.getAction(message);
		action.message = 'deu uma rosa para';
		script.monitor.action({client, script, message}, action);
	},

	help: {
		aliases: ['give-roses', 'give-rose', 'give-a-rose', 'dar-rosas', 'dar-rosa', 'dar-flores', 'dar-flor', 'dar', 'give'],
		description: 'Dê rosas para a pessoa que você gosta!',
		permission: true
	}
};