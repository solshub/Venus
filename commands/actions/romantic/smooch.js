module.exports = {
  run: async ({client, script, message}) => {
    let action = script.getAction(message);
    action.message = 'deu um selinho na bochecha de';
    script.monitor.action({client, script, message}, action);
  },

  help: {
    aliases: ['peck', 'selinho', 'beijinho', 'bejinho', 'kissy', 'kissies'],
    description: 'Dê um selinho na bochecha de alguém!'
  }
};