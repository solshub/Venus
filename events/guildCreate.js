module.exports = async ({client, script}, guild) => {
  try {
    // script.timer.drinkTimer({client, script, guild});

    
    script.msg(`I just joined a new server! It's called "${guild.name}".`);
  
    if(!guild.systemChannel || !await script.permissions(guild.systemChannel, ['VIEW_CHANNEL', 'SEND_MESSAGES'])) return;

    const send = {
      content: 'Salve rapaziada, sou Venus, pronta pra servir!\n'+
        'Usem `.help` se tiverem interesse em minhas capacidades. ~',
      embed: {
        color: process.env.COL_BLUE,
        description: 'Ah, eu ainda estou na versão alpha, então...\n'+
          'Nem tudo funciona como deveria, erros estranhos podem brotar e as vezes vou sair do ar do nada, mas não se assuste!\n'+
          'Ao longo do tempo, receberei atualizações cheias de conteúdo novo!\n'+
          `Se notar algo de errado, seja compreensivo e por favor avise <@${process.env.USER_SOL}>.`
      }
    }

    if(!await script.permissions(guild.systemChannel, ['EMBED_LINKS']))
      guild.systemChannel.send(send)
      .catch(e => console.log('Something went wrong trying to introduce myself:\n' + e));
    else
      guild.systemChannel.send(send.content)
      .then(() => guild.systemChannel.send(send.embed.description))
      .catch(e => console.log('Something went wrong trying to introduce myself:\n' + e));
  } catch(e) { console.log('Something went wrong trying to introduce myself:\n' + e); }
}