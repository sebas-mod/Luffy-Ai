import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "pet",
  alias: ["mypet", "hewanku", "peliharaan"],
  category: "rpg",
  description: "Administrar mascota/animal de compañía",
  usage: ".pet <feed/train/status>",
  example: ".pet status",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
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
  phoenix: { name: "🔥 Phoenix", baseStats: { attack: 12, defense: 8, luck: 15 }, evolve: null },
  dragon: { name: "🐉 Dragón", baseStats: { attack: 20, defense: 15, luck: 12 }, evolve: null },
  thunderbunny: { name: "⚡ Thunder Bunny", baseStats: { attack: 10, defense: 12, luck: 18 }, evolve: null },
};

const FOOD_ITEMS = {
  bread: { name: "🍞 Pan", hunger: 10, exp: 5 },
  fish: { name: "🐟 Pez", hunger: 20, exp: 10 },
  meat: { name: "🍖 Carne", hunger: 30, exp: 15 },
  fruit: { name: "🍎 Fruta", hunger: 15, exp: 8 },
  premium_food: { name: "⭐ Premium Food", hunger: 50, exp: 30 },
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
      `¡No tienes mascota todavía! 😭\nQué triste aventurarse solo...\n\n` +
        `*Cómo conseguir un compañero:* \n` +
        `🛒 Compra en \`${m.prefix}petshop\`\n` +
        `💕 Consigue de \`${m.prefix}breeding\`\n` +
        `🗡️ ¡Botín raro de jefes!`
    );
  }

  const pet = user.rpg.pet;
  const petInfo = PET_TYPES[pet.type];

  if (!action || !["feed", "train", "status", "rename", "evolve"].includes(action)) {
    const maxHunger = 100;
    const hungerStatus = pet.hunger >= 70 ? "😊 Feliz & Lleno" : pet.hunger >= 40 ? "😐 Normal" : "😰 ¡Muy Hambriento!";

    let txt = `🐾 *Libro de Identidad de Mascota* 🐾\n\n`;
    txt += `*Perfil del/la ${pet.name}:*\n`;
    txt += `• Especie: *${petInfo.name}*\n`;
    txt += `• Level: *${pet.level || 1}*\n`;
    txt += `• EXP: *${pet.exp || 0} / ${(pet.level || 1) * 100}*\n`;
    txt += `• Estómago: *${pet.hunger}/${maxHunger}* (${hungerStatus})\n\n`;

    txt += `*Fuerza Física:*\n`;
    txt += `⚔️ Attack: *${pet.stats?.attack || petInfo.baseStats.attack}*\n`;
    txt += `🛡️ Defense: *${pet.stats?.defense || petInfo.baseStats.defense}*\n`;
    txt += `🍀 Luck: *${pet.stats?.luck || petInfo.baseStats.luck}*\n\n`;

    txt += `*Interacción:*\n`;
    txt += `👉 \`${m.prefix}pet feed <comida>\` - Alimentar\n`;
    txt += `👉 \`${m.prefix}pet train\` - Entrenar para que sea fuerte\n`;
    txt += `👉 \`${m.prefix}pet rename <nuevo_nombre>\` - Cambiar nombre\n`;
    if (petInfo.evolve) {
      txt += `👉 \`${m.prefix}pet evolve\` - Evolucionar (Si cumple los requisitos)\n`;
    }

    return m.reply(txt);
  }

  if (action === "feed") {
    const foodKey = args[1]?.toLowerCase();

    if (!foodKey) {
      let txt = `¡El ${pet.name} te está mirando y se lame los labios... 🤤\n¿Qué le vas a dar de comer?\n\n`;
      txt += `*Lista de Comida en tu Mochila:*\n`;
      for (const [key, food] of Object.entries(FOOD_ITEMS)) {
        const have = user.inventory[key] || 0;
        txt += `\n*${food.name}* (Tiene: ${have}x)\n`;
        txt += `🍖 Saciado: +${food.hunger} | ✨ EXP: +${food.exp}\n`;
        txt += `👉 Alimentar: \`.pet feed ${key}\`\n`;
      }
      return m.reply(txt);
    }

    const food = FOOD_ITEMS[foodKey];
    if (!food) {
      return m.reply(`¡No le des comida rara! ¡Se va a enfermar el estómago! 😂❌`);
    }

    if ((user.inventory[foodKey] || 0) < 1) {
      return m.reply(`¡No tienes *${food.name}* en tu mochila! ¡Ve a comprar! 🛒🏃`);
    }

    if (pet.hunger >= 100) {
      return m.reply(`¡El estómago de ${pet.name} está lleno! ¡No lo obligues a seguir comiendo! 🤢`);
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
      levelUpMsg = `\n🎉 *WOHOO! ¡${pet.name} SUBE DE NIVEL al Nivel ${pet.level}!* 🎉`;
    }

    db.save();

    return m.reply(
      `Ñam... ñam... ñam! 🤤🍖\n\n` +
        `¡El *${pet.name}* devoró *${food.name}* con avidez!\n` +
        `🍖 Se llenó el estómago *+${food.hunger}* (${pet.hunger}/100)\n` +
        `✨ Obtuvo EXP *+${food.exp}*` +
        levelUpMsg
    );
  }

  if (action === "train") {
    if (pet.hunger < 20) {
      return m.reply(`¡Qué crueldad, ¡hacerlo entrenar con hambre! 😭\n¡El estómago de ${pet.name} está rugiendo, dale de comer primero!`);
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
      levelUpMsg = `\n🎉 *¡GENIAL! ¡${pet.name} SUBE DE NIVEL al Nivel ${pet.level}!* 🎉`;
    }

    db.save();

    let txt = `Hup! Hup! Hiyah!! 🏃‍♂️💨\n\n`;
    txt += `Si *${pet.name}* hizo entrenamiento físico duro hoy!\n`;
    txt += `✨ EXP Aumentado: *+${expGain}*\n`;
    txt += `😰 Sensación de Hambre: *-15*\n`;
    txt += levelUpMsg;

    return m.reply(txt);
  }

  if (action === "rename") {
    const newName = args.slice(1).join(" ");
    if (!newName || newName.length < 2 || newName.length > 15) {
      return m.reply(`¿Qué nombre tan raro? ¡Nada de rarezas, pon algo decente (2-15 caracteres)! 😂`);
    }

    const oldName = pet.name;
    pet.name = newName;
    db.save();

    return m.reply(`¡Listo! Se actualizó su acta de nacimiento.\nAhora llámalo *${newName}*! (Antes: ${oldName}) ✨`);
  }

  if (action === "evolve") {
    if (!petInfo.evolve) {
      return m.reply(`La línea evolutiva de ${pet.name} termina aquí, ¡ya alcanzó su forma perfecta! 🌟`);
    }

    if ((pet.level || 1) < 10) {
      return m.reply(`Ten paciencia, ¡${pet.name} es muy joven! Necesita mínimo *Nivel 10* para evolucionar (Ahora es Nivel ${pet.level || 1}). 🐣`);
    }

    const evolvedPet = PET_TYPES[petInfo.evolve];
    pet.type = petInfo.evolve;
    pet.stats = { ...evolvedPet.baseStats };
    pet.level = 1;
    pet.exp = 0;

    db.save();

    return m.reply(
      `CLLINGGG!! ✨🌟\n\n` +
        `¡El *${pet.name}* de repente brilla con luz intensa!\n` +
        `¡Se ha *evolucionado* en *${evolvedPet.name}* el majestuoso!\n\n` +
        `Su estado se reinició pero ¡es mucho más fuerte! Revisa con \`.pet status\` 😎🔥`
    );
  }
}

export { pluginConfig as config, handler };
