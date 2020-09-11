module.exports = {
	run: async ({client, script, message}) => {
		try {
			const pet = await client.economy.pet.get(message.author.id);
			if(!pet) return script.delete('pra usar esse comando você precisa primeiro ter um pet ou ser o pet de alguém!' + ` Que tal adotar alguém com \`${process.env.PREFIX}adopt @[usuário]\`?`, message);

			if(pet.data.love - 100 < 0)
				return script.delete(`você e seu ${pet.authorIs == 'pet' ? 'dono' : 'pet'} ` +
					`não tem pontos de amor suficientes! Vocês precisam de pelo menos 100 ${process.env.SYM_LOVE}, ` +
					'interajam mais até chegarem lá.', message);

			const doSwitch = async () => {
				await client.economy.pet.switch(pet.ownerId, pet.petId);
				script.reply(message, 'troca de papéis realizada com sucesso! :3' +
					`\n100 ${process.env.SYM_LOVE} pontos de amor foram descontados. ~`); }

			const { is, opposite } = pet.authorIs == 'pet' ? { is: 'pet', opposite: 'dono' } : { is: 'dono', opposite: 'pet' };
			script.waitApproval('deseja mesmo fazer isso?? ' +
				`Você e seu ${opposite} trocarão papéis, ` +
				`com <@${pet.authorIs == 'pet' ? pet.ownerId : pet.petId }> ` +
				`virando seu ${is} e você se tornando ${opposite}.` +
				`\nAh, fazer isso custará 100 ${process.env.SYM_LOVE} pontos de amor!`, message, doSwitch);
		} catch(e) { script.error(message, e, 'switch between pet and owner') }
	},

	config: {
		guild: true,
		permissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY']
	},

	help: {
		aliases: ['trocar', 'revesar', 'alternar'],
		description: 'O que acha de ter seu pet como seu dono? Ou seu dono como seu pet? ~'
	}
};