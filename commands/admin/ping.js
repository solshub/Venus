module.exports = {
	run: async ({client, script, message}) => {
    try {
      message.channel.send({ embed: { 
        fields: [
          {
            name: 'Client',
            value: client.ws.ping + ' ms'
          }
        ]
      } }).catch(e => script.error(message, e, 'check ping'))
    } catch(e) { script.error(message, e, 'check ping') }
	},

	help: {
		aliases: [],
		description: 'cheque meu ping.'
	}
};