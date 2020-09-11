module.exports = async ({client, script, message}, action) => {
  try {
    const cmd = script.command[message.command];
    if(cmd.help.nsfw && !message.channel.nsfw && !script.contains(message.channel.name, ['nsfw', '+18', 'inapp', 'lewd']))
      return script.delete('uh... Que vergonha-\n' +
        'Tá bobo é? Na frente de todo mundo??\n' +
        'Esse comando é só pra canais que são NSFW!', message);

    let subjects = message.mentions.users;
    if(!subjects.size) return script.delete('mencione a pessoa com quem você quer interagir, por favor.', message);
    if(subjects.some(subject => subject.id == message.author.id))
      return script.delete('desculpe, mas você não pode interagir com você mesmo!', message);
    if(subjects.some(subject => subject.id == client.user.id))
      if(cmd.help.category == 'romantic' && cmd.help.permission && message.author.id != process.env.USER_BRUNA)
        return script.delete('calma lá! A gente não tem essa intimidade! 😳', message);
      else if(cmd.help.category == 'mean')
        return script.delete('não vou deixar você fazer isso comigo! 😠', message);
    if(subjects.some(subject => subject.id == process.env.USER_SOL) && cmd.help.category == 'mean' && (cmd.help.name != 'poke' && cmd.help.name != 'run' && cmd.help.name != 'mock'))
      return script.delete('não vou deixar ninguém bater na minha criadora! :<', message)

    if(message.guild && !script.permissions(message.channel, ['ATTACH_FILES', 'EMBED_LINKS']))
      return message.channel
      .send(process.env.EMT_WARN + ' Eu preciso de permissão de anexar arquivos e usar embeds pra poder processar interações!')
      .catch(e => script.error(message, e, 'send an action'));


    const realizeAction = async () => {
      const pet = await client.economy.pet.get(message.author.id)
      if(pet) {
        if(cmd.help.name == 'bath' && pet.authorIs == 'owner')
          await client.economy.pet.bath(pet.ownerId);
          
        if(cmd.help.category != 'mean' &&
        ((pet.authorIs == 'owner' &&
        subjects.some(subject => subject.id == pet.petId)) ||
        subjects.some(subject => subject.id == pet.ownerId))) {
          const love = await client.economy.pet.fill(pet.ownerId);
          script.delete(`você interagiu com seu pet e \`1 ${process.env.EMT_FUN}\` foram preenchidos! ` +
            `Elu parece muito feliz com isso, vocês ganharam ${love} ${process.env.SYM_LOVE} pontos de amor! ~`, message, true); }
      }

      client.economy.exp(message.author.id, message.guild.id, { interaction: true, notifyChannel: message.channel });
      client.economy.cash(message.author.id, 25, 'add');
      for(const subject of subjects)
        if(!subject[1].bot) {
          client.economy.exp(subject[0], message.guild.id, { interaction: true, notifyChannel: message.channel });
          client.economy.cash(subject[0], 25, 'add'); }

      const path = `./data/gifs/${cmd.help.category}/${action.gif}`;

      let mentions = '', i = 0;
      for(const subject of subjects) {
        mentions += `<@${subject[0]}>`;

        if(subjects.size > 1) {
          if(i + 2 == subjects.size)
            mentions += ' e ';
          else if(i + 1 != subjects.size)
            mentions += ', ';
        }

        i++;
      }

      const embed = {
        color: action.color,
        description: `${action.emote} **<@${message.author.id}> ${action.message} ${mentions}!** ${action.emote}`,
        footer: { text: "Cada interação conta como 5 mensagens pros envolvidos! ~" }
      };
      
      script.sendGif(embed, path, message);
    }
    

    if(subjects.size == 1) {
      const subject = subjects.first();
      if(cmd.help.permission && !subject.bot) {
        if(message.guild && !script.permissions(message.channel, ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY']))
          message.channel.send(process.env.EMT_WARN + ' Se eu tivesse permissão de adicionar reações e pra ler o histórico de mensagens, eu podia perguntar se a pessoa aceita...')
          .catch(e => script.error(message, e, 'send an action'));
        else 
          return script.waitApproval(`deseja permitir que <@${message.author.id}> realize a ação \`.${cmd.help.name}\` com você?` + (cmd.help.nsfw ? ' A gif pode ter conteúdo +18!' : ''), message, realizeAction, { user: subject });
      }
    } else if(cmd.help.permission)
      return script.delete('perdão, essa ação não pode ser realizada em grupo! ò.ó', message);

    realizeAction();
  } catch(e) { script.error(message, e, 'send an action') }
}