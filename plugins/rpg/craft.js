import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
  name: "craft",
  alias: ["buat", "create"],
  category: "rpg",
  description: "Craft item dari materials",
  usage: ".craft <item>",
  example: ".craft sword",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  carne: 0,
  isEnabled: true,
};

const RECIPES = {
  sword: {
    name: "⚔️ Espada de Hierro",
    materials: { iron: 5, coal: 3 },
    result: "sword",
    bonus: { attack: 10 },
  },
  armor: {
    name: "🛡️ Armadura de Hierro",
    materials: { iron: 10, coal: 5 },
    result: "armor",
    bonus: { defense: 15 },
  },
  pickaxe: {
    name: "⛏️ Pico de Diamante",
    materials: { diamond: 3, iron: 2 },
    result: "pickaxe",
    bonus: { mining: 20 },
  },
  rod: {
    name: "🎣 Caña Dorada",
    materials: { gold: 5, iron: 2 },
    result: "rod",
    bonus: { fishing: 20 },
  },
  potion: {
    name: "🥤 Poción de Salud",
    materials: { fish: 3, rabbit: 2 },
    result: "potion",
    qty: 2,
  },
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.inventory) user.inventory = {};
  if (!user.rpg) user.rpg = {};

  const args = m.args || [];
  const itemKey = args[0]?.toLowerCase();

  if (!itemKey) {
    let txt = `¡Hola Aventurero! ¿Qué herramienta quieres ensamblar? 🛠️✨\n\n`;
    txt += `*Lista de Recetas de Ensamblaje:*\n`;

    for (const [key, recipe] of Object.entries(RECIPES)) {
      txt += `\n*${recipe.name}*\n`;
      txt += `📦 Materiales necesarios:\n`;
      for (const [mat, qty] of Object.entries(recipe.materials)) {
        const userHas = user.inventory[mat] || 0;
        const status = userHas >= qty ? "✅" : "❌";
        txt += `• ${status} ${mat}: ${userHas}/${qty}\n`;
      }
      txt += `👉 Escribe: \`.craft ${key}\`\n`;
    }

    return m.reply(txt);
  }

  const recipe = RECIPES[itemKey];
  if (!recipe) {
    return m.reply(`Oye, ¿qué quieres ensamblar? ¡Ese objeto no está en la lista bro! 😂\nRevisa la lista correcta con \`.craft\`!`);
  }

  const missingMaterials = [];
  for (const [mat, qty] of Object.entries(recipe.materials)) {
    if ((user.inventory[mat] || 0) < qty) {
      missingMaterials.push(`• ${mat}: ${user.inventory[mat] || 0}/${qty}`);
    }
  }
  
  if (missingMaterials.length > 0) {
      return m.reply(`¡Ey, no hay suficientes materiales para ensamblar *${recipe.name}*! 😭\n\nTe falta:\n${missingMaterials.join("\n")}\n\n¡Recolecta primero y vuelve! 🏃💨`);
  }

  await m.react("🛠️");
  await m.reply(`Tok tok tok... ¡Krek...! 🛠️🔩\nEnsamblando seriamente *${recipe.name}*... ¡Ya casi está listo!`);
  await new Promise((r) => setTimeout(r, 2000));

  for (const [mat, qty] of Object.entries(recipe.materials)) {
    user.inventory[mat] -= qty;
  }

  const resultQty = recipe.qty || 1;
  user.inventory[recipe.result] = (user.inventory[recipe.result] || 0) + resultQty;

  if (recipe.bonus) {
    for (const [stat, value] of Object.entries(recipe.bonus)) {
      user.rpg[stat] = (user.rpg[stat] || 0) + value;
    }
  }

  await m.react("✅");

  let txt = `¡YEAH! ¡EL OBJETO YA ESTÁ LISTO! 🎉🛠️\n\n`;
  txt += `Lograste ensamblar:\n`;
  txt += `📦 Ítem: *${recipe.name} x${resultQty}*\n`;

  if (recipe.bonus) {
    txt += `\n*Estado de Bonus Activos:*\n`;
    for (const [stat, value] of Object.entries(recipe.bonus)) {
      txt += `📈 ${stat.toUpperCase()}: *+${value}*\n`;
    }
  }

  await m.reply(txt);
}

export { pluginConfig as config, handler };
