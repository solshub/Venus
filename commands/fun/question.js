const Chance = require('chance');
const chance = new Chance();

module.exports = {
	run: async ({client, script, message}) => {
    try {
      const embed = {
        color: process.env.COL_BLUE,
        author: {
          icon_url: process.env.ICO_QUESTION,
          name: chance.pickone(client.questions)
        }
      }

      let questionMessage;
      await message.channel.send({
        content: (message.guild) ? 'Quero todo mundo online respondendo!' : '',
        embed
      }).then(msg => questionMessage = msg)
      .catch(e => { script.error(message, e, 'send a question') })

      
    script.awaitRepeat(questionMessage, message.author.id, {client, script, message}, message.cmd.run, false);
    } catch(e) { script.error(message, e, 'send question') }
	},

	help: {
		aliases: ['topic', 'assunto', 'pergunta', 'questão'],
		description: 'Precisa de assunto? Gere uma pergunta aleatória!'
	}
};