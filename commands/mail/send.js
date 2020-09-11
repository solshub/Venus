module.exports = {
	run: async ({client, script, message}) => {
		try {				
			const usage = `\`${process.env.PREFIX}${message.command} ${message.cmd.help.usage.replace(' hide_message', '').replace(' anon_message', '')}\``;
			if(message.args.length < 1)
				return script.reply(message, message.cmd.help.description.replace('Envie', 'envie') +
				` Modo de uso: \`${process.env.prefix}${message.command} ${message.cmd.help.usage}\`.`);

			let subject;
			if(message.mentions.users.size < 1) {
				const id = message.args.find(arg => !isNaN(arg));
				if(id) {
					message.message = message.message.replace(id, '');
					await client.users.fetch(String(id))
					.then(user => subject = user)
					.catch(() => script.delete(`não consegui achar nenhum usuário de ID \`${id}\`.`, message));
				}
			} else subject = message.mentions.users.first();

			if(!subject)
				return script.delete('por favor mencione pra quem você deseja enviar a mensagem! ' + usage, message);

			if(subject.bot) return script.delete('desculpe, bots não tem caixas de correio!', message);

			message.message = message.message.replace(/<[^>]*>/g, '').trim();

			if(['mushroom', '🍄', 'cogumelo', ':mushroom:'].some(str => message.message == str))
				return script.delete('por favor pare de mandar cogumelos.', message);

			let anon, hidden;
			if(message.message.includes('anon_mail')) {
				if(subject.id == message.author.id)
					return script.delete('que ideia é essa? Você não pode mandar uma mensagem anônima pra você mesmo!', message);
				anon = true; message.message = message.message.replace('anon_mail', ''); }
			if(message.message.includes('hide_mail')) {
				hidden = true; message.message = message.message.replace('hide_mail', ''); }
			
			if(message.message.replace(' ', '').length < 1)
				return script.delete('ué, mas o que você quer escrito na mensagem??')
			else if(message.message.length > 950)
				return script.delete('por favor tente enviar uma mensagem mais curta (no máximo 950 caracteres)!', message);
			
			const { account } = client.economy.get(message.author.id);
			if(account.cash.balance < 250)
				return script.delete(`você não tem sóis suficientes pra enviar um correio! Cada mensagem custa ${process.env.SYM_CASH}250 sóis.`, message);

			const embed = {
				author: {
					name: (anon ? 'Um anônimo' : `${message.author.username}#${message.author.discriminator}`) + ' te enviou...',
					icon_url: anon ? process.env.ICO_ANON : message.author.avatarURL() },
				description: message.message,
				footer: { text: hidden ? 'Essa mensagem só pode ser vista pela dm.' : '' },
				color: hidden ? process.env.COL_YELLOW : process.env.COL_WHITE,
			}

			const send = async () => {
        client.economy.cash(message.author.id, 250, 'subtract');
				await client.mail
				.send(message.author.id, subject.id, message.message, { anon, hidden, embed })
				.catch(e => { script.error(message, e, 'send a mail') });

				if(message.guild) await message.delete().catch(() => {});
				
				const msg = 'mensagem enviada com sucesso! ~\n'+
				'O destinatário recebeu uma notificação por dm. :3'
				if(message.guild) script.delete(msg, message, true);
				else script.reply(message, msg) };

			script.waitApproval({ content: `deseja mesmo enviar essa mensagem para <@${subject.id}>? **Cada mensagem custa ${process.env.SYM_CASH}250 sóis!**`, embed }, message, send);
		} catch(e) { script.error(message, e, 'send a mail'); }
	},
  
  config: {
    permissions: ['EMBED_LINKS']
  },

	help: {
		aliases: ['enviar', 'mandar'],
		description: 'Envie uma carta para alguém! Inclua `anon_mail` para tornar a mensagem anônima, ou `hide_mail` para mandar uma mensagem privada.',
		usage: '@[usuário] OU [id-do-usuário] [mensagem] anon_mail hide_mail'
	}
};