module.exports = {
	run: async ({client, script, message}) => {
		try {
			const pet = await client.economy.pet.get(message.author.id);
			if(!pet) return script.delete('pra usar esse comando você precisa primeiro ter um pet ou ser o pet de alguém!' + ` Que tal adotar alguém com \`${process.env.PREFIX}adopt @[usuário]\`?`, message);

			if(pet.authorIs == 'pet')
				return client.economy.pet.reminder({ owner: pet.subject, pet: message.author, deleteAfter: true }, message, 'food');
			
			const send = {
				content: `use \`${process.env.PREFIX}petshop food\` pra checar o mercadinho de petiscos!` }

			if(pet.data.inventory.foods.length < 1)
				return script.delete('você parece não ter nada comestível no seu inventário... ' + send.content, message)

			send.embed = {
				color: process.env.COL_BLUE,
				description: `Reaja para alimentar seu pet!`,
				fields: []
			}

			for(const food of pet.data.inventory.foods)
				send.embed.fields.push({
					name: `${(food.ico && food.ico + ' ') || ''}${script.capitalize(food.name)} (x${food.quantity})`,
					value: `\`Recupera ${Math.floor(food.fill / 10)} ${process.env.EMT_FOOD}\``,
					inline: true
				});		

			let feedMessage;
			await message.reply(send)
			.then(msg => feedMessage = msg)
			.catch(e => script(message, e, 'feed pet'));

			let reactions = [];
			for(let { ico } of pet.data.inventory.foods) {
				reactions.push(ico.replace(/[^A-Za-z\s]/g, ''));
				feedMessage.react(ico.replace(/\D/g, ''))
				.catch(() => {});
			}
			
			const filter = (reaction, user) => {
				return reactions.includes(reaction.emoji.name) &&
				(user.id == message.author.id || user.id == pet.subject.id); };

			const collector = feedMessage.createReactionCollector(filter, { time: 5 * 60000 });
			
			collector.on('collect', async (reaction, user) => {
				try {
					if(user.id == pet.subject.id)
						return client.economy.pet.reminder({ owner: message.author, pet: pet.subject }, message, 'food', reaction.emoji.name);

					if(pet.data.food >= 100)
						return script.delete('ué... Seu pet já está de barriga cheia! Elu não quer comer mais nada.', message);

					const heldFood = pet.data.inventory.foods.find(food =>
						food.ico.replace(/[^A-Za-z\s]/g, '') == reaction.emoji.name);
					if(!heldFood)
						return script.delete('opa! Parece que você não tem mais desse petisco no seu inventário...', message);
					
					const love = await client.economy.pet.fill(message.author.id, { food: heldFood });
					script.delete(`você alimentou seu pet com \`${heldFood.name}\` ${heldFood.ico}, ` +
						`e \`${Math.floor(heldFood.fill / 10)} ${process.env.EMT_FOOD}\` foram preenchidos! ` +
						`Elu parece muito feliz com isso, vocês ganharam ${love} ${process.env.SYM_LOVE} pontos de amor! ~`, message, true);
					} catch(e) { script.error(message, e, 'feed pet') }
			});
			
			collector.on('end', async () => {
				try {
					feedMessage.edit({ content: `Use \`${process.env.PREFIX}${message.command}\` ` +
						`novamente se ainda quiser alimentar seu pet.` })
					.catch(e => script.error(message, e, 'feed pet'));
					await feedMessage.suppressEmbeds();
					await feedMessage.reactions.removeAll();
				} catch(e) { script.error(message, e, 'feed pet') }
			});

			collector.on('error', (e) => { script.error(message, e, 'feed pet'); });
		} catch(e) { script.error(message, e, 'feed pet') }
	},

	config: {
		permissions: ['EMBED_LINKS', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY', 'USE_EXTERNAL_EMOJIS', 'MANAGE_MESSAGES']
	},

	help: {
		aliases: ['alimentar', 'alimenta', 'ração', 'food'],
		description: 'Alimente o seu pet com os petiscos no seu inventário.'
	}
};