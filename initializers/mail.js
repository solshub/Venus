const { writeFileSync } = require('fs');

module.exports = async ({client, script}) => {
  client.mail = require('../data/mail.json');

  client.mail.save = () => {
    writeFileSync('./data/mail.json', JSON.stringify(client.mail, null, 1));
  };

  client.mail.get = async (userId) => {
    try {
      if(!isNaN(userId)) userId = String(userId);

      if(!Array.isArray(client.mail[userId])) {
        if(isNaN(userId)) throw new Error('Invalid server insert into economy.');
        client.mail[userId] = [{
          author: String(client.user.id),
          message: 'Olá! Essa é o sua caixa de correios! 💕\n' + 
            'Essa mensagem é só um exemplo. ~\n' +
            `Você pode mandar mensagens para outros usuários com \`${process.env.PREFIX}send\`, e todos os correios que você receber aparecerão aqui!\n`+
            'Espero que você se divirta e receba muitos correios! :3 💖\n\n'+
            'Ah! Mensagens também podem ser anônimas. >-<',
          timestamp: script.date(),
          anon: false,
          hidden: false,
          deleted: false
        }];

        await client.mail.save();
      }

      client.mail[userId].sort((a, b) => {
        const valA = a.timestamp, valB = b.timestamp;
        return (valA > valB) ? 1 : ((valB > valA) ? -1 : 0);
      }).reverse();

      return client.mail[userId];
    } catch(e) { console.log(`Something went wrong when trying to get mails:\n${e}`); }
  };

  client.mail.send = async (userId, subjectId, message, { anon , hidden, embed }) => {
    try {
      if(!isNaN(userId)) userId = String(userId);
      if(!isNaN(subjectId)) subjectId = String(subjectId);

      await client.mail.get(userId);
      let mails = await client.mail.get(subjectId);

      mails.push({
        author: userId,
        message: message,
        timestamp: script.date(),
        anon,
        hidden,
        deleted: false
      });

      mails = mails.sort((a,b) => {
        const valA = a.timestamp, valB = b.timestamp;        
        return (valA > valB) ? 1 : ((valB > valA) ? -1 : 0)
      }).reverse();

      await client.mail.save();

      if(!embed) return;
      
      await client.users.fetch(subjectId)
      .then(user => user.send({
        content: 'Oi! Você acabou de receber uma mensagem nova!\n' +
          'Use `.mail` para ver toda sua caixa de correio e ter a opção de apagar ou ocultar essa mensagem.',
        embed
      })).catch(e => { console.log(`Something went wrong when trying to send mail:\n${e}`); });
    } catch(e) { console.log(`Something went wrong when trying to send mail:\n${e}`); }
  };

  client.mail.alter = async (operation, index, userId, message) => {
    try {
      if(!isNaN(userId)) userId = String(userId);

      if(operation == 'delete') client.mail[userId][index].deleted = true;
      if(operation == 'hide') client.mail[userId][index].hidden = !client.mail[userId][index].hidden;

      if(message) script.reply(message, `mensagem ${operation == 'delete' ? 'apagada' : (client.mail[userId][index].hidden ? 'oculta' : 'revelada')} com sucesso! ` + process.env.EMT_MAIL);
      await client.mail.save();
    } catch(e) { console.log(`Something went wrong when trying to alter mail:\n${e}`); }
  }

  client.mail.getMails = async (message, author) => {
    try {
      let mails = await client.mail
      .get(message.author.id)
      .catch(e => { script.error(message, e, 'check mails') });

      mails = mails.sort((a,b) => {
        const valA = a.timestamp, valB = b.timestamp;          
        return (valA > valB) ? 1 : ((valB > valA) ? -1 : 0)
      }).reverse();

      let embeds = [];
      for(const mail of mails) {
        if((!mail.hidden || !message.guild) && !mail.deleted)
        if(!author || ((author == 'anon' && mail.anon) || !mail.anon && (mail.author == author.id))) {
          let author = {
            name: `Um anônimo te enviou...`,
            icon_url: process.env.ICO_ANON };

          if(!mail.anon)
            await client.users.fetch(mail.author)
            .then(user => {
              author = {
                name: `${user.username}#${user.discriminator} te enviou...`,
                icon_url: user.avatarURL() };
            }).catch(e => { script.error(message, e, 'check mails') });
    
          embeds.push({
            embed: {
              author,
              description: mail.message,
              footer: {
                text: (mail.hidden ? 'Mensagem oculta!\n' : '') +
                  'Data de envio' },
              timestamp: mail.timestamp,
              color: mail.hidden ? process.env.COL_YELLOW : process.env.COL_WHITE
            },
            mail
          });
        }
      }

      return { embeds, mails };			
    } catch(e) { script.error(message, e, 'check mails') }
  }

  client.mail.data = async (userId) => {
    try {
      if(!isNaN(userId)) userId = String(userId);
      await client.mail.get(userId);

      let received = { total: 0, hidden: 0, anon: 0, authors: {}, most: { author: undefined, quantity: 0 } };

      for(const mail of client.mail[userId]) {
        if(!mail.deleted)
        if(mail.author != process.env.USER_VENUS) {
          received.total++;
          if(mail.hidden) received.hidden++;
          if(mail.anon) received.anon++;
          else 
            received.authors[mail.author] = received.authors[mail.author] ? received.authors[mail.author] + 1 : 1;
        }
      }

      for(const [authorId, quantity] of Object.entries(received.authors))
        if(quantity > received.most.quantity)
          received.most = { author: authorId, quantity };


      let sent = { total: 0, hidden: 0, anon: 0, subjects: {}, most: { subject: undefined, quantity: 0 } };

      for(const [subjectId, mails] of Object.entries(client.mail)) {
        if(Array.isArray(mails))
          for(const mail of mails) {
            if(mail.author == userId)
            if(!mail.deleted) {
              sent.total++;
              if(mail.hidden) sent.hidden++;
              if(mail.anon) sent.anon++;
              else 
                sent.subjects[subjectId] = sent.subjects[subjectId] ? sent.subjects[subjectId] + 1 : 1;
            }
          }
      }

      for(const [subjectId, quantity] of Object.entries(sent.subjects))
        if(quantity > sent.most.quantity)
          sent.most = { subject: subjectId, quantity };

      return { received, sent };
		} catch(e) { console.log('Something went wrong trying to get mails data:\n' + e) }
  }
}