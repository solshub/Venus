module.exports = {
	run: async ({client, script, message}) => {
		try {
			if(!message.guild) return script.delete('esse comando só pode ser utilizado em servers!', message);
			
			const subject = message.mentions.users && message.mentions.users.first();
			if(!subject)
				return script.delete('mas quem você deseja adotar como seu pet?', message);
			if(subject.bot)
				return script.delete('você não pode adotar bots, eles são selvagens demais!', message)
			if(subject.id == message.author.id)
				return script.delete('mas... Você não pode adotar a si mesmo...', message);
			
			const isOwned = (id) => {
				const { account } = client.economy.get(id);
				return account.isOwned; };
			if(isOwned(message.author.id))
				return script.delete(`você não pode ser pet e dono ao mesmo tempo! Seu dono é <@${isOwned(message.author.id)}>.`, message)
			if(isOwned(subject.id))
				return script.delete('desculpe, mas esse usuário já tem um dono!', message);

			const hasPet = () => {
				const { account } = client.economy.get(message.author.id);
				return typeof account.pet == 'object' && account.pet.id; }
			if(hasPet()) return script.delete('desculpe, mas você só pode ser dono de um pet!', message);
	
			const adoption = () => {
				try {
					client.economy.pet.set(message.author.id, subject.id);
					script.reply(message, `parabéns! <@${subject.id}> foi definido como o seu pet! ~\n` +
						`Use \`${process.env.PREFIX}pet\` para saber mais e ver os itens que você tem pra poder cuidar direitinho de seu pet.`);

					message.channel.send(`<@${subject.id}>, ei, psst... ` +
						`Você pode abandonar seu dono a qualquer momento usando \`${process.env.PREFIX}flee\`, okay?`)
					.catch(e => script.error(message, e, 'adopt a pet'));
				} catch(e) { script.error(message, e, 'adopt a pet') }
			};
	
			script.waitApproval(`deseja permitir que <@${message.author.id}> te adote como pet? Você só pode ter um dono!`, message, adoption, { user: subject });
		} catch(e) { script.error(message, e, 'adopt a pet') }
	},

	config: {
		guild: true,
		permissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY']
	},

	help: {
		aliases: ['adotar', 'adota', 'capturar', 'captura', 'capture', 'catch'],
		usage: '@[usuário]',
		description: 'Adote um usuário como seu pet!'
	}
};