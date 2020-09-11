module.exports = {
	run: async ({client, script, message}) => {
    let action = script.getAction(message);
    action.message = 'saiu correndo de perto de';
    script.monitor.action({client, script, message}, action);
	},

	help: {
		aliases: ['escape', 'escapa', 'escapar', 'corre', 'correr', 'fugir', 'fugir-de', 'fugirde', 'foge', 'runaway', 'run-away'],
		description: 'Tire graça da cara de outra pessoa.'
	}
};