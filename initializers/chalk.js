const chalk = require('chalk');

module.exports = async ({client, script}) => {
	script.log = (message) => console.log(chalk.green(message));
	script.msg = (message) => console.log(chalk.blue(message));
	script.warn = (message) => console.log(chalk.yellow(message));
	script.danger = (message) => console.log(chalk.red(message));

	script.capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);
	
	script.error = async (message, e, msg) => {
		try {
			if(e.message == 'The user aborted a request.') return;
			
			if(e.message != 'Unknown Message')
				message.channel.send('Desculpa! Parece que algo deu errado nos meus sistemas...')
				.catch(e => { script.error(message, e, 'reply a message') });
			script.warn(`Something went wrong trying to ${msg}.`);
			console.log(e);

			const log = await (() => {
				const server = client.guilds.cache.get(process.env.SRV_OFICINA);
				return server.channels.cache.get(process.env.CHA_ERROR);
			})();
			
			log.send(e.toString())
			.catch(e => console.log('Something went wrong trying to log error:\n' + e));
		} catch(e) { console.log('Something went wrong trying to log error:\n' + e) }
	};

	script.reply = async (message, msg, userId) => {
		try {
			userId = userId ? userId : message.author.id;

			if(message.guild) await message
				.reply(msg)
				.catch(e => { script.error(message, e, 'reply a message') });
			else {
				if(typeof(msg) == 'string') message.channel
					.send(`<@${userId}>, ` + msg)
					.catch(e => { script.error(message, e, 'reply a message') });
				else {
					if(msg.content) msg.content = `<@${userId}>, ` + msg.content;
					else msg.content = `<@${userId}>,`;

					await message.channel
					.send(msg)
					.catch(e => { script.error(message, e, 'reply a message') });
				}			
			}
		} catch(e) { script.error(message, e, 'reply a message') }
	};

  script.delete = (msg, message, long, userId) => {
		try {
			message.channel.send(`<@${userId ? userId : message.author.id}>, ` + msg)
			.then(msg => msg.delete({ timeout: long ? 25000 : 15000 }))
			.catch(e => script.error(message, e, 'delete a message') );
		} catch(e) { script.error(message, e, 'delete a message') }
  };
}