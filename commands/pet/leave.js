module.exports = {
	run: async ({client, script, message}) => {
		try {
			const pet = await client.economy.pet.get(message.author.id);
			if(!pet) return script.delete('pra usar esse comando você precisa primeiro ter um pet ou ser o pet de alguém!' + ` Que tal adotar alguém com \`${process.env.PREFIX}adopt @[usuário]\`?`, message);

			const flee = () => {
				try {
					client.economy.pet.flee(pet.petId, pet.ownerId);
	
					script.reply(message,
						(pet.authorIs == 'pet' ?
						'parabéns, você escapou e reconquistou a liberdade!' :
						'poxa vida... Você abandonou mesmo seu pet... ;-;') +
						`\n<@${message.author.id}> e <@${pet.subject.id}> não são mais pet e dono.`);
				} catch(e) { script.error(message, e, 'flee from owner') }
			}
			const warning = '**Todo os pontos de amor e itens serão IRREVERSIVELMENTE perdidos!**'

			script.waitApproval(`deseja mesmo não ter mais <@${pet.subject.id}> como seu ${pet.authorIs == 'pet' ? 'dono' : 'pet'}?... ` + warning, message, () => {
				script.waitApproval(`<@${message.author.id}> não deseja mais ter você como ${pet.authorIs == 'pet' ? 'dono' : 'pet'}... Tudo bem pra você? ` + warning, message, flee, { user: pet.subject }); });
		} catch(e) { script.error(message, e, 'flee from owner') }
	},

	config: {
		guild: true,
		permissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY']
	},

	help: {
		aliases: ['abandon', 'abandonar', 'flee'],
		description: 'As coisas não estão indo bem?... Então, escape de seu dono, ou abandone ou seu pet!'
	}
};