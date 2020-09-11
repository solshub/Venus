const moment = require('moment');

module.exports = {
	run: async ({client, script, message}) => {
		let pet;
		try {
			pet = await client.economy.pet.get(message.author.id);
			if(!pet) return script.delete('pra usar esse comando você precisa primeiro ter um pet ou ser o pet de alguém!' + ` Que tal adotar alguém com \`${process.env.PREFIX}adopt @[usuário]\`?`, message);

			pet.owner = await (async () => {
				let fetched;
				await client.users.fetch(pet.ownerId)
				.then(user => fetched = user)
				.catch(e => { console.log(`Something went wrong when trying to get pet owner data:\n${e}`); });
				return fetched;
			})();

			pet.pet = await (async () => {
				let fetched;
				await client.users.fetch(pet.petId)
				.then(user => fetched = user)
				.catch(e => { console.log(`Something went wrong when trying to get pet owner data:\n${e}`); });
				return fetched;
			})();

			getProfile();
		} catch(e) { script.error(message, e, 'get pet profile') }


		async function getProfile() {
			try {
				const full = script.contains(message.args, ['full', 'completo', 'details', 'detalhes', 'total']);
				let send = {
					content: (full && pet.authorIs == 'owner') ? `alimente seu pet com \`${process.env.PREFIX}feed\`, e o divirta usando interações como \`${process.env.PREFIX}hug\` com ele. ` +
						`Dê uma olhada no \`${process.env.PREFIX}petshop\` pra comprar itens novos, e troque os papéis quando quiser usando \`${process.env.PREFIX}switch\`! ~` :
						`Use \`${process.env.PREFIX}${message.command} full\` pra mais informações.`
				};			
				

				const average = ((pet.data.food + pet.data.fun) / 2)
				const state = (() => {
					if(average == 100) return 'sensacional';
					else if(average >= 90) return 'muito alegre';
					else if(average >= 70) return 'energético';
					else if(average >= 60) return 'bem';
					else if(average >= 50) return 'neutro';
					else if(average >= 40) return 'pra baixo';
					else if(average >= 30) return 'desconfortável';
					else if(average >= 20) return 'muito mal';
					else if(average >= 10) return 'terrível';
					else return 'abandonado';
				})();

				send.embed = {
					author: {
						name: `${pet.pet.username.split(' ')[0]} é um pet!`,
						icon_url: pet.pet.avatarURL() },
					title: `Pontos de amor: **${pet.data.love} ${process.env.SYM_LOVE}**`,
					description: `O pet está se sentindo... \`${state}\`!`,
					fields: [
						{
							name: "Fome",
							value: generateBar(pet.data.food, process.env.EMT_FOOD),
							inline: true
						},
						{
							name: "Diversão",
							value: generateBar(pet.data.fun, process.env.EMT_FUN),
							inline: true
						}
					]
				}
		
				const heldItem = pet.data.inventory.items.find(heldItem =>
					heldItem && heldItem.effect.type == 'mascotColor');
				if(heldItem)
					send.embed.color = heldItem.effect.value;
				else
					send.embed.color = average >= 66 ? process.env.COL_GREEN :
						(average >= 33 ? process.env.COL_YELLOW : process.env.COL_RED);
		
				if(full) {
					send.embed.description = `Pet: <@${pet.pet.id}>\nDone: <@${pet.owner.id}>\n` +
						send.embed.description + `\nHoje, elu está... ` +
						`\`${pet.data.washed && (moment().diff(moment(pet.data.washed), 'hours') < 12) ?
							'limpo ✨' : 'sujo'}\`!`;
					send.embed.fields.push({
						name: `Itens equipados`,
						value: `${getItems(pet.data.inventory.items)}`
					});
					send.embed.footer = { text: 'Pet desde' };
					send.embed.timestamp = moment(pet.data.since);
				}
		
				script.reply(message, send);
			} catch(e) { script.error(message, e, 'get pet profile') }


			function generateBar(value, emote) {
				try {
					let i = 10, strBar = '';
		
					for(i; i <= value; i += 10) {
						strBar += emote;
						if(i == 50)
							strBar += ' \n ';
					}
					for(i; i <= 100; i += 10) {
						strBar += '✖️';
						if(!strBar.includes('\n') && i == 50) 
							strBar += ' \n ';
					}
					
					return `\` ${strBar} \``;
				} catch(e) { script.error(message, e, 'get pet profile') }
			}

			function getItems(items) {
				try {
					let strItems = '';
					for(const item of items)
						if(item)
							strItems += `${(item.ico && item.ico + ' ') || ''}` +
								`${script.capitalize(item.name)}\n` +
								`*${(item.effectStr && script.capitalize(item.effectStr)) || script.capitalize('sem efeitos adicionais...')}*\n`;
		
					return strItems;
				} catch(e) { script.error(message, e, 'get pet profile') }
			}
		}
	},

	config: {
		permissions: ['EMBED_LINKS', 'USE_EXTERNAL_EMOJIS']
	},

	help: {
		aliases: ['mascot', 'petprofile', 'pet-profile', 'profilepet', 'profile-pet', 'petperfil', 'pet-perfil', 'perfilpet', 'pet-perfil', 'mascote'],
		usage: 'full',
		description: 'Veja a ficha do seu pet, com todas as informações sobre ele!'
	}
};