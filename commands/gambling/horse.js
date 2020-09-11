const Chance = require('chance');
const chance = new Chance();

module.exports = {
	run: async ({client, script, message}) => {
    let bet, horse;
    try {
      bet = message.args.find(arg => !isNaN(arg));
      if(bet) {
        const { account } = client.economy.get(message.author.id);
        if(bet < account.balance)
          return script.delete('você não tem sóis suficientes pra fazer essa aposta!', message); }

      const embed = {
        color: process.env.COL_YELLOW,
        author: {
          name: 'Corrida de cavalos!',
          icon_url: process.env.ICO_HORSE
        },
        description: 'Reaja na que quiser apostar!\n' +
          (bet ? `${script.format(bet)} estão em jogo!\nPerca tudo, ou leve 4x isso!` :
          'Você não está apostando dinheiro. :3'),
        fields: []
      }

      const horses = [
        ['laranja', process.env.EMT_ORANGE],
        ['verde', process.env.EMT_GREEN],
        ['roxo', process.env.EMT_PURPLE],
        ['marrom', process.env.EMT_BROWN]
      ]

      for(const horse of horses) {
        embed.fields.push({
          name: `Cavalo ${horse[0]}`,
          value: `\`${horse[1]}\` <:cavalo:739196391779336293> . . . . . . . 🏁`,
          position: 0 });
      }

      let horseMessage;
      await message.channel.send({ content: `<@${message.author.id}>, `, embed })
      .then(msg => horseMessage = msg)
      .catch(e => script.error(message, e, 'horse race'));

      for(const horse of horses)
        await horseMessage.react(horse[1])
        .catch(e => script.error(message, e, 'horse race'));

      const filter = (reaction, author) => {
        return horses.some(horse => horse[1] == reaction.emoji.name) &&
        author.id == message.author.id; };
      await horseMessage.awaitReactions(filter, { max: 1 })    
      .then(async (collected) => {
        collected = collected.first();
        horse = horses.find(horse => horse[1] == collected.emoji.name);
      }).catch(e => { script.error(message, e, 'horse race'); });
      if(!horse) throw new Error('could not find horse color');

      horseMessage.delete();

      embed.description = `Você apostou ${bet ? `${script.format(bet)} ` : ''}no ${horse[0]}!`
      let horseRace;
      await message.channel.send({
        content: `<@${message.author.id}>, boa sorte!`,
        embed
      }).then(msg => horseRace = msg)
      .catch(e => script.error(message, e, 'horse race'));
    

      const heldItem = await (async () => {
        const pet = await client.economy.pet.get(message.author.id);
        if(pet) return pet.data.inventory.items.find(heldItem =>
          heldItem && heldItem.effect.type == 'giveBonusBet');
      })();

      race(embed, horseRace, heldItem);
    } catch(e) { script.error(message, e, 'horse race') }

    async function race(embed, horseRace, heldItem) {
      try {    
        const winner = advancePosition(chance.weighted(embed.fields, (() => {
          let chances = [];
          for(const name in embed.fields)
            chances.push(name.replace('Cavalo ', '') == horse[0] ? (heldItem ? 1.25 : 0.95) : 1);
          return chances;
        })()));
        
        await horseRace.edit({ content: horseRace.content, embed })
        .then(() => {
          if(winner) announceWinner(winner);
          else setTimeout(async () => {
            await race(embed, horseRace, heldItem) }, 750);
        });
      } catch(e) { script.error(message, e, 'horse race') }

      function advancePosition(field) {
        try {
          field.position++;

          const start = field.value.split(' ')[0];
          const end = '🏁';
          const horse = '<:cavalo:739196391779336293>';
          let str = '';
          for(let i = 0; i < 8; i++) {
            if(i == field.position) str += ` ${horse} `;
            else str += ' . '; }

          field.value = `${start} ${str} ${end}`;
          if(field.position == 7) {
            field.value += ' 🏅'
            return field.name.replace('Cavalo ', '');
          }
        } catch(e) { script.error(message, e, 'horse race') }
      }

      async function announceWinner(winner) {
        try {
          let announce = `o cavalo ${winner} é o vencedor! 🏅\n`;
          if(bet) {
            announce += 'Você acabou de ' +
              (winner == horse[0] ?
                `ganhar ${script.format(bet * 4)} com sua aposta!` :
                `perder ${script.format(bet)} com sua aposta...`);        
  
            client.economy.cash(message.author.id, winner == horse[0] ? bet * 4 : bet, winner == horse[0] ? 'add' : 'subtract', true);
          } else announce += `Você apostou no cavalo ${winner == horse[0] ? 'certo' : 'errado'}.`;
  
          await script.reply(message, announce)
        } catch(e) { script.error(message, e, 'horse race') }
      }
    }

	},

  config: {
    permissions: ['EMBED_LINKS', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY']
  },

	help: {
    aliases: ['horserace', 'horse-race', 'corridacavalo', 'corrida-de-cavalo', 'corrida', 'race'],
    usage: '[valor-de-sóis]',
		description: 'Faça cavalos correrem! Você pode apostar dinheiro e ter a chance ganhar o quádruplo, ou perder tudo.'
	}
};