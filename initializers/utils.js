const Chance = require('chance');
const chance = new Chance();
const Discord = require('discord.js');
const { readdirSync } = require('fs');
const moment = require('moment');

module.exports = async ({client, script}) => {
  client.oracle = require('../data/oracle.json');
  client.flirt = require('../data/flirt.json');
  client.insult = require('../data/insult.json');
  client.triggers = require('../data/trigger.json');
  client.questions = require('../data/questions.json');

  script.waitApproval = async (request, message, callback, { user } = {}) => {
    try {
      user = (user && user.id) || message.author.id;
  
      let approvalMessage;
      if(typeof request == 'string')
        await message.channel.send(`<@${user}>, ${request}`)
        .then(msg => approvalMessage = msg)
        .catch(e => { script.error(message, e, 'get approval'); });
      else {
        if(request.content)
          request.content = `<@${user}>, ` + request.content;
        else request.content = `<@${user}>, `;
  
        await message.channel.send(request)
        .then(msg => approvalMessage = msg)
        .catch(e => { script.error(message, e, 'get approval'); });
      }
    
      await approvalMessage.react(process.env.EMT_ALLOW)
      .catch(e => { script.error(message, e, 'get approval'); });

      const filter = (reaction, author) => {
        return [process.env.EMT_ALLOW].includes(reaction.emoji.name) && author.id == user; };    
      approvalMessage.awaitReactions(filter, { max: 1, time: 150000, errors: ['time'] })
      .then(async () => {
        await approvalMessage.delete();
        callback();
      }).catch(async () => {
        if(!approvalMessage.deleted)
          await approvalMessage.delete();
      });
    } catch(e) { script.error(message, e, 'get approval'); }
  }


  script.awaitRepeat = async (message, user, args = {}, callback, del = true) => {
    try {
      await message.react(process.env.EMT_REPEAT)
      .catch(e => { script.error(message, e, 'ask for repeat') });
      
      const filter = (reaction, author) => {
        return [process.env.EMT_REPEAT].includes(reaction.emoji.name) && author.id == user; };
      message.awaitReactions(filter, { max: 1 })
      .then(async () => {
        if(del) await message.delete();
        callback(args);
      }).catch(e => { script.error(message, e, 'ask for repeat'); });
    } catch (e) { script.error(message, e, 'ask for repeat'); }
  }

  
  script.getAction = (message) => {
    try {
      let color, emote;
    
      switch(script.command[message.command].help.category) {
        case 'friendly':
          color = process.env.COL_GREEN;
          emote = process.env.EMT_FRIENDLY;
          break;
        case 'mean':
          color = process.env.COL_RED;
          emote = process.env.EMT_MEAN;
          break;
        case 'romantic':
          color = process.env.COL_PINK;
          emote = process.env.EMT_LOVE;
          break;
        default:
          throw new Error('Invalid action category given.')
      }
      
      return { color, gif: message.cmd.help.name, emote };
    } catch(e) { script.error(message, e, 'get an action') }
  }
  

  script.contains = (target, pattern, every = false) => {
    if(!Array.isArray(pattern))
      throw new Error('Please use an array as pattern.');
    
    if(every) return pattern.every(p => target.includes(p));
    else return pattern.some(p => target.includes(p));
  }


  script.sendGif = async (embed, path, message) => {
    try {
      if(message.guild && !await script.permissions(message.channel, ['ATTACH_FILES', 'EMBED_LINKS']))
        return message.channel
        .send(process.env.EMT_WARN + ' Eu preciso de permissão para enviar embeds e anexar arquivos!')
        .catch(e => script.error(message, e, 'send an gesture') );

      const files = readdirSync(path);
      if(files.length == 0) {
        script.delete('desculpe, essa interação só estará disponível no futuro.', message);
        return script.warn(`There are no available gifs for .${message.command}.`); }
      const gif = `${chance.integer({min: 0, max: files.length - 1})}.gif`;
    
      embed.image = { url: `attachment://${gif}` };
      
      path += `/${gif}`;
      message.channel.send({
        embed,
        files: [new Discord.MessageAttachment(path)]
      }).catch(e => { script.error(message, e, 'send an gesture') });
		} catch(e) { script.error(message, e, 'send an gesture'); }
  }


  script.format = (value) => {
    return process.env.SYM_CASH + value.toLocaleString() + ' sóis'
  }


  script.date = () => {
    return moment().utcOffset(-3);
  }

  
  script.findOnMessage = (array, message) => {
    return array.find(a => message.content.replace()
    .replace(/<@[0-9&!#]*>/g, '')
    .replace(/>[^\n]*\n/g, '')
    .toLowerCase().indexOf(a) > -1);
  }


  script.permissions = async (channel, permissions) => {
    if(!Array.isArray(permissions))
			throw new Error('Please use an array of permissions.');
		
		if(permissions.some(permission => !channel.permissionsFor(client.user).has(permission)))
			return false;

		return true;
  }
  

  script.ruleBreak = async (message, rule) => {
    try {
      const notify = (() => {
        const uwu = client.guilds.cache.get(process.env.SRV_UWU);
        return uwu.channels.cache.get(process.env.CHA_NOTIFY);
      })();
      await notify.send(`**Quebra da regra #${rule}!**\n` +
        `\`${message.author.username}#${message.author.discriminator} enviou:\`\n` +
        `${message.content}\n`+
        `\`No canal <#${message.channel.name}>.\``)
      .catch(e => {script.error(message, e, 'notify rule break')});
    } catch(e) { script.error(message, e, 'notify rule break') }
  }
}