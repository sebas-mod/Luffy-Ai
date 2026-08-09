import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "alchemy",
  alias: ["potion", "brew", "ramuan"],
  category: "rpg",
  description: "Buat potion dan ramuan dari herba",
  usage: ".alchemy <potion>",
  example: ".alchemy healthpotion",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  carne: 1,
  isEnabled: true,
};

const POTIONS = {
  healthpotion: {
    name: "❤️ Poción de Salud",
    materials: { herb: 3 },
    effect: "Restaura 50 HP",
    exp: 80,
    result: "healthpotion",
  },
  manapotion: {
    name: "💙 Poción de Maná",
    materials: { herb: 2, flower: 1 },
    effect: "Restaura 50 de Maná",
    exp: 90,
    result: "manapotion",
  },
  staminapotion: {
    name: "⚡ Poción de Resistencia",
    materials: { herb: 2, mushroom: 1 },
    effect: "Restaura 30 de Resistencia",
    exp: 100,
    result: "staminapotion",
  },
  strengthpotion: {
    name: "💪 Poción de Fuerza",
    materials: { herb: 3, dragonscale: 1 },
    effect: "+20 ATQ (5 min)",
    exp: 200,
    result: "strengthpotion",
  },
  defensepotion: {
    name: "🛡️ Poción de Defensa",
    materials: { herb: 3, iron: 2 },
    effect: "+15 DEF (5 min)",
    exp: 180,
    result: "defensepotion",
  },
  luckpotion: {
    name: "🍀 Poción de Suerte",
    materials: { herb: 5, diamond: 1 },
    effect: "+30% Tasa de Drop (10 min)",
    exp: 300,
    result: "luckpotion",
  },
  exppotion: {
    name: "✨ Poción de EXP",
    materials: { herb: 4, gold: 2 },
    effect: "+50% EXP (15 min)",
    exp: 250,
    result: "exppotion",
  },
  antidote: {
    name: "💊 Antídoto",
    materials: { herb: 2 },
    effect: "Cura el veneno",
    exp: 50,
    result: "antidote",
  },
  elixir: {
    name: "🧪 Elixir",
    materials: { herb: 10, diamond: 2, gold: 5 },
    effect: "Restaura todos los stats",
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
    let txt = `¡Hola Alquimista! ¿Qué poción quieres preparar hoy? 🧙‍♂️🧪\n\n`;
    txt += `*Libro de Recetas de Pociones:*\n`;

    for (const [key, pot] of Object.entries(POTIONS)) {
      const mats = Object.entries(pot.materials)
        .map(([m, qty]) => `${qty}x ${m}`)
        .join(", ");
      txt += `\n*${pot.name}*\n`;
      txt += `📦 Ingredientes: ${mats}\n`;
      txt += `💫 Efecto: ${pot.effect}\n`;
      txt += `👉 Escribe: \`.alchemy ${key}\`\n`;
    }
    txt += `\n💡 *Consejo:* Puedes conseguir hierbas con \`.garden\` o \`.dungeon\`! 🌱`;

    return m.reply(txt);
  }

  const potion = POTIONS[potionName];
  if (!potion) {
    return m.reply(`Uy, ¡esa es una mezcla peligrosa bro! ¡La receta no está en el libro! 😂\n¡Revisa la lista correcta con \`.alchemy\`!`);
  }

  const missingMaterials = [];
  for (const [material, needed] of Object.entries(potion.materials)) {
    const have = user.inventory[material] || 0;
    if (have < needed) {
      missingMaterials.push(`• ${material}: ${have}/${needed}`);
    }
  }

  if (missingMaterials.length > 0) {
    return m.reply(`¡Ey, no hay suficientes ingredientes para preparar *${potion.name}*! 😭\n\nTe falta:\n${missingMaterials.join("\n")}\n\n¡Recolecta hierbas primero! 🏃💨`);
  }

  await m.react("🧪");
  await m.reply(`Blubuk blubuk... ¡BZZZZ! 🧪✨\nMezclando químicos para preparar *${potion.name}*... ¡Cuidado con la explosión! 💥`);
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
    `¡CLLINGGG!! ¡POCIÓN CREADA CON ÉXITO! 🎉🧪\n\n` +
      `Lograste preparar:\n` +
      `📦 Ítem: *${potion.name}*\n` +
      `💫 Efecto: *${potion.effect}*\n` +
      `📈 EXP de Alquimia: *+${potion.exp}*\n\n` +
      `¡No la bebas toda de una vez o te dolerá la panza! 😂`
  );
}

export { pluginConfig as config, handler };
