module.exports = async ({client, script}) => {
	script.log(`All systems online. Connected with ${client.guilds.cache.size} servers.`);

	script.timer.iconRotation({client});

	for(const server of Object.entries(client.servers)) {
		if(typeof server[1] == 'object') {
			const guild = client.guilds.cache.get(String(server[0]))
			// script.timer.drinkTimer({client, script, guild});
		}
	}

	client.petTimers = {};
	Object.entries(client.economy)
	.filter(([, values]) => typeof values.pet == 'object')
	.forEach(([key, ]) => {
		client.petTimers[key] = setInterval(() => {
			script.timer.petNecessities({client}, key); }, 30 * 60000);
	});
}