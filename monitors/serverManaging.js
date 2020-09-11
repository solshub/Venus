module.exports = async ({client, script, message}) => {
  if(message.guild.id == process.env.SRV_UWU) {
    if([process.env.CHA_BADERNA, process.env.CHA_ACTION]
    .some(channel => message.channel.id == channel)) {
      if(await triggeringMessage()) return true;
    } else if(message.channel.id == process.env.CHA_ARTES)
      await artisticMessage();
            
    
    if([process.env.CAT_BOTS, process.env.CAT_TEXTO]
    .some(category => message.channel.parentID == category))
      if(await inappropriateChannel()) return true;   
  
    // if(await script.monitor.ticketAlex({client, script, message})) return true;
  }

  await script.monitor.economy({client, script, message});  


  async function triggeringMessage() {
    try {
      let triggerWord = script.findOnMessage(client.triggers.tw, message);
      if(triggerWord)
        await script.delete(`notei "\`${triggerWord}\`" em sua mensagem. ` +
          `Use o canal <#${process.env.CHA_DESABAFO}> pra falar de tópicos sensíveis.`, message);
      else {
        triggerWord = script.findOnMessage(client.triggers.nsfw, message);
        if(triggerWord) await script.delete(`use o <#${process.env.CHA_NSFW}>.`, message, true);
      }

      if(triggerWord) return true;
    } catch(e) { script.error(message, e, 'find triggering terms') }
  }

  async function artisticMessage() {
    try {
      if(message.attachments.size > 0)
        await message.react(process.env.EMT_HEART);
    } catch(e) { script.error(message, e, 'find images') }
  }

  async function inappropriateChannel() {
    try {
      if(message.content.startsWith('>') ||
        message.author.id == process.env.USER_BRUNA) return;
  
      let validChannel = filterMessage();  
      switch(validChannel) {
        case 'any':
          return;

        case 'CHA_ACTION':
          if(message.channel.id == process.env.CHA_BOT ||
          message.channel.id == process.env.CHA_ACTION) return;
          break;

        case 'CHA_BOT':
          if(message.channel.id == process.env.CHA_BOT) return;
          break;

        case undefined:
          if(message.channel.parentID == process.env.CAT_BOTS) {
            if(message.content.length < 20) return;
            validChannel = 'CHA_BADERNA';
          } else return;
          break;

        default:
          if(message.channel.id == process.env[validChannel]) return;
        break;          
      }
      
      if(process.env[validChannel] == message.channel.id) return;
  
      if(validChannel != 'CHA_BADERNA')
        await script.ruleBreak(message, 6);

      if(validChannel == 'CHA_BADERNA')
        await script.delete(`converse no <#${process.env[validChannel]}>.`, message);
      else
        await script.delete(`o canal <#${process.env[validChannel]}> é reservado pra esse tipo de mensagem.`, message);
      return true;
    } catch(e) { script.error(message, e, 'filter messages')}
  

    function filterMessage() {
      const getCommands = (categories) => {
        try {
          let actions = [];
          for(const command of Object.entries(script.command)) {
            if(typeof command[1].help == 'object')
            if(script.contains(command[1].help.category, categories))
              actions.push(command[0]);
          }
          return actions;
        } catch(e) { script.error(message, e, 'filter messages:')}
      }
  
      try {
        const commands = {
          loritta: {
            actions: ['attack', 'atacar', 'dance', 'dançar', 'headpat', 'headpet', 'cafuné', 'cafune', 'pat', 'hug', 'abraço', 'abraçar', 'abraco', 'abracar', 'kiss', 'beijo', 'beijar', 'slap', 'tapa', 'tapinha']
          },
          venus: {
            servers: getCommands(['servers']),
            admin: getCommands(['admin']),
            fun: getCommands(['fun']),
            actions: getCommands(['friendly', 'mean', 'romantic', 'gestures']),
            general: getCommands(['general']),
            petshop: ['petshop'].concat(script.command['petshop'].help.aliases),
            shop: ['leaderboard', 'leader', 'board', 'ranking']
          },
          mimu: {
            shop: ['leaderboard', 'shop', 'votes', 'buy']
          },
          mee6: {
            music: ['play', 'search', 'record', 'seek', 'volume', 'record', 'add', 'queue', 'clear-queue', 'skip', 'vote-skip', 'join', 'leave', 'stop', 'start-quiz', 'stop-quiz', 'stop-recording']
          }
        }
  
        const prefix = message.content.substring(0, 1);
        if(message.content.split(' ')[0].split('').every(char => char == prefix)) return 'any';
        
        const checkForCommand = (commands) => {
          return commands.some(command => message.content.toLowerCase().startsWith(prefix) && message.content.toLowerCase().slice(1).trim().split(/ +/g).shift() == command); }
  
        let kind;
  
        switch(prefix) {
          case 'g':
            if(['gb.', 'gb!'].some(prefix => message.content.startsWith(prefix)))
              kind = 'CHA_GARTIC';
            break;
          case '-':
            kind = 'CHA_MUSIC';
            break;
          case '!':
            if(checkForCommand(commands.mee6.music))
              kind = 'CHA_MUSIC';
            break;
          case '*':
            if(message.content.toLowerCase().startsWith('*pick') ||
            message.content.endsWith('*') ||
            message.content.includes('*'))
              return 'any';
            if(checkForCommand(commands.mimu.shop))
              kind = 'CHA_SHOP';
            break;
          case process.env.PREFIX:
            if(checkForCommand(commands.venus.fun) ||
            checkForCommand(commands.venus.admin) ||
            checkForCommand(commands.venus.servers) ||
            checkForCommand(commands.venus.general) ||
            checkForCommand(['ticket']))
              return 'any';
            if(checkForCommand(commands.venus.actions))
              kind = 'CHA_ACTION';
            if(checkForCommand(commands.venus.petshop))
              kind = 'CHA_SHOP';
            break;
          case '+':
            if(checkForCommand(commands.loritta.actions))
              kind = 'CHA_ACTION';
            break;
        }
  
        if(!kind)
          switch(prefix) {
            case '!':
            case '*':
            case '=':
            case process.env.PREFIX:
            case '+':
              return kind = 'CHA_BOT';
          }

        return kind;
      } catch(e) { script.error(message, e, 'filter messages')}
    }
  }
};