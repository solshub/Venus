module.exports = {
	run: async ({client, script, message}) => {
		if((message.command == 'hold' && !script.contains(message.content, ['hold hands', 'hold hand'])) ||
		(message.command == 'segurar' && !script.contains(message.content, ['segurar as mãos', 'segurar a mão', 'segurar mãos', 'segurar mão'])) ||
		(message.command == 'mãos' && !script.contains(message.content, ['mãos dadas', 'mãos-dadas'])) ||
		(message.command == 'mão' && !script.contains(message.content, ['mão dada', 'mão-dada'])))
			return script.delete(`desculpa desculpa, eu não conheço nenhum comando com o nome \`${message.command}\`.`, message);

		let action = script.getAction(message);
		action.message = 'segurou as mãos de';
		script.monitor.action({client, script, message}, action);
	},

	help: {
		aliases: ['hold-hands', 'hold-hand', 'segurar-as-mãos', 'segurar-a-mão', 'segurar-mãos', 'segurar-mão', 'dar-as-mãos', 'dar-a-mão', 'dar-mãos', 'dar-mão', 'mãos-dadas', 'mão-dada', 'hold', 'segurar', 'mãos', 'mão'],
		description: 'Fique de mãos dadas com a pessoa que você gosta!'
	}
};