const Chance = require('chance');
const chance = new Chance();

module.exports = {
	run: async ({client, script, message}) => {	
		try {
			const receiver = message.mentions.users && message.mentions.users.first();
			if(receiver && (receiver.id == client.user))
				return script.reply(message, 'poxa! Não precisa querer me ofender... :c')

			let str = '';
			if(receiver) str = `<@${receiver.id}>, `;
			str += receiver ? chance.pickone(client.insult) : script.capitalize(chance.pickone(client.insult));
			message.channel.send(str)
			.catch(e => script.error(message, e, 'answer a question'));
		} catch(e) { script.error('send an insult') }
	},

	help: {
    aliases: ['insulto', 'xingar', 'xinga', 'xingamento'],
    description: 'Insulte alguém!',
		usage: '@[usuário]'
	}
};