const isImage = require('is-image');

module.exports = {
	run: async ({script, message}) => {
    try {
      const usage = `Como usar: \`${process.env.PREFIX}${message.command} ${message.cmd.help.usage}\`.`;


      const color = message.message.split(' ').find(word =>
        word.startsWith('#') && (/[0-9A-Fa-f]{6}/g).test(word.replace('#', '')));
      message.message = message.message.replace(color, '').trim();


      const length = message.message.replace('|', '').length;
      if(length < 1)
        return script.delete(`qual é a mensagem que você deseja?? ` + usage, message);
      else if(length < 5)
        return script.delete(`por favor inclua uma mensagem maior! ` + usage, message);
        
      
      let embed = {
        color: process.env.COL_BLUE,
        timestamp: script.date(),
        title: 'ANÚNCIO',
        footer: { text: `Por: ${message.author.username}` }
      };

      if(color) {
        embed.color = color.replace('#', '');
        if(embed.color.toLowerCase() == 'ffffff')
          embed.color = 'fffffe'; }
      const content = message.message.split('|');

      if(content.length == 1)
        embed.description = content[0];
      else {
        embed.title = content[0]
        embed.description = content[1];
      }


      if(embed.title && embed.title.length > 208)
        return script.delete('você está tentando usar um título longo demais!' + usage, message);
      if(embed.description.length > 2000)
        return script.delete('você está tentando usar uma mensagem longa demais!' + usage, message);

      
      let image = message.args.find(arg => isImage(arg));

      if(!image && message.attachments.size > 0)
      for(let attachment of message.attachments) {
        attachment = attachment[1];
        if(!embed.image)
        if(attachment.url && isImage(attachment.url))
          image = attachment.url;
      }

      if(image) embed.image = { url: image };
      

      await message.channel.send({ embed });
    } catch(e) { script.error(message, e, 'make an announcement.') }
  },
  
  config: {
    administrator: true,
    permissions: ['EMBED_LINKS']
  },

	help: {
    aliases: ['announcement', 'anuncio', 'anúncio', 'aviso'],
    usage: '#[cor] [título] | [mensagem] [imagem]',
		description: 'Crie uma embed totalmente personalizada. Use o comando `.embed` para uma versão mais complexa dessa função.'
	}
};