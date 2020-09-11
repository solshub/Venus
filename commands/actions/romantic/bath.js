module.exports = {
	run: async ({client, script, message}) => {
		const pet = await client.economy.pet.get(message.author.id);
		if(pet && pet.authorIs == 'pet')
			client.economy.pet.reminder({ owner: pet.subject, pet: message.author }, message, 'bath');

		let action = script.getAction(message);
		action.message = 'deu um bom banho em';
		script.monitor.action({client, script, message}, action);
	},

	help: {
		aliases: ['bathtub', 'shower', 'tub', 'lavar', 'lava', 'limpar', 'limpa', 'wash', 'banho', 'banhar'],
		description: 'Esfregue alguém em um bom banho! :3',
		hidden: true,
		permission: true
	}
};