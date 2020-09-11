const Chance = require('chance');
const chance = new Chance();

module.exports = {
	run: async ({client, script, message}) => {
		try {
			const receiver = message.mentions.users && message.mentions.users.first();
			if(receiver && (receiver.id == client.user))
				return script.reply(message, 'v-você tá tentando dar em cima de mim?...');

			let str = (receiver ? `<@${receiver.id}>, ` : '');
			str += (receiver ? chance.pickone(client.flirt) : script.capitalize(chance.pickone(client.flirt)));

			message.channel.send(str)
			.catch(e => script.error(message, e, 'answer a question'));
		} catch(e) { script.error('send a flirtation') }
	},

	help: {
    aliases: ['flertar', 'cantada', 'cantar'],
		description: 'Faça uma cantada bem ruim pra alguém.',
		usage: '@[usuário]'
	}
};