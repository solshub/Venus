const Chance = require('chance');
const chance = new Chance();
const Discord = require('discord.js');
const jimp = require('jimp');

module.exports = async ({script, message}, subject) => {
  try {    
    let content = `mensagem detectada! Ganhou ticket!`;

    const text = require('../data/ticket/text.json');
    const msg = script.capitalize(chance.pick(text));

    if(!message.guild || await script.permissions(message.channel, ['ATTACH_FILES', 'EMBED_LINKS'])) {
      jimp.read(`./data/ticket/images/${chance.integer({min: 0, max: 20})}.jpg`)
      .then(async image => {
        image.resize(jimp.AUTO, 200);        
        const path = './data/ticket/images/image.jpg';
        image.write(path);

        const embed = {
          description: msg,
          color: process.env.COL_PINK,
          image: { url: 'attachment://' + 'image.jpg' } };

        await message.channel.send({
          content: `<@${subject ? subject : message.author.id}>, ` + content,
          embed,
          files: [new Discord.MessageAttachment(path)] });
      }).catch(e => { script.error(message, e, 'give ticket') });
    } else {
      await message.channel.send(`<@${subject ? subject : message.author.id}>, ` + content);
      await script.delete(msg + '\n' + process.env.EMT_WARN + ' Se eu tivesse permissão pra anexar arquivos e usar embeds, eu te mandaria algo...', message);
    }
  } catch(e) { script.error(message, e, 'give ticket')}
};