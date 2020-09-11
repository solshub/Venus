const moment = require('moment');

module.exports = async ({client, script, guild}) => {
  setInterval (async () => {
    sendReminder();
  }, 45 * 60000);

  async function sendReminder() {
    let lastMessages = [];

    try {
      guild = client.guilds.cache.get(guild.id)
      for(const channel of guild.channels.cache) {
        if(channel[1].type == 'text')
        if(await script.permissions(channel[1], ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'])) {
          await channel[1].messages.fetch({limit: 5})
          .then(msgs => {
            let messages = [];
            for(let message of msgs) {
              message = message[1];
              if(!message.author.bot) {
                const timestamp = message.editedTimestamp || message.createdTimestamp;
                if(timestamp && message)
                if(moment().diff(moment(timestamp), 'minutes') <= 5)
                  messages.push({ timestamp, message });
              }
            }
    
            if(messages.length > 0) {
              messages.sort((a, b) => {
                const valA = moment().diff(moment(a.timestamp)), valB = moment().diff(moment(b.timestamp));
                return (valA > valB) ? 1 : ((valB > valA) ? -1 : 0) }).reverse();
              lastMessages.push(messages.pop());
            }
          }).catch(e => { console.log(`Something went wrong when trying to send reminder:\n${e}`); });
        }
      }

      if(lastMessages.length > 0) {
        const mostRecentMessage = lastMessages.sort((a, b) => {
          const valA = a.timestamp, valB = b.timestamp;
          return (valA > valB) ? 1 : ((valB > valA) ? -1 : 0)
        }).pop();

        mostRecentMessage.message.channel.send('**Ei!** Não se esqueçam de beber água. 💧');
      }
    } catch(e) { console.log(`Something went wrong when trying to send reminder:\n${e}`); }
  }
};