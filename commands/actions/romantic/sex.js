module.exports = {
  run: async ({client, script, message}) => {
    let action = script.getAction(message);
    action.message = 'foi para cama com';
    script.monitor.action({client, script, message}, action);
  },

  help: {
    aliases: ['fuck', 'sexo', 'transar', 'transa', 'foder', 'fuder', 'transar', 'transa', 'blowjob', 'bj', 'boquete', 'comer', 'come', 'mamar', 'mama', 'mamada', 'chupa', 'chupar', 'darcuzinho', 'dar-cuzinho'],
    description: 'Me obrigaram a incluir esse comando.',
    nsfw: true,
    hidden: true,
    permission: true
  }
};