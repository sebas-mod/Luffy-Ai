import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "pet",
  alias: ["mypet", "hewanku", "peliharaan"],
  category: "rpg",
  description: "Kelola pet/hewan peliharaan",
  usage: ".pet <feed/train/status>",
  example: ".pet status",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

const PET_TYPES = {
  cat: { name: "🐱 Gato", baseStats: { attack: 5, defense: 3, luck: 5 }, evolve: "lion" },
  dog: { name: "🐕 Perro", baseStats: { attack: 8, defense: 5, luck: 2 }, evolve: "wolf" },
  bird: { name: "🐦 Pájaro", baseStats: { attack: 4, defense: 2, luck: 8 }, evolve: "phoenix" },
  fish: { name: "🐟 Pez", baseStats: { attack: 2, defense: 2, luck: 10 }, evolve: "dragon" },
  rabbit: { name: "🐰 Conejo", baseStats: { attack: 3, defense: 4, luck: 6 }, evolve: "thunderbunny" },
  lion: { name: "🦁 León", baseStats: { attack: 15, defense: 10, luck: 8 }, evolve: null },
  wolf: { name: "🐺 Lobo", baseStats: { attack: 18, defense: 12, luck: 5 }, evolve: null },
  phoenix: { name: "🔥 Fénix", baseStats: { attack: 12, defense: 8, luck: 15 }, evolve: null },
  dragon: { name: "🐉 Dragón", baseStats: { attack: 20, defense: 15, luck: 12 }, evolve: null },
  thunderbunny: { name: "⚡ Conejo Trueno", baseStats: { attack: 10, defense: 12, luck: 18 }, evolve: null },
};

const FOOD_ITEMS = {
  bread: { name: "🍞 Pan", hunger: 10, exp: 5 },
  fish: { name: "🐟 Pescado", hunger: 20, exp: 10 },
  meat: { name: "🍖 Carne", hunger: 30, exp: 15 },
  fruit: { name: "🍎 Fruta", hunger: 15, exp: 8 },
  premium_food: { name: "⭐ Comida Premium", hunger: 50, exp: 30 },
};

function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  const args = m.args || [];
  const action = args[0]?.toLowerCase();

  if (!user.rpg.pet) {
    return m.reply(
      `¡Aún no tienes una mascota bro! 😭\nQué triste es aventurarse solo...\n\n` +
        `*Cómo conseguir un amigo:* \n` +
        `🛒 Cómpralo en \`${m.prefix}petshop\`\n` +
        `💕 Consíguelo con \`${m.prefix}breeding\`\n` +
        `🗡️ Drop raro de los jefes!`
    );
  }

  const pet = user.rpg.pet;
  const petInfo = PET_TYPES[pet.type];

  if (!action || !["feed", "train", "status", "rename", "evolve"].includes(action)) {
    const maxHunger = 100;
    const hungerStatus = pet.hunger >= 70 ? "😊 Feliz y Lleno" : pet.hunger >= 40 ? "😐 Normalito" : "😰 ¡Hambre de lobo!";

    let txt = `🐾 *Carné de Identidad de la Mascota* 🐾\n\n`;
    txt += `*Perfil de ${pet.name}:*\n`;
    txt += `• Especie: *${petInfo.name}*\n`;
    txt += `• Nivel: *${pet.level || 1}*\n`;
    txt += `• EXP: *${pet.exp || 0} / ${(pet.level || 1) * 100}*\n`;
    txt += `• Panza: *${pet.hunger}/${maxHunger}* (${hungerStatus})\n\n`;

    txt += `*Fuerza Física:*\n`;
    txt += `⚔️ Ataque: *${pet.stats?.attack || petInfo.baseStats.attack}*\n`;
    txt += `🛡️ Defensa: *${pet.stats?.defense || petInfo.baseStats.defense}*\n`;
    txt += `🍀 Suerte: *${pet.stats?.luck || petInfo.baseStats.luck}*\n\n`;

    txt += `*Interacciones:*\n`;
    txt += `👉 \`${m.prefix}pet feed <comida>\` - Dar de comer\n`;
    txt += `👉 \`${m.prefix}pet train\` - Entrenar para que se fortalezca\n`;
    txt += `👉 \`${m.prefix}pet rename <nuevo_nombre>\` - Cambiar nombre\n`;
    if (petInfo.evolve) {
      txt += `👉 \`${m.prefix}pet evolve\` - Evolucionar (si cumples los requisitos)\n`;
    }

    return m.reply(txt);
  }

  if (action === "feed") {
    const foodKey = args[1]?.toLowerCase();

    if (!foodKey) {
      let txt = `${pet.name} te mira mientras se lame los labios... 🤤\n¿Con qué le vas a dar de comer?\n\n`;
      txt += `*Lista de Comidas en Tu Bolsa:*\n`;
      for (const [key, food] of Object.entries(FOOD_ITEMS)) {
        const have = user.inventory[key] || 0;
        txt += `\n*${food.name}* (Tienes: ${have}x)\n`;
        txt += `🍖 Saciedad: +${food.hunger} | ✨ EXP: +${food.exp}\n`;
        txt += `👉 Dar de comer: \`.pet feed ${key}\`\n`;
      }
      return m.reply(txt);
    }

    const food = FOOD_ITEMS[foodKey];
    if (!food) {
      return m.reply(`Vaya, ¡no le des comidas raras bro! Le va a doler la panza 😂❌`);
    }

    if ((user.inventory[foodKey] || 0) < 1) {
      return m.reply(`¡No tienes *${food.name}* en tu bolsa! ¡Ve de compras! 🛒🏃`);
    }

    if (pet.hunger >= 100) {
      return m.reply(`¡${pet.name} ya está muy lleno bro! No lo tortures haciéndolo comer más! 🤢`);
    }

    user.inventory[foodKey]--;
    if (user.inventory[foodKey] <= 0) delete user.inventory[foodKey];

    pet.hunger = Math.min(100, pet.hunger + food.hunger);
    pet.exp = (pet.exp || 0) + food.exp;

    let levelUpMsg = "";
    const expNeeded = (pet.level || 1) * 100;
    if (pet.exp >= expNeeded) {
      pet.level = (pet.level || 1) + 1;
      pet.exp -= expNeeded;
      pet.stats = pet.stats || { ...petInfo.baseStats };
      pet.stats.attack += 2;
      pet.stats.defense += 1;
      pet.stats.luck += 1;
      levelUpMsg = `\n🎉 *¡WOHOO! ¡${pet.name} SUBIÓ DE NIVEL al Nivel ${pet.level}!* 🎉`;
    }

    db.save();

    return m.reply(
      `Ñam... ñam... ñam! 🤤🍖\n\n` +
        `¡*${pet.name}* devoró con gusto el *${food.name}* que le diste!\n` +
        `🍖 Su panza se llenó *+${food.hunger}* (${pet.hunger}/100)\n` +
        `✨ Ganó EXP *+${food.exp}*` +
        levelUpMsg
    );
  }

  if (action === "train") {
    if (pet.hunger < 20) {
      return m.reply(`¡Qué cruel hacerlo entrenar con hambre! 😭\nA ${pet.name} le rugen las tripas, ¡dale de comer primero!`);
    }

    pet.hunger = Math.max(0, pet.hunger - 15);
    const expGain = 20 + Math.floor(Math.random() * 20);
    pet.exp = (pet.exp || 0) + expGain;

    let levelUpMsg = "";
    const expNeeded = (pet.level || 1) * 100;
    if (pet.exp >= expNeeded) {
      pet.level = (pet.level || 1) + 1;
      pet.exp -= expNeeded;
      pet.stats = pet.stats || { ...petInfo.baseStats };
      pet.stats.attack += 2;
      pet.stats.defense += 1;
      pet.stats.luck += 1;
      levelUpMsg = `\n🎉 *¡GENIAL! ¡${pet.name} SUBIÓ DE NIVEL al Nivel ${pet.level}!* 🎉`;
    }

    db.save();

    let txt = `¡Arriba! ¡Arriba! ¡Hiyah!! 🏃‍♂️💨\n\n`;
    txt += `¡*${pet.name}* entrenó duro su cuerpo hoy!\n`;
    txt += `✨ EXP Ganado: *+${expGain}*\n`;
    txt += `😰 Hambre: *-15*\n`;
    txt += levelUpMsg;

    return m.reply(txt);
  }

  if (action === "rename") {
    const newName = args.slice(1).join(" ");
    if (!newName || newName.length < 2 || newName.length > 15) {
      return m.reply(`¿Qué nombre es ese bro? No digas cosas raras, ponle uno decente (2-15 caracteres)! 😂`);
    }

    const oldName = pet.name;
    pet.name = newName;
    db.save();

    return m.reply(`¡Listo! Ya se actualizó su acta de nacimiento.\nAhora llámalo *${newName}*! (Antes: ${oldName}) ✨`);
  }

  if (action === "evolve") {
    if (!petInfo.evolve) {
      return m.reply(`La evolución de ${pet.name} termina aquí bro, ya está en su forma perfecta! 🌟`);
    }

    if ((pet.level || 1) < 10) {
      return m.reply(`Tranquilo bro, ${pet.name} todavía es pequeño! Necesita mínimo *Nivel 10* para evolucionar (ahora está en nivel ${pet.level || 1}). 🐣`);
    }

    const evolvedPet = PET_TYPES[petInfo.evolve];
    pet.type = petInfo.evolve;
    pet.stats = { ...evolvedPet.baseStats };
    pet.level = 1;
    pet.exp = 0;

    db.save();

    return m.reply(
      `¡CLLINGGG!! ✨🌟\n\n` +
        `¡*${pet.name}* de repente brilló intensamente!\n` +
        `Vaya, ya *evolucionó* a un poderoso *${evolvedPet.name}*!\n\n` +
        `Sus estadísticas se reiniciaron pero ahora es mucho más fuerte! Revísalo con \`.pet status\`! 😎🔥`
    );
  }
}

export { pluginConfig as config, handler };
