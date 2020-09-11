const Chance = require('chance');
const chance = new Chance();

module.exports = async ({client}, ownerId) => {
  const { data: pet } = await client.economy.pet.get(ownerId);

  pet.food -= chance.integer({ min: 5, max: 8 });
  if(pet.food < 0) pet.food = 0;
  pet.fun -= chance.integer({ min: 5, max: 8 });
  if(pet.fun < 0) pet.fun = 0;

  client.economy.save();
};