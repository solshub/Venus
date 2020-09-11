module.exports = {
	run: async ({client, script, message}) => {
    if((message.command == 'jump' && message.content.includes('over')) ||
    (message.command == 'pular' && message.content.includes('em cima')))
      return script.delete(`desculpa desculpa, eu não conheço nenhum comando com o nome \`${message.command}\`.`, message);

    let action = script.getAction(message);
    action.message = 'pulou em cima de ';
    script.monitor.action({client, script, message}, action);
	},

	help: {
      aliases: ['jump-over', 'pular-em-cima', 'pular', 'jump'],
      description: 'Dê um selinho na bochecha de alguém!'
	}
};