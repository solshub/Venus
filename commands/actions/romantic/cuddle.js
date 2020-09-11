module.exports = {
	run: async ({client, script, message}) => {
		let action = script.getAction(message);
		action.message = 'fez cafuné em';
		script.monitor.action({client, script, message}, action);
	},

	help: {
		aliases: ['cafuné', 'cafune', 'pat', 'acariciar', 'acaricia', 'esfrega', 'esfregar', 'carinho', 'snuggle'],
		description: 'Faça cafuné gostosinho em alguém.'
	}
};