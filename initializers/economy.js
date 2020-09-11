const { writeFileSync } = require('fs');

module.exports = async ({client, script}) => {
  client.economy = require('../data/economy.json');
  client.pet = require('../data/pets.json');

  client.economy.save = async () => {
    writeFileSync('./data/economy.json', JSON.stringify(client.economy, null, 1));
  };

  client.economy.get = (userId, serverId) => {
    try {
      if(!isNaN(userId)) userId = String(userId);
      if(serverId && !isNaN(serverId)) serverId = String(serverId);

      if(!client.economy[userId]) {
        if(isNaN(userId)) throw new Error('Invalid user insert into economy.');
        client.economy[userId] = {
          exp: {},
          cash: {
            balance: 1000,
            games: {
              won: 0,
              lost: 0
            }
          },
          isOwned: false,
          created: script.date()
        };
      }
      
      if(serverId && !client.economy[userId].exp[serverId]) {
        if(isNaN(serverId)) throw new Error('Invalid server insert into economy.');
        client.economy[userId].exp[serverId] = {
          oldLevel: 0,
          messages: 0,
          interactions: 0,
          required: 1
        }
      }

      client.economy.save();

      let wallet = { account: client.economy[userId] };
      if(serverId) wallet.exp = wallet.account.exp[serverId];
      return { account: wallet.account, exp: wallet.exp };
    } catch(e) { console.log(`Something went wrong when trying to get economy:\n${e}`); }
  };


  client.economy.level = (userId, serverId, { notifyChannel, exp } = {}) => {
    try {
      if(!exp) {
        const wallet = client.economy.get(userId, serverId);
        exp = wallet.exp; }

      const totalExp = exp.messages + (exp.interactions * 5);

      let level = exp.oldLevel;

      while(totalExp >= exp.required) {
        level++;
        exp.required += 25 + (level * 20);
      }

      if(level != exp.oldLevel && notifyChannel) {
        exp.oldLevel = level;
        notifyChannel.send(`🌺 <@${userId}> subiu de nível e agora é **nível ${exp.oldLevel}**! ~ 🌺`);

        client.economy.save();
      }      

      return exp.oldLevel;
    } catch(e) { console.log(`Something went wrong when trying to get level:\n${e}`); }
  }

  client.economy.exp = (userId, serverId, { interaction, notifyChannel, double } = {}) => {
    try {
      const { exp } = client.economy.get(userId, serverId);

      if(interaction) exp.interactions += (double ? 2 : 1);
      else exp.messages += (double ? 2 : 1);

      client.economy.level(userId, serverId, { notifyChannel, exp });
    } catch(e) { console.log(`Something went wrong when trying to give exp:\n${e}`); }
  }


  client.economy.cash = (userId, quantity, operation = 'add', bet) => {
    try {      
      const { account } = client.economy.get(userId);

      if(isNaN(quantity))
        throw new Error('Please give a valid cash quantity.');
      if(operation != 'add' && operation != 'subtract')
        throw new Error('Please give a valid cash processing operation.');
        
      if(operation == 'add')
        account.cash.balance += parseInt(quantity);
      else {
        if(account.cash.balance - quantity < 0)
          throw new Error('Not enough money in the account.')
        account.cash.balance -= parseInt(quantity); }
      
      if(bet)
        account.cash.games[operation == 'add' ? 'won' : 'lost'] += parseInt(quantity);

      client.economy.save();
    } catch(e) { console.log(`Something went wrong when trying to set cash:\n${e}`); }
  };

  
  client.economy.daily = (userId, quantity) => {
    try {
      client.economy.get(userId);
      
      client.economy.cash(userId, quantity);
      client.economy[userId].daily = script.date();
      client.economy.save();
    } catch(e) { console.log(`Something went wrong when trying to give daily cash:\n${e}`); }
  }


  client.economy.pet = {
    set: async (userId, subjectId) => {
      try {
        client.economy.get(userId);
        client.economy.get(subjectId);

        if(!client.economy[userId].pet) {
          client.economy[userId].pet = {
            food: 100,
            fun: 100,
            love: 10,
            inventory: {
              foods: [                
                {
                  ico: "<:cereal:742041916022980669>",
                  name: "cereal",
                  fill: 10,
                  quantity: 5
                }
              ],
              items: [
                {
                  ico: '<:coleira_comum:733719434262216825>',
                  name: 'coleira comum',
                  effectStr: 'sem efeitos adicionais...',
                  effect: []
                }
              ]
            },            
            since: script.date(),
            id: subjectId
          };

          client.petTimers[userId] = setInterval(() => {
            script.timer.petNecessities({client}, userId); }, 30 * 60000);
        }
        
        client.economy[subjectId].isOwned = userId;

        client.economy.save();
      } catch(e) { console.log(`Something went wrong when trying to set pet data:\n${e}`); }
    },

    get: async (idAuthor) => {
      try {
        const idOwner = (() => {
          const { account } = client.economy.get(idAuthor);
          return account.isOwned; })();
        const idPet = (() => {
          const { account } = client.economy.get(idAuthor);
          return account.pet && account.pet.id; })();
        
        let authorIs;
        if(idOwner) authorIs = 'pet';
        else if(idPet) authorIs = 'owner';
        if(!authorIs) return;

        return {
          ownerId: idOwner || idAuthor,
          petId: idPet || idAuthor,
          data: (() => {
            const { account } = client.economy.get(idOwner || idAuthor);
            return account.pet;
          })(),
          subject: await (async () => {
            let fetched;
            await client.users.fetch(String(idOwner || idPet))
            .then(user => fetched = user)
            .catch(e => { console.log(`Something went wrong when trying to get pet owner data:\n${e}`); });
            return fetched;
          })(),
          authorIs
        };
      } catch(e) { console.log(`Something went wrong when trying to get pet owner data:\n${e}`); }
    },

    flee: async (petId, ownerId) => {
      try {
        client.economy.get(petId);
        client.economy.get(ownerId);

        client.economy[ownerId].pet = undefined;
        client.economy[petId].isOwned = false;      

        client.economy.save();
      } catch(e) { console.log(`Something went wrong when trying to flee pet owner:\n${e}`); }
    },

    switch: async (ownerId, petId) => {
      try {
        client.economy.get(petId);
        client.economy.get(ownerId);

        client.economy[ownerId].pet.love -= 100;
        if(client.economy[ownerId].pet.love < 0) client.economy[ownerId].pet.love = 0;

        const temporary = client.economy[petId].pet;
        client.economy[petId].pet = client.economy[ownerId].pet;
        client.economy[petId].pet.id = ownerId;
        client.economy[ownerId].pet = temporary;
        
        client.economy[petId].isOwned = false;
        client.economy[ownerId].isOwned = petId;

        client.economy.save();      
      } catch(e) { console.log(`Something went wrong when trying to switch pet owner:\n${e}`); }
    },

    buy: async (food = false, userId, item) => {
      try {
        if(typeof item != 'object' || !item.name)
          throw new Error('trying to buy an invalid item');

        const { account } = client.economy.get(userId);

        if(item.value)
          client.economy.cash(userId, item.value, 'subtract');

        if(food) {
          const heldFood = account.pet.inventory.foods.find(food => food.name == item.name);
          if(heldFood)
            heldFood.quantity++;
          else {
            account.pet.inventory.foods.push({
              ico: item.ico,
              name: item.name,
              fill: item.fill,
              quantity: 1
            });
            
            account.pet.inventory.foods = account.pet.inventory.foods.sort((a,b) => {
              const valueType = (item) => {
                switch(item.name.split(' ')[0]) {
                  case 'cereal':
                    return 0;
                  case 'biscoito':
                    return 1;
                  case 'whiskas':
                    return 2;
                  case 'filé':
                    return 3;
                  case 'salmão':
                    return 4;
                  case 'coxa':
                    return 5;
                }
              }

              const valA = valueType(a), valB = valueType(b);        
              return (valA > valB) ? 1 : ((valB > valA) ? -1 : 0)
            });
          }

        } else {
          account.pet.inventory.items = account.pet.inventory.items
          .filter(heldItem => heldItem && !heldItem.name.includes(item.name.split(' ')[0]));
          account.pet.inventory.items.push({
            ico: item.ico,
            name: item.name,
            effectStr: item.effectStr,
            effect: item.effect });

          account.pet.inventory.items.sort((a, b) => {
            const valueType = (item) => {
              switch(item.name.split(' ')[0]) {
                case 'coleira':
                  return 0;
                case 'laço':
                  return 1;
                case 'bolinha':
                  return 2;
              }
            }  

            const valA = valueType(a), valB = valueType(b);
            return (valA > valB) ? 1 : ((valB > valA) ? -1 : 0);
          });
        }

        client.economy.save();
      } catch(e) { console.log(`Something went wrong when trying to buy item:\n${e}`); }
    },

    reminder: ({ owner, pet, deleteAfter }, message, type, item) => {
			try {
        const { ask, askTo } = (() => {
          switch(type) {
            case 'buy':
              if(item) return {
                ask: `Gostaria de fazer bagunça até seu dono comprar um(a) \`${item}\` pra você?`,
                askTo: `Elu está correndo por aí e fazendo bagunça, insistindo pra que você compre um(a) \`${item}\` no \`${process.env.PREFIX}petshop\`!` };
              else return {
                ask: 'Gostaria de pedir pra que elu te leve no petshop e te compre algo legal?',
                askTo: `Elu está insistindo sem parar pra que você compre algo pra ele no \`${process.env.PREFIX}petshop\`!` };
            case 'food':
              if(item) return {
                ask: `Quer incomodar seu dono até ele te alimentar com \`${item}\`?`,
                askTo: `Elu está fazendo barulho sem parar, pedindo que você user \`${process.env.PREFIX}pet\` e dê \`${item}\` pra elu comer!` };
              else return {
                ask: 'Quer avisar elu que você está com fome e latir ou miar por comida?',
                askTo: `Use \`${process.env.PREFIX}feed\` pra alimentá-lo! Elu está com fome!` };
            case 'bath':
              return {
                ask: 'Se sente suje? Quer reclamar com seu dono até elu te dar banho?',
                askTo: `Está se sentindo suje e quer um banho imediatamente! Use \`${process.env.PREFIX}bath\`!` }
            default:
              return {
                ask: 'Deseja mandar um recado pro seu dono pedindo pra elu tomar conta de você?',
                askTo: `Use \`${process.env.PREFIX}pet\` pra ver o estado de seu pet, ` +
                'não esqueça de alimentá-lo e de interagir bastante com ele! ~' };
          }
        })();

				const send = async () => {
          try {
            await owner.send('Eeei! :3 🚨🚨 ' +
              `Seu pet, <@${pet.id}>, quer atenção! ` + askTo)
            .catch(e => script.error(message, e, 'send owner reminder'));
      
            await script.delete('recado enviado para seu dono! :3', message, true, pet.id);

            if(deleteAfter) await message.delete({ timeout: 2500 }).catch(() => {});
          } catch(e) { script.error(message, e, 'send owner reminder') }
        };
        
        script.waitApproval((type ? 'você não tem um pet pra usar esse comando, mas tem um dono! ' : '') +
					ask + '? :3', message, send, { user: pet });
			} catch(e) { script.error(message, e, 'load petshop') }
    },

    fill: async (userId, { food } = {}) => {
      try {
        let heldFood;
        if(food) {
          heldFood = client.economy[userId].pet.inventory.foods
          .find(({ name }) => name == food.name);
          if(!heldFood) throw new Error('Could not find food in inventory.');
          
          heldFood.quantity--;
          if(heldFood.quantity <= 0)
            client.economy[userId].pet.inventory.foods = client.economy[userId].pet.inventory.foods
            .filter(({ name }) => name != heldFood.name);
        }

        const stat = food ? 'food' : 'fun';
        const fill = heldFood ? heldFood.fill : 10;
        client.economy[userId].pet[stat] += fill;
        if(client.economy[userId].pet[stat] > 100)
          client.economy[userId].pet[stat] = 100;
        
        const heldItem = client.economy[userId].pet.inventory.items.find(heldItem =>
          heldItem && heldItem.effect.type == 'giveBonusLove');
        const love = heldItem ? 2 : 1;
        client.economy[userId].pet.love += love;

        client.economy.save();

        return love;
      } catch(e) { console.log(`Something went wrong when trying to feed pet:\n${e}`); }
    },

    bath: async (ownerId) => {
      try {
        client.economy[ownerId].pet.washed = script.date();
        client.economy.save();

      } catch(e) { console.log(`Something went wrong when trying to wash pet:\n${e}`)}
    }
  };
}