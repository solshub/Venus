module.exports = {
	run: async ({client, script, message}) => {
    try {
      const embed = {
        color: process.env.COL_BLUE,
        title: 'Atualização recebida!',
        timestamp: script.date()
      }

      const content = message.message.split('|');
      embed.description = content[0];
      if(content.length > 1) {
        embed.fields = [];
        if(content.length >= 3)
          embed.fields.push({
            name: content[1],
            value: content[2]
          })

        if(content.length >= 5)
          embed.fields.push({
            name: content[3],
            value: content[4]
          })
      }

      const send = async () => {
        for(const server of Object.entries(client.servers))
          if(typeof server[1] == 'object') {
            const guild = client.guilds.cache.get(String(server[0]))
            if(!guild.systemChannel || !await script.permissions(guild.systemChannel, ['VIEW_CHANNEL', 'SEND_MESSAGES'])) return;
            guild.systemChannel.send({ embed }); }
      }

      script.waitApproval({ content: 'tem certeza que deseja enviar essa mensagem para **TODOS** os servidores disponíveis?', embed }, message, send);
    } catch(e) { script.error(message, e, 'send a global warning.') }
	},

	help: {
		aliases: [],
		description: 'mande uma nota de atualização. Apenas Sol pode usar este comando.'
	}
};