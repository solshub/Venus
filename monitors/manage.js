module.exports = async ({client, script, message}, operation) => {
  try {
		if(message.guild)
			return script.delete(`por favor use esse comando na minha dm! Recomendo que use \`${process.env.PREFIX}mail\` antes pra ter certeza dos IDs.`, message);
		
		let ids = (() => {
      let idsInput = message.args.filter(arg => !isNaN(arg));
      let idsOutput = [];
      for(let id of idsInput)
        idsOutput.push(id - 1);
			const noDuplicate = new Set(idsOutput);
			return [...noDuplicate];
		})();

		if(ids.length < 1)
			return script.delete(`diga quais mensagens você deseja ${operation == 'hide' ? 'ocultar ou revelar' : 'apagar'}! Use \`${process.env.PREFIX}mail\` pra saber os ids de cada mensagem e use-os com \`${process.env.PREFIX}${message.command} ${message.help.usage}\``);
		const { embeds, mails } = await client.mail.getMails(message);

		let boards = [], notFound = [], found = [];

		let i = 0, j = 0;
		for(const id of ids) {
			const embed = embeds[id];
			if(embed) {
				if((i % 10) == 0) {
					if(i > 0) j++;
					boards[j] = {
						color: process.env.COL_BLUE,
						author: {
							name: 'Mensagens a serem processadas',
							icon_url: message.author.avatarURL()
						},
						fields: []
					}
				}

				boards[j].fields.push({
          name: `\`#${id + 1}\` ` + embed.embed.author.name +
            (operation == 'hide' ?
            ('\nEssa mensagem será ' + (embed.mail.hidden ? 'REVELADA!' : 'OCULTA!')) :
            (embed.mail.hidden ? '\nEssa mensagem está oculta!' : '')),
					value: embed.embed.description
				})

				found.push(id);
				i++;
			} else notFound.push(id + 1);
		}

		if(notFound.length > 0)
			script.reply(message, 'desculpe, não consegui encontrar nenhuma mensagem com ' + (notFound.length > 1 ? 'os ids' : 'o id') + ` \`${notFound.join(', ')}\`.`);
		if(found.length < 1) return;

		const processMails = () => {
      try {
        for(const id of found) {
          const index = mails.findIndex(mail =>
            mail == embeds[id].mail );
          client.mail.alter(operation, index, message.author.id); }
  
        script.reply(message, 'mensagens ' + (operation == 'hide' ? 'reveladas/ocultas' : 'apagadas') + ' com sucesso! ' + process.env.EMT_MAIL)
      } catch(e) { script.error(message, e, 'manage a mail') }
		}

		for(const embed of boards) {
			await message.channel.send({ embed })
			.catch(e => script.error(message, e, 'check mails')); }
		script.waitApproval('deseja mesmo ' + (operation == 'hide' ? 'revelar ou ocultar' : 'apagar') + ' as mensagens listadas acima? ' + (operation == 'hide' ? 'Essa ação é irreversível!' : ''), message, processMails);
  } catch(e) { script.error(message, e, 'manage a mail') }
}