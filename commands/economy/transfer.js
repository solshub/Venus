module.exports = {
	run: async ({client, script, message}) => {
    try {
      if(!message.guild) return script.delete('esse comando só pode ser utilizado em servers!', message);

      const usage = `Uso: \`${process.env.PREFIX}pay @[usuário] [valor]\``;
      const receiver = message.mentions.users && message.mentions.users.first();
      if(!receiver)
        return script.delete('mas pra quem você quer fazer a transferência? ' + usage, message);
      if(receiver.bot)
        return script.delete('você não pode realizar transferências com bots!', message)
      if(receiver.id == message.author.id)
        return script.delete('mas você quer transferir dinheiro pra você mesmo??', message);

      const quantity = Number(message.args.find(arg => !isNaN(arg)));
      if(isNaN(quantity) || quantity <= 0)
        return script.delete('quanto você deseja transferir? ' + usage, message);


      const { account } = client.economy.get(message.author.id);

      if(quantity > account.cash.balance)
        return script.delete('você não tem todo esse dinheiro!', message);

      const transfer = () => {
        client.economy.cash(message.author.id, quantity, 'subtract');
        client.economy.cash(receiver.id, quantity, 'add');

        script.reply(message, `acabou de transferir ${script.format(quantity)} para <@${receiver.id}>.`);
      } 

      script.waitApproval(`deseja mesmo realizar a transferência de ${script.format(quantity)} para <@${receiver.id}>? 💸`, message, transfer);
    } catch(e) { script.error(message, e, 'make a transfer') }
  },
  
  config: {
    permissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY']
  },

	help: {
    aliases: ['pay', 'pagar'],
    description: 'Transfira sóis pra outra pessoa.',
    usage: '[sóis] @[usuário]'
	}
};