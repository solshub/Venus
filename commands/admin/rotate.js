module.exports = {
	run: async ({client, script, message}) => {
    try {
      await script.timer.iconRotation({client});
      message.reply('pronto, mudei de icon! ~');
    } catch(e) { script.error(message, e, 'changing icon') }
	},

	help: {
		aliases: [],
		description: 'mude minha icon! Apenas Sol pode usar este comando.'
	}
};