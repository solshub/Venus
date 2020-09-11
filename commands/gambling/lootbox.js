const Discord = require('discord.js');
const { Chance } = require('chance');
const chance = new Chance();

module.exports = {
	run: async ({client, script, message}) => {
    try {
      const lootBoxes = require('../../data/lootbox/boxes.json');
      const { account } = client.economy.get(message.author.id);

      let embed = {
        color: process.env.COL_YELLOW,
        author: {
          name: 'Sistema de lootboxes',
          icon_url: process.env.ICO_BOX },
        description: 'Escolha a lootbox que deseja comprar!',
        fields: [],
        footer: { text: `Você tem ${script.format(account.cash.balance)} na carteira.` },
        image: { url: 'attachment://' + 'boxes.png' }
      }

      for(const box of lootBoxes)
        embed.fields.push({
          name: `${process.env.EMT_BOX} ${box.name}`,
          value: `\`${script.format(box.value)}\``,
          inline: true });
      
      let boxMessage;
      await message.channel.send({
        content: `<@${message.author.id}>, `,
        embed,
        files: [new Discord.MessageAttachment('./data/lootbox/boxes.png')] })
      .then(msg => boxMessage = msg)
      .catch(e => script.error(message, e, 'use lootbox'));


      const options = [process.env.EMT_ONE, process.env.EMT_TWO, process.env.EMT_THREE];
      for(const reaction of options)
        boxMessage.react(reaction)
        .catch(() => {});    
      
      let box;
      const filter = (reaction, author) => {
        return options.some(emt => emt == reaction.emoji.name) &&
        author.id == message.author.id; };
      await boxMessage.awaitReactions(filter, { max: 1 })
      .then(async (collected) => { 
        await boxMessage.delete();
        collected = collected.first();
        switch(collected.emoji.name) {
          case process.env.EMT_ONE:
            box = lootBoxes[0];
            break;
          case process.env.EMT_TWO:
            box = lootBoxes[1];
            break;
          case process.env.EMT_THREE:
            box = lootBoxes[2];
            break;
        }
      }).catch(e => { script.error(message, e, 'use lootbox'); });
      if(!box) throw new Error('could not find lootbox');


      if(account.cash.balance < box.value)
        return script.delete('você não tem o suficiente pra pagar essa lootbox!', message)
      await client.economy.cash(message.author.id, box.value, 'subtract', true);
      

      const heldItem = await (async () => {
        const pet = await client.economy.pet.get(message.author.id);
        if(pet) return pet.data.inventory.items.find(heldItem =>
          heldItem && heldItem.effect.type == 'giveBonusBet');
      })();
      let chances = [];
      if(heldItem)
      for(const chance of box.chances)
        chances.push(chance - (box.chances.indexOf(chance) <= 1 ? 10 : 0));

      const prize = chance.weighted(box.prizes, (chances.length > 0 ? chances : box.chances));
      if(prize > 0)
        client.economy.cash(message.author.id, prize, 'add', true);
      
      embed.image = undefined;
      embed.footer = {};
      embed.description = `Você abriu sua lootbox de ${script.format(box.value)}!`
      embed.fields = [{
        name: `${process.env.EMT_BOX} ${box.name}`,
        value: `Você ganhou... \`${prize > 0 ? `${script.format(prize)}` : 'nada?'}\`!`
      }];

      let prizeMessage;
      await message.channel.send({ content: `<@${message.author.id}>, `, embed })
      .then(msg => prizeMessage = msg)
      .catch(e => script.error(message, e, 'use lootbox'));

      script.awaitRepeat(prizeMessage, message.author.id, { client, script, message }, message.cmd.run);
    } catch(e) { script.error(message, e, 'use lootbox') }
  },
  
  config: {
    permissions: ['EMBED_LINKS', 'ATTACH_FILES', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY']
  },

	help: {
    aliases: ['lootboxes', 'loot-box', 'loot', 'box', 'crate', 'crates'],
    usage: '[valor-de-sóis]',
		description: 'Compre e abra uma lootbox para ter a chance de ganhar sóis!'
	}
};
