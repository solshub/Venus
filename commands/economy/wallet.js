const moment = require('moment');

module.exports = {
	run: async ({client, script, message}) => {		
		try {			
			let embed;

			let subject = (message.mentions.users && message.mentions.users.first()) || message.author;
			if(subject && subject.bot)
				return script.delete('desculpe, mas bots não precisam de carteiras!', message);
	
			embed = {
				color: process.env.COL_YELLOW,
				author: {
					name: subject.username,
					icon_url: subject.avatarURL()
				},
			}

			if(script.contains(message.args, ['mail', 'mails', 'correio', 'correios'])) {
				const { received, sent } = await client.mail.data(subject.id);

				embed.thumbnail = { url: process.env.ICO_MAIL }
				embed.author.name = 'Caixa de correio de ' + embed.author.name;
				embed.fields = [
					{
						name: `${received.total} mails recebidos`,
						value: `\`${received.hidden}\` desses estão ocultos\n` +
							`\`${received.anon}\` desses vieram de anônimos\n` +
							`<@${received.most.author}> foi quem enviou a maioria!`
					},
					{
						name: `${sent.total} mails enviados`,
						value: `\`${sent.hidden}\` desses foram ocultos\n` +
							`\`${sent.anon}\` desses foram como anônimo\n` +
							`<@${sent.most.subject}> foi quem recebeu a maioria!`
					}
				]
				embed.footer = { text: `"A maioria" não conta mails anônimos.` }

			} else {
				const { account, exp } = client.economy.get(subject.id, message.guild.id);
				const totalExp = exp.messages + (exp.interactions * 5),
				leftExp = totalExp - (Math.floor(totalExp / exp.required) * exp.required);
				
				embed.author.name = 'Carteira de ' + embed.author.name;
				embed.fields = [
					{
						name: 'Conta bancária',
						value: `${script.format(account.cash.balance)}`
					},
					{
						name: `Nível atual: **${client.economy.level(subject.id, message.guild.id)}**`,
						value: `${leftExp}/${exp.required} pontos restantes`
					}
				]
		
				if(!script.contains(message.args, ['full', 'completo', 'details', 'detalhes', 'total'])) {
					embed.thumbnail = { url: process.env.ICO_WALLET };
					embed.footer = { text: `Use "${process.env.PREFIX}${message.command} full" pra ter mais detalhes.` };
				} else {
					embed.fields[0].inline = true;
					embed.fields[1].value += `\n${exp.messages} mensagens enviadas` +
																	`\n${exp.interactions} interações realizadas`;
					embed.footer = { text: 'Data de criação' }
					embed.timestamp = moment(account.created);
					embed.fields = [
						embed.fields[1],
						embed.fields[0],
						{
							name: 'Histórico de apostas',
							value: `Lucro: ${script.format(account.cash.games.won)}\n`+
								`Prejuízo: ${script.format(account.cash.games.lost)}`
						}
					]
				}
			}
	
			message.channel.send({ embed })
			.catch(e => { script.error(message, e, 'check a wallet') });
		} catch(e) { script.error(message, e, 'check a wallet') }
	},
  
  config: {
		guild: true,
    permissions: ['EMBED_LINKS']
  },

	help: {
		aliases: ['carteira', 'profile', 'perfil', 'cash', 'dinheiro', 'sóis', 'rank'],
		description: 'Verifique seu nível e quantos sóis você tem na carteira.',
		usage: 'full mail'
	}
};