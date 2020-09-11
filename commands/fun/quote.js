module.exports = {
	run: async ({script, message}) => {
		try {
      const id = message.args.find(arg => !isNaN(arg));
      if(!id) return script.delete('por favor inclua o ID da mensagem que deseja citar. ' + 
        'Modo de uso: ' + `\`${process.env.PREFIX}${message.command} ${message.cmd.help.usage}\`.`, message)
      message.message = message.message.replace(id, '').trim() || '';

      let quotation;
      await message.channel.messages.fetch(id)
      .then(msg => quotation = msg)
      .catch(() => {});
      if(!quotation) return script.delete(`não achei nenhuma mensagem de ID \`${id}\` neste canal!`, message);
  
      message.channel.send(message, {
        content: message.message.length > 0 ?
          `"${message.message}" *- <@${message.author.id}>*`
          : `<@${message.author.id}>, `,
        embed: {
        color: process.env.COL_BLUE,
        author: {
          name: `${quotation.author.username}#${quotation.author.discriminator} disse...`,
          icon_url: quotation.author.avatarURL()
        },
        description: quotation.content,
        footer: {
          text: 'Data de envio '
        },
        timestamp: quotation.createdTimestamp
      } });
		} catch(e) { script.error(message, e, 'quote a message') }
	},

	help: {
    aliases: ['menciona', 'mencionar'],
		description: 'Mencione a mensagem de outro usuário.',
		usage: '[id-da-mensagem]'
	}
};