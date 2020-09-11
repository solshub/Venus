const Chance = require('chance');
const chance = new Chance();
const { readdirSync } = require('fs');

module.exports = async ({client}) => {
  try {
    if(client.iconRotation) {
      clearInterval(client.iconRotation);
      iconRotation(); }
    client.iconRotation = setInterval(() => {
      iconRotation();
    }, 6 * 60 * 60000);

  } catch(e) { console.log('Something went wrong trying to change icon:\n' + e)}

  function iconRotation() {
    try {
      const files = readdirSync(`./data/icons`);
      if(files.length == 0) throw new Error(`There are no available icons for me.`)
      const gif = `${chance.integer({min: 0, max: files.length - 1})}.jpg`;
      client.user.setAvatar(`./data/icons/${gif}`);
    } catch(e) { console.log('Something went wrong trying to change icon:\n' + e)}
  } 
};