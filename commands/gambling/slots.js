const Chance = require('chance');
const chance = new Chance();
const mergeImg = require('merge-img');

module.exports = {
	run: async ({client, script, message}, firstTime = true) => {
		let send = { content: `<@${message.author.id}>, ` }, prize = {};
		let images = [], prizes = [20000, 5000, 2500, 500];
		try {
			const price = 250;

			send.embed = {
				color: process.env.COL_YELLOW,
				author: {
					name: 'Caça níqueis',
					icon_url: process.env.ICO_SLOTS },
				description: `Cada rolagem custa ${script.format(price)}!\n`
					+ `Clique em ${process.env.EMT_REPEAT} para jogar! ~`
			}

			if(firstTime) {
				await message.channel.send({ embed: {
					color: process.env.COL_YELLOW,
					author: {
						name: 'Tabela de prêmios',
						icon_url: process.env.ICO_SLOTS
					},
					title: `Seu prêmio depende da combinação que vier!`,
					description: `💰💰💰 te dará ${script.format(prizes[0])}\n` +
						`🍋🍋🍋 te dará ${script.format(prizes[1])}\n` +
						`🍒🍒🍒 te dará ${script.format(prizes[2])}\n` +
						`🍉🍉🍉 te dará ${script.format(prizes[3])}`
				}});

				return sendMessage();
			}


			send.content += `você gastou ${script.format(price)}!`;
			await client.economy.cash(message.author.id, price, 'subtract', true);


			rollSlots();

			const heldItem = await (async () => {
				const pet = await client.economy.pet.get(message.author.id);
				if(pet) return pet.data.inventory.items.find(heldItem =>
					heldItem && heldItem.effect.type == 'giveBonusBet');
			})();

			if(heldItem && !prize.value)
				await rollSlots();

			await mergeImg(images).then(async output => {
				await output.scale(0.7).write('./data/slots/out.png', async () => {
					send.files = [{ attachment: './data/slots/out.png', name: 'out.png' }];
					send.embed.image = { url: 'attachment://out.png' };
					sendMessage();
				});
			});
		} catch(e) { script.error(message, e, 'play slots') }

		async function rollSlots() {
			let roll = { results: [], quantities: { '💰': 0, '🍋': 0, '🍒': 0, '🍉': 0 } };
			for(let i = 0; i < 3; i++)				
				roll.results.push(chance.pickone(['💰', '🍋', '🍋', '🍒', '🍒', '🍒', '🍉', '🍉', '🍉', '🍉', '🍉']))

			images = [];
			for(const emt of roll.results) {
				switch(emt) {
					case '💰':
						roll.quantities['💰']++;
						images.push(process.env.ICO_CASH);
						break;
					case '🍋':
						roll.quantities['🍋']++;
						images.push(process.env.ICO_LEMON);
						break;
					case '🍒':
						roll.quantities['🍒']++;
						images.push(process.env.ICO_CHERRY);
						break;
					case '🍉':
						roll.quantities['🍉']++;
						images.push(process.env.ICO_MELON);
						break;
				}
			}

			if(roll.quantities['💰'] == 3)
				prize.value = prizes[0];
			else if(roll.quantities['🍋'] == 3)
				prize.value = prizes[1];
			else if(roll.quantities['🍒'] == 3)
				prize.value = prizes[2];
			else if(roll.quantities['🍉'] == 3)
				prize.value = prizes[3];
			if(prize.value) prize.roll = roll.results.join('');
		}

		async function sendMessage() {
			try {
				send.embed.footer = {
					text: 'Você tem ' + (() => {
						const { account } = client.economy.get(message.author.id);
						return script.format(account.cash.balance);
					})() + ' na carteira.'
				}
				
				let slotMessage;
				await message.channel.send(send)
				.then(msg => slotMessage = msg)
				.catch(e => script.error(message, e, 'play slots'));

				if(prize.roll) {
					await client.economy.cash(message.author.id, prize.value, 'add', true);
					script.reply(message, `parabéns! Você rolou \`${prize.roll}\` e ganhou ${script.format(prize.value)}!`);
				}		
					

				await slotMessage.react(process.env.EMT_REPEAT);
				
				const filter = (reaction, author) => {
					return [process.env.EMT_REPEAT].includes(reaction.emoji.name) && author.id == message.author.id; };    
					slotMessage.awaitReactions(filter, { max: 1 })
				.then(async () => {
					await slotMessage.delete();
					message.cmd.run({client, script, message}, false);
				}).catch(e => { script.error(message, e, 'play slots'); });
			} catch(e) { script.error(message, e, 'play slots') }
		}
	},

  config: {
    permissions: ['EMBED_LINKS', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY']
  },
  
	help: {
		aliases: ['caça-níquel', 'caçaniquel', 'slot', 'slotsmachine', 'slots-machine', 'slotmachine', 'slot-machine'],
		description: 'Jogue na máquina de caça-níquel e tenha a chance de ganhar uma série de prêmios!'
	}
};