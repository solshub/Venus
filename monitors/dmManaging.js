module.exports = async ({client, script, message}) => {
  if(message.content.indexOf(process.env.PREFIX) == 0) return;
  
  try {
    if(message.author.id == process.env.USER_FUKA)
    if(message.content.includes('?')) {
      const Chance = require('chance');
      const chance = new Chance();
      return message.reply(script.capitalize(chance.pickone(client.oracle[chance.pickone(Object.keys(client.oracle))])));
    }
  } catch(e) { script.error(message, e, 'reply dm question') }
};