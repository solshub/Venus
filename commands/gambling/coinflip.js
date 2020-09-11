const Chance = require('chance');
const chance = new Chance();

module.exports = {
	run: async ({client, script, message}) => {
    try {
      let side = message.args.find(arg => arg == 'cara' || arg == 'heads' || arg == 'coroa' || arg == 'tails')
      if(side == 'heads') side = 'cara';
      else if(side == 'tails') side = 'coroa';

      const throwCoin = async () => {
        try {
          let coin;
          
          const heldItem = await (async () => {
            const pet = await client.economy.pet.get(message.author.id);
            if(pet) return pet.data.inventory.items.find(heldItem =>
              heldItem && heldItem.effect.type == 'giveBonusBet');
          })();

          if(!side) coin = chance.bool({ likelihood: 50 }) ? 'cara' : 'coroa';
          else coin = chance.bool({ likelihood: (heldItem ? 50 : 40) }) ? side : (side == 'cara' ? 'coroa' : 'cara');      

          await message.channel.send(`A moeda caiu em... ${coin}!`);
          if(!side || !bet) return;

          client.economy.cash(message.author.id, coin == side ? bet * 2 : bet, coin == side ? 'add' : 'subtract', true);
          if(coin == side) script.reply(message, `parabéns, você acabou de ganhar ${script.format(bet * 2)}!`);
          else script.reply(message, `desculpe, você acabou de perder ${script.format(bet)}...`);      
        } catch(e) { script.error(message, e, 'throw a coin') }
      }

      let bet = message.args.find(arg => !isNaN(arg));
      if(bet) {
        if(!side) return script.delete('por favor diga em qual lado da moeda você quer apostar! ' +
          `Modo de uso: \`${message.cmd.help.usage}\``, message);

        const { account } = client.economy.get(message.author.id);
        if(account.cash.balance < bet)
          return script.delete(`você não tem ${script.format(bet)} sóis para apostar!`, message);

        script.waitApproval(`tem certeza que deseja apostar ${script.format(bet)} que a moeda vai cair em ${side}? Perca tudo ou leve o dobro!`, message, throwCoin)
      } else throwCoin();
    } catch(e) { script.error(message, e, 'throw a coin') }
  },
  
  config: {
		permissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY']
  },

	help: {
    aliases: ['caracoroa', 'caraoucoroa', 'cara-coroa', 'cara-ou-coroa', 'moeda'],
    usage: '[valor-de-sóis] cara OU coroa',
		description: 'Jogue uma moeda! Você pode apostar dinheiro e ter a chance de ganhar o dobro, ou perder tudo.'
	}
};