import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "blacksmith",
  alias: ["tempa", "forge", "pandai"],
  category: "rpg",
  description: "Tempa senjata dan armor dari material",
  usage: ".blacksmith <item>",
  example: ".blacksmith sword",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 120,
  carne: 1,
  isEnabled: true,
};

const RECIPES = {
  sword: { materials: { iron: 3, wood: 2 }, result: "sword", name: "⚔️ Espada de Hierro", exp: 200, price: 500 },
  shield: { materials: { iron: 4, leather: 2 }, result: "shield", name: "🛡️ Escudo de Hierro", exp: 250, price: 600 },
  helmet: { materials: { iron: 2, leather: 1 }, result: "helmet", name: "⛑️ Casco de Hierro", exp: 150, price: 400 },
  armor: { materials: { iron: 5, leather: 3 }, result: "armor", name: "🦺 Armadura de Hierro", exp: 350, price: 800 },
  axe: { materials: { iron: 2, wood: 3 }, result: "axe", name: "🪓 Hacha de Hierro", exp: 180, price: 450 },
  pickaxe: { materials: { iron: 3, wood: 2 }, result: "pickaxe", name: "⛏️ Pico", exp: 180, price: 450 },
  bow: { materials: { wood: 4, string: 2 }, result: "bow", name: "🏹 Arco", exp: 200, price: 500 },
  arrow: { materials: { wood: 1, iron: 1 }, result: "arrow", name: "🏹 Flecha x10", exp: 50, price: 100, qty: 10 },
  goldsword: { materials: { gold: 5, diamond: 2, iron: 3 }, result: "goldsword", name: "🗡️ Espada de Oro", exp: 500, price: 2000 },
  diamondarmor: { materials: { diamond: 8, iron: 5, leather: 3 }, result: "diamondarmor", name: "💎 Armadura de Diamante", exp: 800, price: 5000 },
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.inventory) user.inventory = {};
  if (!user.rpg) user.rpg = {};

  const args = m.args || [];
  const itemName = args[0]?.toLowerCase();

  if (!itemName) {
    let txt = `¡Hola aventurero! ¡Bienvenido a la Herrería! 🔨⚒️\n¿Qué te puedo forjar hoy?\n\n`;
    txt += `*Lista de Armas y Armaduras:*\n`;

    for (const [key, recipe] of Object.entries(RECIPES)) {
      const mats = Object.entries(recipe.materials)
        .map(([m, qty]) => `${qty}x ${m}`)
        .join(", ");
      txt += `\n*${recipe.name}*\n`;
      txt += `📦 Materiales: ${mats}\n`;
      txt += `📈 EXP: +${recipe.exp}\n`;
      txt += `👉 Escribe: \`.blacksmith ${key}\`\n`;
    }
    txt += `\n💡 *Consejo:* ¡Los materiales se consiguen con \`.mining\` o \`.hunt\`!`;

    return m.reply(txt);
  }

  const recipe = RECIPES[itemName];
  if (!recipe) {
    return m.reply(`Vaya, ¿para qué es esa guía? ¡No está en mis apuntes bro! 😂\n¡Revisa la lista correcta con \`.blacksmith\`!`);
  }

  const missingMaterials = [];
  for (const [material, needed] of Object.entries(recipe.materials)) {
    const have = user.inventory[material] || 0;
    if (have < needed) {
      missingMaterials.push(`• ${material}: ${have}/${needed}`);
    }
  }

  if (missingMaterials.length > 0) {
    return m.reply(`¡Ey, no hay suficientes materiales para forjar *${recipe.name}*! 😭\n\nTe falta:\n${missingMaterials.join("\n")}\n\n¡Recolecta primero y vuelve! 🏃💨`);
  }

  await m.react("🔨");
  await m.reply(`¡Ting! Ting! ¡Cshhh...! 🔥🔨\nForjando metal para crear *${recipe.name}*... ¡El proceso tomará un poco de tiempo!`);
  await new Promise((r) => setTimeout(r, 4000));

  for (const [material, needed] of Object.entries(recipe.materials)) {
    user.inventory[material] -= needed;
    if (user.inventory[material] <= 0) delete user.inventory[material];
  }

  const resultQty = recipe.qty || 1;
  user.inventory[recipe.result] = (user.inventory[recipe.result] || 0) + resultQty;

  await addExpWithLevelCheck(sock, m, db, user, recipe.exp);
  db.save();

  await m.react("✅");

  let txt = `¡FORJA EXITOSA BRO! ⚔️🛡️\n\n`;
  txt += `¡Increíble, el resultado quedó perfecto! Esto es lo que hicimos a mano:\n`;
  txt += `🔨 Ítem: *${recipe.name}*\n`;
  txt += `📊 Cantidad: *+${resultQty}*\n`;
  txt += `📈 EXP de Crafting: *+${recipe.exp}*\n\n`;
  txt += `¡Listo para usarlo en la pelea! 😎🔥`;

  return m.reply(txt);
}

export { pluginConfig as config, handler };
