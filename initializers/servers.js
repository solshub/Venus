module.exports = async ({client}) => {
  client.servers = require('../data/servers.json');
}