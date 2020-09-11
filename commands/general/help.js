module.exports = {
	run: async ({script, message}) => {
		try {
			message.args = message.args.join(' ');

			let embed = {
				color: process.env.COL_BLUE,
				fields: []
			}, content;
		
			if(message.args.length > 0 && script.command[message.args]) {
				const command = script.command[message.args];
				embed.title = `\`${process.env.PREFIX}${command.help.name}\``;
				if(command.help.hidden) embed.description = 'Comando secreto! ⭐'
				if(!embed.description) embed.description = '';
				else embed.description += '\n';
				embed.description += 'Como usar:' +
					`\`${process.env.PREFIX}${command.help.name} ${command.help.usage}\``;
				embed.fields.push(
					{
					name: 'Descrição',
					value: command.help.description
					},
					{
						name: 'Alternativas',
						value: '`' + process.env.PREFIX + command.help.aliases.join('`, `.') + '`'
					}
				);
				if(command.help.nsfw) embed.footer = { text: 'Esse comando é nsfw!\nSó funciona em canais nsfw.' }
			} else {
				const requestedActions = script.contains(message.args, ['actions', 'action', 'ações', 'ação', 'interactions', 'interaction', 'interações', 'interação']);
	
				embed.footer = { text: `Use "${process.env.PREFIX}${message.command} [comando]" para detalhes.\n` }
				if(!requestedActions) {
					embed.footer.text += `Use "${process.env.PREFIX}${message.command} actions" para interações.`
					if(message.args.length > 0) content = `<@${message.author.id}>,  não encontrei nenhum comando com o nome \`${message.args}\``;
				} else {
					const hidden = Object.entries(script.command).filter(([name, cmd]) =>
						name == cmd.help.name && script.contains(cmd.help.category, ['friendly', 'mean', 'romantic']) && cmd.help.hidden);
					embed.footer.text += hidden.length + ' ações são secretas e não aparecem na lista, shhh.'
				}
				
				for(let command in script.command) {
					const name = script.command[command].help.name;
					if(name == command && !script.command[name].help.hidden && !script.command[name].help.occult) {
						command = script.command[command];
						let category = script.capitalize(command.help.category);
	
						const isAdmin = command.help.category == 'admin';
						const isAction = script.contains(command.help.category, ['friendly', 'mean', 'romantic']);
	
						if(!isAdmin) {
							if(requestedActions && isAction) {
								switch(category) {
									case 'Romantic':
										category = `💕 ${category}`;
										break;
									case 'Mean':
										category = `💢 ${category}`;
										break;
									case 'Friendly':
										category = `💬 ${category}`;
										break;
									default:
										throw new Error('Invalid action category.');
								}
							}
		
							if((requestedActions && isAction) || (!requestedActions && !isAction)) {
								if(!embed.fields.some(field => field.name == category))
									embed.fields.push({
										name: category,
										value: '',
										inline: true
									});
								
								embed.fields.find(field => 
									field.name == category
								).value += `\n.${command.help.name}`;
							}
						}
					}
				}
	
				embed.fields.sort((a, b) => {
					const valA = a.value.match(/\n/g).length, valB = b.value.match(/\n/g).length;
					return (valA > valB) ? 1 : ((valB > valA) ? -1 : 0)
				}).reverse();
			}

			message.channel.send({ content, embed })
			.catch(e => { script.error(message, e, 'send help message') });			
		} catch(e) { script.error(message, e, 'send help message') }
	},
  
  config: {
    permissions: ['EMBED_LINKS']
  },

	help: {
		aliases: ['ajuda', 'commands', 'command', 'comandos', 'comando'],
		description: 'Tenha informação detalhada sobre os comandos.',
		usage: 'actions [OU] [nome-do-comando]'
	}
};