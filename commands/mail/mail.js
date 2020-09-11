const moment = require('moment');

module.exports = {
	run: async ({client, script, message}) => {
		try {			
			let author;
			if(message.mentions.users.size > 0)
				author = message.mentions.users.first()
			else if(script.contains(message.args, ['anon', 'anônimo', 'anonimo']))
				author = 'anon';
			else {
				const id = message.args.find(arg => !isNaN(arg));
				if(id) {
					message.message = message.message.replace(id, '');
					await client.users.fetch(String(id))
					.then(user => author = user)
					.catch(() => script.delete(`não consegui achar nenhum usuário de ID \`${id}\`.`, message));
				}
			}

			const { embeds , mails } = await client.mail.getMails(message, author);				
			
			let content = [];
			content.push(author ?
				`aqui estão os correios te enviados por ${author == 'anon' ? 'anônimos' : `<@${author.id}>`}!` :
				'aqui está sua caixa de correio!');
			content.push(` Use \`${process.env.PREFIX}${message.command} @[usuário] OU [id-do-usuário] OU anon\` ` +
				`para ver as mensagens enviadas apenas por algum autor específico.`);

			if(message.guild && mails.filter(mail => mail.hidden).length > 0)
				content.push(`\nVocê tem **${mails.filter(mail => mail.hidden).length} `+
					`${mails.filter(mail => mail.hidden).length > 1 ? 'mensagens ocultas' : 'mensagem oculta'}**! ` +
					'Use este comando na minha dm pra vê-las. ~');
			if(embeds.length < 1 || (message.guild && mails.filter(mail => !mail.hidden).length < 1)) {
				if(author) script.delete('opa... Parece que você não recebeu nenhuma mensagem ' + (author == 'anon' ? 'anônima' : `de <@${author.id}>`) + `! Desculpe por isso. :c`, message)
				else script.reply(message, {
					content: content[0],
					embed: {
						color: process.env.COL_WHITE,
						description: 'Poxa vida...\n' +
						'Parece que você não recebeu nenhum correio ainda...\n' +
						'Ou será que você só tem mensagens ocultas??\n' +
						'Mas... O que você fez com a mensagem que mandei?... ;-;'
					}
				});

				return;
			}
			
			if(embeds[0].mail)
				content.push(`\nReaja com \`${process.env.EMT_DELETE}\` e ` +
					`\`${process.env.EMT_ALLOW}\` pra apagar uma mensagem, ` +
					`ou com \`${process.env.EMT_HIDE}\` para ocultá-la.`);

			showEmbeds(mails, embeds, content, author);
		} catch(e) { script.error(message, e, 'check mails') }


		function showEmbeds(mails, embeds, content, author) {
			if(message.guild) showGuild();
			else showDm();

			function showGuild() {
				let mailMsg, reacted = [];
				(async function show(i = 0) {			
					if(!mailMsg) {
						await message.channel.send({ content: `<@${message.author.id}>, ` + content.join(''), embed: embeds[0].embed })
						.then(msg => mailMsg = msg).catch(e => { script.error(message, e, 'check mails') });
	
						if(!embeds[0].mail) return;
					} else {			
						mailMsg.reactions.removeAll();
						mailMsg.edit({ content: mailMsg.content.includes('\n') ? mailMsg.content.split('\n')[2] : mailMsg.content, embed: embeds[i].embed });
					}
	
					let reactions = [];
					async function react(msg, emt) {
						await msg.react(process.env[emt])
						.then((reaction) => {
							reactions.push(process.env[emt])
							reacted.push(reaction);
						}).catch(e => script.error(message, e, 'check mails'));
					}
	
					if(i > 1) await react(mailMsg, 'EMT_FIRST');
					if(i > 0) await react(mailMsg, 'EMT_BACK');
	
					await react(mailMsg, 'EMT_DELETE');
					if(!embeds[i].mail.hidden) await react(mailMsg, 'EMT_HIDE');
	
					if(embeds.length > (i + 1)) await react(mailMsg, 'EMT_NEXT');
					if(embeds.length > (i + 2)) await react(mailMsg, 'EMT_LAST');
	
					waitReactions(reactions, { callback: show, i });
				})();

				async function waitReactions(reactions, { callback, i }) {
					const filter = (reaction, author) => {
						return reactions.includes(reaction.emoji.name) && author.id == message.author.id; };
					mailMsg.awaitReactions(filter, { max: 1 })
					.then(async collected => {
						let operation;
		
						const reaction = collected.first();
						if(!reaction) return;
						switch(reaction.emoji.name) {
							case process.env.EMT_FIRST:
								return callback(0);
							case process.env.EMT_BACK:
								return callback(i - 1);
							case process.env.EMT_DELETE:
								reactions = reactions.filter(reaction => reaction != process.env.EMT_DELETE);
								await mailMsg.react(process.env.EMT_ALLOW)
								.then(() => reactions.push(process.env.EMT_ALLOW));
								return waitReactions(reactions, { callback, i });
							case process.env.EMT_HIDE:
								operation = 'hide';
								break;
							case process.env.EMT_NEXT:
								return callback(i + 1);
							case process.env.EMT_LAST:
								return callback(embeds.length - 1);
							case process.env.EMT_ALLOW:
								operation = 'delete';
								break;
						}
		
						if(operation) {
							const index = mails.findIndex(mail =>
								mail == embeds[i].mail );
							client.mail.alter(operation, index, message.author.id, message);
		
							await mailMsg.delete();
							message.cmd.run({client, script, message});
						}
					}).catch(e => { script.error(message, e, 'check mails') });
				}
			}

			async function showDm() {
				await script.reply(message, author ? content[0] : [content[0], content[1]].join(''));

				let boards = [];

				let i = 0, j = 0;
				for(const embed of embeds) {
					if((i % 15) == 0) {
						if(i > 0) j++;
						boards[j] = {
							color: process.env.COL_BLUE,
							author: {
								name: 'Caixa de correios',
								icon_url: message.author.avatarURL()
							},
							fields: [],
							footer: {
								text: `${process.env.EMT_MAIL} Mensagens #${i + 1} até #${embeds.length < i + 10 ? embeds.length : i + 10}`
							}
						}
					}

					boards[j].fields.push({
						name: (author ? '' : `\`#${i + 1}\` `) + embed.embed.author.name +
							(embed.mail.hidden ? '\nEssa mensagem está oculta!' : '') +
							`\n${moment(embed.embed.timestamp).format('DD/MM/YYYY')}`,
						value: embed.embed.description
					});

					i++;
				}
	
				for(const embed of boards) {
					await message.channel.send({ embed })
					.catch(e => script.error(message, e, 'check mails'));
				}

				if(!author)
					await message.channel
					.send(`Você pode gerenciar uma ou mais mensagens usando \`${process.env.PREFIX}delete [id-da-mensagem]\` para apagar ou \`${process.env.PREFIX}hide [id-da-mensagem]\` para ocultar ou revelar.`)
					.catch(e => script.error(message, e, 'check mails'));
			}
		}
	},
	
	config: {
		permissions: ['EMBED_LINKS', 'ADD_REACTIONS', 'READ_MESSAGE_HISTORY', 'MANAGE_MESSAGES']
	},

	help: {
		aliases: ['mails', 'email', 'correio', 'mailbox'],
		description: 'Verifique sua caixa do correio!',
		usage: '@[usuário] OU [id-do-usuário] OU anon'
	}
};