import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "alchemy",
  alias: ["potion", "brew", "ramuan"],
  category: "rpg",
  description: "Crear pociones y brebajes con hierbas",
  usage: ".alchemy <potion>",
  example: ".alchemy healthpotion",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  energi: 1,
  isEnabled: true,
};

const POTIONS = {
  healthpotion: {
    name: "❤️ Health Potion",
    materials: { herb: 3 },
    effect: "Restaura 50 HP",
    exp: 80,
    result: "healthpotion",
  },
  manapotion: {
    name: "💙 Mana Potion",
    materials: { herb: 2, flower: 1 },
    effect: "Restaura 50 Mana",
    exp: 90,
    result: "manapotion",
  },
  staminapotion: {
    name: "⚡ Stamina Potion",
    materials: { herb: 2, mushroom: 1 },
    effect: "Restaura 30 Stamina",
    exp: 100,
    result: "staminapotion",
  },
  strengthpotion: {
    name: "💪 Strength Potion",
    materials: { herb: 3, dragonscale: 1 },
    effect: "+20 ATK (5 min)",
    exp: 200,
    result: "strengthpotion",
  },
  defensepotion: {
    name: "🛡️ Defense Potion",
    materials: { herb: 3, iron: 2 },
    effect: "+15 DEF (5 min)",
    exp: 180,
    result: "defensepotion",
  },
  luckpotion: {
    name: "🍀 Luck Potion",
    materials: { herb: 5, diamond: 1 },
    effect: "+30% Drop Rate (10 min)",
    exp: 300,
    result: "luckpotion",
  },
  exppotion: {
    name: "✨ EXP Potion",
    materials: { herb: 4, gold: 2 },
    effect: "+50% EXP (15 min)",
    exp: 250,
    result: "exppotion",
  },
  antidote: {
    name: "💊 Antidote",
    materials: { herb: 2 },
    effect: "Cura el veneno",
    exp: 50,
    result: "antidote",
  },
  elixir: {
    name: "🧪 Elixir",
    materials: { herb: 10, diamond: 2, gold: 5 },
    effect: "Restaura todas las estadísticas",
    exp: 500,
    result: "elixir",
  },
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.inventory) user.inventory = {};
  if (!user.rpg) user.rpg = {};

  const args = m.args || [];
  const potionName = args[0]?.toLowerCase();

  if (!potionName) {
    let txt = `¡Hola Alquimista! ¿Qué poción vas a preparar hoy? 🧙‍♂️🧪\n\n`;
    txt += `*Lista de Recetas de Pociones:*\n`;

    for (const [key, pot] of Object.entries(POTIONS)) {
      const mats = Object.entries(pot.materials)
        .map(([m, qty]) => `${qty}x ${m}`)
        .join(", ");
      txt += `\n*${pot.name}*\n`;
      txt += `📦 Materiales: ${mats}\n`;
      txt += `💫 Efek: ${pot.effect}\n`;
      txt += `👉 Ketik: \`.alchemy ${key}\`\n`;
    }
    txt += `\n💡 *Consejo:* ¡Los materiales de hierba se consiguen en \`.garden\` o \`.dungeon\`! 🌱`;

    return m.reply(txt);
  }

  const potion = POTIONS[potionName];
  if (!potion) {
    return m.reply(`¡Vaya, ¡esa mezcla es peligrosa! La receta no está en el libro. 😂\n¡Revisa la lista correctamente con \`.alchemy\`!`);
  }

  const missingMaterials = [];
  for (const [material, needed] of Object.entries(potion.materials)) {
    const have = user.inventory[material] || 0;
    if (have < needed) {
      missingMaterials.push(`• ${material}: ${have}/${needed}`);
    }
  }

  if (missingMaterials.length > 0) {
    return m.reply(`¡Eh, los materiales no son suficientes para preparar *${potion.name}*! 😭\n\nTe faltan:\n${missingMaterials.join("\n")}\n\n¡Consigue las hierbas primero! 🏃💨`);
  }

  await m.react("🧪");
  await m.reply(`Blubuk blubuk... ¡BZZZZ! 🧪✨\nMezclando químicos para preparar *${potion.name}*... ¡Cuidado, podría explotar! 💥`);
  await new Promise((r) => setTimeout(r, 3000));

  for (const [material, needed] of Object.entries(potion.materials)) {
    user.inventory[material] -= needed;
    if (user.inventory[material] <= 0) delete user.inventory[material];
  }

  user.inventory[potion.result] = (user.inventory[potion.result] || 0) + 1;

  await addExpWithLevelCheck(sock, m, db, user, potion.exp);
  db.save();

  await m.react("✅");
  return m.reply(
    `CLLINGGG!! ¡POCIÓN CREADA CON ÉXITO! 🎉🧪\n\n` +
      `Lograste preparar:\n` +
      `📦 Objeto: *${potion.name}*\n` +
      `💫 Efecto: *${potion.effect}*\n` +
      `📈 EXP Alchemy: *+${potion.exp}*\n\n` +
      `¡No te la bebas toda de una vez si no quieres malestar estomacal! 😂`
  );
}

export { pluginConfig as config, handler };
