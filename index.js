require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client({
	presence: {
		status: 'online',
		activity: {			
			type: 'WATCHING',
			name: '.help' }
	},
	messageCacheMaxSize: 100
});


let script = { command: {}, monitor: {}, timer: {} };

const initUtils = require('./initializers/utils.js');
initUtils({ client, script });
const initChalk = require('./initializers/chalk.js');
initChalk({ client, script });
const initEconomy = require('./initializers/economy.js');
initEconomy({ client, script });
const initMail = require('./initializers/mail.js');
initMail({ client, script });
const initServers = require('./initializers/servers.js')
initServers({ client });


(async () => {
	const readdirp = require('readdirp');
	const { readdirSync } = require('fs');

	(async function loadCommands() {
		let files;
		try { files = await readdirp.promise('./commands'); }
		catch(error) { throw new Error('Something went wrong trying to load the commands.') }

		let commandsCounter = 0;
		const path = './commands';
		for(const file of files) {
			if(file.basename.endsWith('.js')) {
				try {
					const name = file.basename.replace('.js', '');
					const func = require(`${path}/${file.path}`);

					func.help.name = name;

					if(!file.path.includes('\\'))
						throw new Error(`${file.basename} requires to fit a category!`)
					let category = file.path.replace('\\' + file.basename, '');
					if(category.includes('\\'))
						category = category.substr(category.indexOf('\\') + 1, category.length);
					func.help.category = category;

					switch(func.help.category) {
						case 'friendly':
						case 'mean':
						case 'romantic':
							func.help.usage = '@[usuário]';
							func.config = {
								permissions: ['ATTACH_FILES', 'EMBED_LINKS'],
								guild: true }
							break;
						case 'guild':
							func.config = {
								guild: true,
								administrator: true }
							break;
					}

					script.command[name] = func;

					if(func.help.aliases)
						func.help.aliases.forEach(alias => script.command[alias] = func);

					commandsCounter++;
				} catch(e) { throw new Error(`Something went wrong trying to load ${file.basename}:\n${e}`); }
			}
		}

		script.log(`A total of ${commandsCounter} commands were loaded.`);		
	})();

	(function loadOthers() {
		
		(function loadMonitors() {
			let monitorsCounter = 0;
			const monitors = readdirSync('./monitors/');
			for(const monitor of monitors) {
				try {
					const func = getScript(monitor, 'monitors');
					if(func) {
						script.monitor[func.name] = func.func;
						monitorsCounter++; }
				} catch(e) { throw new Error(`Something went wrong trying to load ${monitor}:\n${e}`); }
			}

			script.log(`A total of ${monitorsCounter} monitors are on.`);
		})();

		(function loadTimers() {
			let timersCounter = 0;
			const timers = readdirSync('./timers/');
			for(const timer of timers) {
				try {
					const func = getScript(timer, 'timers');
					if(func) {
						script.timer[func.name] = func.func;
						timersCounter++; }
				} catch(e) { throw new Error(`Something went wrong trying to load ${timer}:\n${e}`); }
			}

			script.log(`A total of ${timersCounter} monitors are on.`);
		})();

		/* (function loadArgumentsInhibitors() {
			let counter = { arguments: 0, inhibitors: 0 };
			for(let path of ['arguments', 'inhibitors']) {
				const scripts = readdirSync(`./${path}/`);
				for(let func of scripts) {
					try {
						func = getScript(func, path);
						if(func) {
							if(!script[path]) script[path] = {};
							script[path][func.name] = func.func;
							counter[path]++; }
					} catch { throw new Error(`Something went wrong trying to load ${func}`); }
				}
			}

			script.log(`${counter.arguments} arguments and ${counter.inhibitors} inhibitors were loaded.`)
		})(); */

		(function loadEvents() {
			let eventsCounter = 0;
			const events = readdirSync('./events/');
			for(let event of events) {
				try {
					const func = getScript(event, 'events');
					if(func) {
						client.on(func.name, func.func.bind(null, {client, script}));
						eventsCounter++; }
				} catch(e) { throw new Error(`Something went wrong trying to load ${event}:\n${e}`); }
			}
			
			script.log(`${eventsCounter} events are ready to be triggered.`);
		})();
		

		function getScript(script, from) {
				return (script.endsWith('.js') && {
					name: script.substring(0, script.length - 3),
					func: require(`./${from}/${script}`)
				})
		}
	})();
	

	const token = require('./token.json');
	await client.login(token);
})();