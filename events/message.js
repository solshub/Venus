module.exports = async ({client, script}, message) => {
  try {
    if(message.guild && !message.channel.permissionsFor(client.user).has('SEND_MESSAGES')) return;

    
    try {
      if(message.channel.id == process.env.CHA_PRISM) return;
      if(message.channel.id == process.env.CHA_PRISM_DM) return;
      const log = `, ${message.author.username}#${message.author.discriminator} `;
   
      const prism = (() => {
        const server = client.guilds.cache.get(process.env.SRV_OFICINA);
        return {
          guild: server.channels.cache.get(process.env.CHA_PRISM),
          dm: server.channels.cache.get(process.env.CHA_PRISM_DM) };
      })();
            
      const send = (sendTo) => {
        if(message.embeds)
        for(const embed of message.embeds)
          sendTo.send({ embed })
          .catch(e => console.log('Something went wrong trying to log message:\n' + e));
        if(message.attachments)
        for(const attachment of message.attachments)
          sendTo.send(attachment[1].url)
          .catch(e => console.log('Something went wrong trying to log message:\n' + e));
      }

      if(!message.guild || message.channel.id == process.env.CHA_FURAKASO) {
        await prism.dm.send(`\`At ${message.guild ? 'private channel' : 'DM'}${log} said:\`\n ${message.content.replace(process.env.USER_SOL, ' Sol ').replace('Sol#9190', ' Sol ')}`)
        .catch(e => console.log('Something went wrong trying to log message:\n' + e));

        send(prism.dm);
      } else {
        await prism.guild.send(`\`At ${message.guild.name}${log} said:\`\n ${message.content.replace(process.env.USER_SOL, ' Sol ').replace('Sol#9190', ' Sol ')}`)
        .catch(e => console.log('Something went wrong trying to log message:\n' + e));

        send(prism.guild);
      }

      script.msg('At ' + (message.guild ? message.guild.id : 'DM') + log + `said: ${message.content}`);
    } catch(e) { console.log('Something went wrong trying to log message:\n' + e) }


    if(message.author.bot) return;

    
    message.args = message.content.slice(1).trim().split(/ +/g);  
    const question = message.args.some(arg => arg.toLowerCase() == 'venus?' || arg.toLowerCase() == 'vênus?') || ((message.content.toLowerCase().startsWith('venus,') || message.content.toLowerCase().startsWith('venus')) && message.content.includes('?'));

    if(message.guild) {
      if(message.args.length < 2 || !question)
      if(await script.monitor.serverManaging({client, script, message})) return;
    } else
      if(await script.monitor.dmManaging({client, script, message})) return;
    


    if(message.content.indexOf(process.env.PREFIX) != 0) {
      if(script.contains(message.content, ['calma', 'acalma', 'acalme', 'te odeio']) && script.contains(message.content, ['venus', 'vênus']))
        return await message.channel.send('Desculpa.');

      if(message.args.length < 2 || !question)
        return;
    }
    
    message.command = message.args.shift().toLowerCase();
    message.cmd = script.command[message.command];
    if(question) message.cmd = script.command.oracle;
    message.message = message.content.replace(process.env.PREFIX + message.command, '');
    if(!message.cmd || (message.cmd.help.category == 'admin' && message.author.id != process.env.USER_SOL))
      return script.delete(`desculpa desculpa, eu não conheço nenhum comando com o nome \`${message.command}\`.`, message);
    
    if(message.cmd.config) {
      if(message.cmd.config.guild && !message.guild)
        return script.delete('desculpe! Esse comando só pode ser usado em servers.', message)
      
      if(message.cmd.config.administrator && !(message.member.hasPermission('ADMINISTRATOR') || (message.guild.id == process.env.SRV_OFICINA && message.author.id == process.env.USER_BRUNA)))
        return script.delete('nada disso! Esse comando é só pra administradores do server.', message);

      if(message.cmd.config.permissions && message.guild && !await script.permissions(message.channel, message.cmd.config.permissions)) {
        let requiredStr = [];
        if(message.cmd.config.permissions.includes('ATTACH_FILES')) requiredStr.push('ANEXAR ARQUIVOS');
        if(message.cmd.config.permissions.includes('EMBED_LINKS')) requiredStr.push('ENVIAR LINKS');
        if(message.cmd.config.permissions.includes('ADD_REACTIONS')) requiredStr.push('ADICIONAR REAÇÕES');
        if(message.cmd.config.permissions.includes('READ_MESSAGE_HISTORY')) requiredStr.push('LER HISTÓRICO DE MENSAGENS');
        if(message.cmd.config.permissions.includes('MANAGE_MESSAGES')) requiredStr.push('GERENCIAR MENSAGENS');
        if(message.cmd.config.permissions.includes('USE_EXTERNAL_EMOJIS')) requiredStr.push('USAR EMOJIS EXTERNOS');

        return await message.channel
        .send(process.env.EMT_WARN + ' Eu preciso das permissões: `' + requiredStr.join('`, `') + '`!')
        .catch(e => { script.error(message, e, 'get permissions') });
      }
    }


    message.cmd.run({client, script, message});
  } catch(e) { script.error(message, e, 'verify a message') }
}