module.exports = {
	run: async ({client, script, message}) => {
    let action = script.getAction(message);
    action.message = 'zoou';
    script.monitor.action({client, script, message}, action);
	},

	help: {
		aliases: ['zombar', 'zomba', 'zoar', 'zoa', 'debochar', 'debocha', 'língua', 'lingua', 'mostrarlingua', 'mostrarlíngua', 'mostrar-lingua', 'mostrar-lingua', 'mostraralingua', 'mostraralíngua', 'mostrar-a-lingua', 'mostrar-a-lingua'],
		description: 'Tire graça da cara de outra pessoa.'
	}
};