module.exports = {
	run: async ({client, script, message}) => {
		let pet;
		try {
			pet = await client.economy.pet.get(message.author.id);
			if(!pet) return script.delete('pra usar esse comando você precisa primeiro ter um pet ou ser o pet de alguém!' + ` Que tal adotar alguém com \`${process.env.PREFIX}adopt @[usuário]\`?`, message);

			if(pet.authorIs == 'pet')
				return client.economy.pet.reminder({ owner: pet.subject, pet: message.author, deleteAfter: true }, message, 'buy');
				
			await waitBuyers(await getShop());
		} catch(e) { script.error(message, e, 'load petshop') }

		async function getShop() {
			try {
				const foodShop = script.contains(message.args, ['food', 'comida']) ||
					script.contains(message.command, ['foodshop', 'food-shop', 'market', 'supermarket', 'mercado', 'supermercado', 'super-mercado', 'mercadinho', 'vendinha', 'foods', 'petiscos', 'comidas']);
				const { account } = client.economy.get(message.author.id);

				let send = {
					embed: {
						color: process.env.COL_YELLOW,
						description: '**Reaja com o número do item que deseja comprar**! ~' + 
							(foodShop ? '' : '\nOs efeitos dos itens valem pra você e para seu pet!'),
						author: { name: "Pet shop", icon_url: process.env.ICO_SHOP },				
						footer: { text: `Você tem ${script.format(account.cash.balance, false)} na carteira.` }
					}
				}

				send.embed.fields = [];
				for(const item of client.pet[(foodShop ? 'foods' : 'items')])
					send.embed.fields.push(getItem(item, foodShop));
				
				let shopMessage;
				await message.channel.send(send)
				.then(msg => shopMessage = msg)
				.catch(e => { script.error(message, e, 'load petshop') });

				return { shopMessage,
					numberOfItems: client.pet[(foodShop ? 'foods' : 'items')].length,
					foodShop };
			} catch(e) { script.error(message, e, 'load petshop') }


			function getItem(item, food = false) {
				try {
					const name = `${(food ? client.pet.foods : client.pet.items).indexOf(item) + 1}. ` +
						`${(item.ico && item.ico + ' ') || ''}${script.capitalize(item.name)}`;

					let value = '';
					if(!food)
						value = `*${(item.effectStr && script.capitalize(item.effectStr)) || script.capitalize('sem efeitos adicionais...')}*\n`;
					value += `\`${script.format(item.value)}\``;

					return { name, value, inline: true }
				} catch(e) { script.error(message, e, 'load petshop') }
			}
		}

		async function waitBuyers({shopMessage, numberOfItems, foodShop}) {
			try {
				if(!shopMessage)
					throw new Error('Could not send petshop message');
				
				const numberReactions = (() => {
					const available = [process.env.EMT_ONE, process.env.EMT_TWO, process.env.EMT_THREE, process.env.EMT_FOUR, process.env.EMT_FIVE, process.env.EMT_SIX, process.env.EMT_SEVEN, process.env.EMT_EIGHT, process.env.EMT_NINE];
					return available.slice(0, numberOfItems)
				})();

				for(const reaction of numberReactions)
					shopMessage.react(reaction)
					.catch(() => {});

					
				const filter = (reaction, user) => {
					return numberReactions.includes(reaction.emoji.name) && !user.bot; };

				const collector = shopMessage.createReactionCollector(filter, { time: 5 * 60000 });

				collector.on('collect', async (reaction, user) => {
					try {
						user = await (async () => {
							let fetched;
							await client.users.fetch(String(user.id))
							.then(userFetched => fetched = userFetched)
							.catch(e => { console.log(`Something went wrong when trying to get pet owner data:\n${e}`); });
							return fetched;
						})();

						pet = await client.economy.pet.get(user.id);
						if(!pet)
							return script.delete('pra poder comprar algo você precisa ' +
								'primeiro ter um pet ou ser o pet de alguém!', message, false, user.id);
			
						switch(pet.authorIs) {
							case 'pet':
								// eslint-disable-next-line no-case-declarations
								const item = client.pet[foodShop ? 'foods' : 'items'][numberReactions.indexOf(reaction.emoji.name)];
								return client.economy.pet.reminder({ owner: pet.subject, pet: user }, message, 'buy', item.name);
							case 'owner':
								return buyItem(numberReactions.indexOf(reaction.emoji.name), user);
						}
					} catch(e) { script.error(message, e, 'get buyers') }
				});

				collector.on('end', async () => {
					try {
						shopMessage.edit({ content: `A loja já fechou! ~\n` +
							`Use \`${process.env.PREFIX}${message.command}${foodShop ? ' food' : ''}\` ` +
							`para poder comprar itens novamente.` })
						.catch(e => script.error(message, e, 'get buyers'));
						await shopMessage.suppressEmbeds();
						await shopMessage.reactions.removeAll();
					} catch(e) { script.error(message, e, 'get buyers') }
				});

				collector.on('error', (e) => { script.error(message, e, 'feed pet'); });
			} catch(e) { script.error(message, e, 'get buyers') }


			async function buyItem(item, user) {
				try {
					item = client.pet[foodShop ? 'foods' : 'items'][item];

					const { account } = client.economy.get(user.id);

					if(account.cash.balance < item.value)
						return script.delete('você não tem sóis suficientes pra ' +
							'fazer a compra desse item!', message, false, user.id);

					const buyItem = async () => {
						try {
							await client.economy.pet.buy(foodShop, user.id, item);
							await script.delete(`${script.format(item.value)} foram descontados da sua conta! ` +
							`A compra de \`${item.name}\` foi realizada com sucesso! ` +
							`Use \`${process.env.PREFIX}${foodShop ? 'feed' : 'pet full'}\` para verificar. ~`, message, true, user.id);
						} catch(e) { script.error(message, e, 'buy item') }
					};

					if(!foodShop) {
						const heldItem = pet.data.inventory.items.find(heldItem => heldItem && heldItem.name.includes(item.name.split(' ')[0]));
						if(heldItem)
							if(pet.data.inventory.items.some(heldItem => heldItem && heldItem.name == item.name))
								return message.channel
								.send(`<@${user.id}>, você já possui esse item!`)
								.catch(e => script.error(message, e, 'get buyers'));
							else
								await message.channel.send(`<@${user.id}>, você já tem um item do tipo ${item.name.split(' ')[0]}! ` +
									`Você estará irreversivelmente perdendo \`${heldItem.name}\` ao realizar essa compra! ${process.env.EMT_WARN}`);
					}

					script.waitApproval(`tem certeza que deseja realizar a compra de \`${item.name}\`?`, message, buyItem, { user })
				} catch(e) { script.error(message, e, 'buy item') }
			}
		}
	},

	config: {
		permissions: ['EMBED_LINKS', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY', 'USE_EXTERNAL_EMOJIS']
	},

	help: {
		aliases: ['pet-shop', 'shop', 'loja', 'store', 'items', 'itens', 'foodshop', 'food-shop', 'market', 'supermarket', 'mercado', 'supermercado', 'super-mercado', 'mercadinho', 'vendinha', 'foods', 'petiscos', 'comidas', 'buy', 'comprar', 'compra'],
		description: 'Compre itens com funções úteis, ou petiscos pra alimentar seu pet!'
	}
};