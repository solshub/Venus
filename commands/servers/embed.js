const isImage = require('is-image');

module.exports = {
	run: async ({script, message}) => {
    const embed = {};
    let embedMessage, requestMessage;

    async function showCurrent() {
      if(embedMessage) embedMessage.delete();
      await message.channel.send({ content: 'Esse é seu embed até agora: ', embed })
      .then(msg => embedMessage = msg);
    }

    async function updateRequest(request, empty) {
      if(requestMessage) requestMessage.delete();
      await message.channel.send(`<@${message.author.id}>, ${request}? `+
        `Envie ${empty ? '`NONE` para deixar vazio, ' : ''}` +
        `\`CANCEL\` para cancelar a criação ou \`DONE\` para concluir.`)
      .then(msg => requestMessage = msg);
    }


    const filter = (msg) => msg.author.id == message.author.id;

    const options = (content, callback, empty) => {
      switch(content.toLowerCase()) {
        case 'none':
        case 'nenhum':
          if(empty) {
            callback();
            return true;
          } else return;
        case 'cancel':
        case 'cancelar':
        case 'cancela':
        case 'cancele':    
          return true;
        case 'done':
        case 'pronto':
        case 'concluir':
        case 'concluído':
          done();
          return true;
      }
    }

    async function deleteMessages(timeout) {
      if(embedMessage) await embedMessage.delete();
      if(requestMessage) await requestMessage.delete();
      if(timeout) script.delete('O tempo esgotou! Por favor tente novamente do começo.');
    }

    async function done() {
      await deleteMessages();
      await message.channel.send({ embed });
    }


    const createTitle = async () => {
      await showCurrent();
      await updateRequest('Qual você deseja que seja o título do embed?', true);
      await message.channel.awaitMessages(filter, { time: 30000, errors: ['time'] })
      .then(async msg => {
        const quit = options(msg.content, createAuthorName, true);
        if(quit) return;

        if(msg.content.length > 246) {
          script.delete('Por favor envie um título com menos de 246 caracteres.', message);
          return createTitle();
        }

        await msg.delete().catch(() => {});
        embed.title = msg.content;
        createAuthorName();
      }).catch(async () => await deleteMessages(true));
    }

    createTitle();

    const createAuthorName = async () => {
      await showCurrent();
      await updateRequest('Você deseja que o embed tenha um autor? Se sim, qual será o texto?', true);
      await message.channel.awaitMessages(filter, { time: 30000, errors: ['time'] })
      .then(async msg => {
        const quit = options(msg.content, createDescription, true);
        if(quit) return;

        if(msg.content.length > 246) {
          script.delete('Por favor envie um autor com menos de 246 caracteres.', message);
          return createAuthorName();
        }

        await msg.delete().catch(() => {});
        embed.author = { name: msg.content };
        createAuthorIcon();
      }).catch(async () => await deleteMessages(true));
    }

    const createAuthorIcon = async () => {
      await showCurrent();
      await updateRequest('Você deseja adicionar alguma imagem ao lado do nome do autor?', true);
      await message.channel.awaitMessages(filter, { time: 30000, errors: ['time'] })
      .then(async msg => {
        const quit = options(msg.content, createDescription, true);
        if(quit) return;
        
        let image = message.args.find(arg => isImage(arg));

        if(!image && message.attachments.size > 0)
        for(let attachment of message.attachments) {
          attachment = attachment[1];
          if(!embed.image)
          if(attachment.url && isImage(attachment.url))
            image = attachment.url;
        }

        if(!image) {
          script.delete('Por favor inclua uma imagem válida.', message);
          return createAuthorIcon();
        }

        await msg.delete().catch(() => {});
        embed.author.icon_url = image;
        createDescription();
      }).catch(async () => await deleteMessages(true));
    }


    const createDescription = async () => {
      await showCurrent();
      await updateRequest('Qual será a descrição de seu embed?', true);
      await message.channel.awaitMessages(filter, { time: 30000, errors: ['time'] })
      .then(async msg => {
        const quit = options(msg.content, createDescription, true);
        if(quit) return;

        if(msg.content.length > 246) {
          script.delete('Por favor envie um nome de author com menos de 246 caracteres.', message);
          return createTitle();
        }

        await msg.delete().catch(() => {});
        embed.title = msg.content;
        createAuthorName();
      }).catch(async () => await deleteMessages(true));
    }
  },
  
  config: {
    administrator: true,
    permissions: ['EMBED_LINKS']
  },

	help: {
    aliases: [],
		description: 'Crie uma embed totalmente personalizada. Use o comando `.announce` para uma versão mais simples dessa função.'
	}
};