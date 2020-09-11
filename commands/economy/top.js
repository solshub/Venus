module.exports = {
	run: async ({client, script, message}) => {
    let users = [];
    const pet = script.contains(message.args, ['pet', 'pets', 'mascote']);
    try {
      const global = message.args.includes('global');
      const cash = script.contains(message.args, ['cash', 'dinheiro', 'sóis']);
      const mail = script.contains(message.args, ['mail', 'mails', 'correio', 'correios']);
      const sent = script.contains(message.args, ['sent', 'enviado', 'enviados', 'envio', 'envios']);

      if(!message.guild) message.args.push('global');
    
      if(!Object.values(client.economy).length)
        client.economy.get(message.author.id);

      for(const [key, values] of Object.entries(client.economy)
      .filter(([, values]) => typeof values.cash == 'object')) {
        if(global)
          for(const server of Object.keys(values.exp)) await pushUser(server, key, values);
        else await pushUser(message.guild.id, key, values);
      }

      users = users.sort((a,b) => {
        let valA, valB;
        if(pet) {
          valA = a.pet.data.love; valB = b.pet.data.love;
        } else if(cash) {
          valA = a.cash; valB = b.cash;
        } else if(mail) {
          if(sent) {
            valA = a.mail.sent.total; valB = b.mail.sent.total;
          } else { valA = a.mail.received.total; valB = b.mail.received.total }
        } else { valA = a.exp; valB = b.exp; }
          
        return (valA > valB) ? 1 : ((valB > valA) ? -1 : 0)
      }).reverse();

      const pages = Math.floor(users.length / 4);
      let page = message.args.find(arg => !isNaN(arg)) || 1;
      users = users.slice((page * 5) - 5, (page * 5));

      if(users.length < 1)
        if(pages == 0) return script.delete(`ué... Parece que o rank está vazio!`, message)
        else return script.delete(`esse ranking só vai até a pagina ${pages}.`, message)

      let embed = {
        color: process.env.COL_YELLOW,
        author: {
          name: `Ranking de ${pet ? 'pets' : (mail ? 'mails ' + (sent ? 'enviados' : 'recebidos') : (cash ? 'sóis' : 'nível'))} (pág. ${page})`,
          icon_url: pet ? process.env.ICO_PET : (cash ? process.env.ICO_WALLET : (mail ? process.env.ICO_MAIL : process.env.ICO_TROPHY))
        },
        footer: {
          text: (!global ? `"${process.env.PREFIX}${message.command} global" para ver estatísticas globais.\n` : '') +
            (!cash || mail ? `"${process.env.PREFIX}${message.command} cash" pra classificar por dinheiro.\n` : '') +
            (!mail ? `"${process.env.PREFIX}${message.command} mail" pra classificar por correios.\n` :
              !sent ? `"${process.env.PREFIX}${message.command} mail sent" pra classificar por mails enviados.\n` : '') +
            (!pet ? `"${process.env.PREFIX}${message.command} pet" pra classificar pets e donos.\n` : '') +
            `Top #${(page * 5) - 4} ao #${page * 5}. Página ${page} de ${pages}.`
        },
        fields: []
      }

      for(let user of users) {
        await client.users.fetch(String(user.id))
        .then(member => {
          const position = users.findIndex(u => u == user);

          if(!pet)
            embed.fields.push({
              name: `#${position + 1 + ((page - 1) * 5)}. ${member.username} | Nível ${user.level}`,
              value: mail ? `Mails: ${user.mail.received.total} recebidos | ${user.mail.sent.total} enviados` :
                  (cash ? `${user.exp} pontos | ${script.format(user.cash)}` :
                  `${user.msgs} mensagens | ${user.acts} interações`)
            });
          else
            embed.fields.push({
              name: `#${position + 1 + ((page - 1) * 5)}. ${user.pet.owner.username.split(' ')[0]}#${user.pet.owner.discriminator} & ${user.pet.pet.username.split(' ')[0]}#${user.pet.pet.discriminator}`,
              value: (global ? '' : `Pet: <@${user.pet.pet.id}>\nDone: <@${user.pet.owner.id}>\n`) +
                `\`Pontos de amor: ${user.pet.data.love} ${process.env.SYM_LOVE}\``
            })
        }).catch(e => { script.error(message, e, 'check the leaderboard') });
      }

      if(embed.fields.length < 1)
        return script.delete(`Parece que ainda não tenho informações suficientes desse servidor! Tente usar \`${process.env.PREFIX}${message.command} global\`. ~`, message);

      const content = (pages > 1 && `Use \`${process.env.PREFIX}${message.command} [número-da-página]\` para mudar de página.`) || undefined;
      message.channel.send({ content, embed })
      .catch(e => { script.error(message, e, 'check the leaderboard') });
    } catch(e) { script.error(message, e, 'check the leaderboard') }

    async function pushUser(server, key, values) {
      const cash = values.cash.balance;

      if(!values.exp[server]) return;
      const msgs = values.exp[server].messages;
      const acts = values.exp[server].interactions;
      const exp = msgs + (acts * 5),
      level = values.exp[server].oldLevel;

      const user = { id: key, exp, msgs, acts, level, cash, server }
      const repeatedUser = users.find(user => user.id == key);
      user.mail = repeatedUser ? repeatedUser.mail : await client.mail.data(key);
      user.pet = repeatedUser ? repeatedUser.pet : await (async () => {
        const pet = await client.economy.pet.get(key);
        if(pet) {
          if(pet.authorIs == 'pet') return;
          pet.pet = pet.subject;

          pet.owner = await (async () => {
            let fetched;
            await client.users.fetch(String(pet.ownerId))
            .then(user => fetched = user)
            .catch(e => { console.log(`Something went wrong when trying to get pet owner data:\n${e}`); });
            return fetched;            
          })();
        }

        return pet;
      })();
      if(pet) if(!user.pet) return;

      if(repeatedUser && repeatedUser.level < level)
        users[users.indexOf(repeatedUser)] = user;
      else
        users.push(user);
    }    
  },
  
  config: {
    permissions: ['EMBED_LINKS']
  },

	help: {
		aliases: ['leaderboard', 'leader', 'board', 'ranking'],
    description: 'Veja o ranking de pessoas com mais nível no servidor!\n' +
      'Use `cash` para ver os que tem mais dinheiro,\n' +
      'ou `global` para ver as estatísticas entre todos os usuários.',
    usage: 'global [cash OU mail sent OU pet]'
	}
};