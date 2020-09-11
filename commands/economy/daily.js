const Chance = require('chance');
const chance = new Chance();
const moment = require('moment');

module.exports = {
	run: async ({client, script, message}) => {
		try {
			const { account } = client.economy.get(message.author.id);
			if(account.daily && moment().diff(moment(account.daily), 'hours') < 12)
				return script.delete('que história é essa de querer pegar sóis diários mais de uma vez por dia?? ' +
					'Para de preguiça e vai mandar mensagens, vai interagir!', message);
	
			
			const value = chance.integer({ min: 600, max: 1200 });
	
			client.economy.daily(message.author.id, value);
			script.reply(message, `aqui estão seus ${script.format(value)} diários! ` +
				'Não esqueça de voltar amanhã pra pegar mais. :3');
		} catch(e) { script.error(message, e, 'give daily')}
	},

	help: {
		aliases: ['diário'],
		description: 'Ganhe alguns sóis diários! ~'
	}
};