module.exports = {
	run: async ({client, script, message}) => {
    let action = script.getAction(message);
    action.message = 'lambeu o rosto de';
    script.monitor.action({client, script, message}, action);
	},

	help: {
		aliases: ['lamber', 'lambe', 'lambida'],
		description: 'Dê uma lambida no rosto de alguém. ~'
	}
};