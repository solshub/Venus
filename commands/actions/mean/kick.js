module.exports = {
	run: async ({client, script, message}) => {
    let action = script.getAction(message);
    action.message = 'deu um chutão em';
    script.monitor.action({client, script, message}, action);
	},

	help: {
		aliases: ['chute', 'chutar', 'chuta', 'voadora'],
    description: 'Dê um chute em algum otário.'
  }
};