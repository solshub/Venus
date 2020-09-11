module.exports = {
	run: async ({client, script, message}) => {
    let action = script.getAction(message);
    action.message = 'deu um murro em';
    script.monitor.action({client, script, message}, action);
	},

	help: {
		aliases: ['soco', 'socar', 'soca', 'murro', 'desceraporradaintensamente', 'desceaporrada', 'desce-a-porrada', 'porrada'],
    description: 'Dê um soco em algum otário.'
  }
};