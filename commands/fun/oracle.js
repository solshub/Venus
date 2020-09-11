const Chance = require('chance');
const chance = new Chance();

module.exports = {
	run: async ({client, script, message}) => {
    try {
      const question = message.args.join(' ').toLowerCase();
      let answer;

      let type;

      if(question.includes('are you winning') || question.includes('are ya winning'))
        answer = 'i\'m always winning dad.';
      else if(script.contains(question, ['quem', 'qm']) && script.contains(question, ['é seu', 'e seu', 'te']) && script.contains(question, ['criad', 'criou']))
        answer = 'minha criadora foi a Sol :3';
      else if(script.contains(question, ['vieirinha', 'vierinha']))
        answer = 'me recuso a falar sobre o Vieirinha.';
      else if(script.contains(question, ['shiizu', 'shizu', 'louie']))
        answer = 'Louie me paga pra não responder perguntas sobre ela.';
      else if(script.contains(question, ['oi', 'olá', 'ola', 'oioi']))
        answer = 'oi! Tudo bem? ~';
      else if(script.contains(question, ['va', 'vá']) && question.includes('se') && script.contains(question, ['fude', 'fode', 'dana']))
        answer = 'oxi, vai você.';
      else if(script.contains(question, ['morre', 'more', 'mata', 'suicídio', 'suicidio']))
        answer = 'não respondo perguntas sobre morrer! Mas se você estiver querendo morrer... saiba que não deve de jeito nenhum!';
      else if(question.includes('seja fofa'))
        answer = 'nyaaah! :3 ~~';
      else if(question.includes('?') && question.replace(/ /g,'').length <= 4)
        type = 'understand';
      
      if(!answer && script.contains(question, ['você', 'voce', 'vc']) && script.contains(question, ['é', 'e'])) {
        if(script.contains(question, ['garoto', 'garota']))
          answer = 'eu sou o que você quiser. ~';
        else if(script.contains(question, ['lgbt', 'fofa', 'gay', 'yag']))
          answer = 'claro que sou!';
      }
  
      if(!answer && message.author.id == process.env.USER_BRUNA) {
        if(script.contains(question, ['ama', 'amo', 'ame', 'toda minha', 'todinha minha']))
          type = 'yes';
        else if(script.contains(question, ['beij', 'casa']))
          type = chance.pickone(['yet', 'maybe']);
      }

      if(!answer && message.author.id == process.env.USER_SOL) {
        if(question.includes('eu') && script.contains(question, ['gosto', 'amo', 'casa']) && question.includes('bruna'))
          type = 'yes';
      }

      
      if(!answer && !type) {
        if(!question.includes('?') || question.replace(/ /g,'').replace('?', '').length < 1)
          answer = 'por favor, use esse comando pra me fazer perguntas de sim ou não. ~';
        else
          type = chance.pickone(Object.keys(client.oracle));
      }
  
      if(!answer) answer = chance.pickone(client.oracle[type]);
  
      if(!answer.includes('perguntas de sim ou não')) {
        answer = `> ${message.message}\n` + `<@${message.author.id}>, ` + answer;
        message.channel.send(answer)
        .catch(e => script.error(message, e, 'answer a question'));
      } else script.reply(message, answer);
    } catch(e) { script.error(message, e, 'answer a question') }
	},

	help: {
    aliases: ['venus', 'vênus', 'oráculo', 'oraculo', 'oráculo', '8ball', 'pergunta', 'pergunte', 'resposta', 'responda', 'responder'],
    description: 'Me pergunte alguma coisa!',
    usage: '[pergunta]?'
	}
};