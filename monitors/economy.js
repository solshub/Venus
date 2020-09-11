module.exports = async ({client, script, message}) => {
  try {
    if(message.content.length < 5) return;

    let lastMessages, limit = 4, notEnough;
    do {
      await message.channel.messages.fetch({ limit })
      .then(messages => {
        notEnough = (messages.size < limit);
        lastMessages = messages.filter(msg => !msg.author.bot);
      }).catch(e => { script.error(message, e, 'credit a message') });
      limit += 4;
    } while((lastMessages && lastMessages.size < 4) && !notEnough);
    if(!notEnough && (lastMessages && lastMessages.every(msg => msg.author.id == message.author.id))) return;
  

    const pet = await client.economy.pet.get(message.author.id);
    let heldItem;

    heldItem = pet && pet.data.inventory.items.find(heldItem => heldItem && heldItem.effect.type == 'giveBonusExp');
    client.economy.exp(message.author.id, message.guild.id, { notifyChannel: message.channel, double: heldItem });

    heldItem = (pet && pet.data.inventory.items.find(heldItem => heldItem && heldItem.effect.type == 'cashMessage')) || undefined;
    client.economy.cash(message.author.id, (heldItem ? heldItem.effect.value : 5), 'add');
  } catch(e) { script.error(message, e , 'credit a message:\n'); }
};