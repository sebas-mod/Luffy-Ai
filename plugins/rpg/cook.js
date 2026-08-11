import { getDatabase } from "../../src/lib/luffy-database.js";

const pluginConfig = {
  name: "cook",
  alias: ["masak"],
  category: "rpg",
  description: "Cocina alimentos para recuperar HP",
  usage: ".cook",
  example: ".cook",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  carne: 0,
  isEnabled: true,
};

const RECIPES = {
  fish_soup: { name: "🍲 Sopa de Pescado", materials: { fish: 2 }, heal: 30 },
  grilled_meat: { name: "🍖 Carne Asada", materials: { rabbit: 1, wood: 1 }, heal: 40 },
  apple_pie: { name: "🥧 Tarta de Manzana", materials: { apple: 3 }, heal: 25 },
  steak: { name: "🥩 Bistec", materials: { boar: 1, coal: 1 }, heal: 60 },
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  user.rpg.health = user.rpg.health || 100;
  user.rpg.maxHealth = user.rpg.maxHealth || 100;

  if (user.rpg.health >= user.rpg.maxHealth) {
    return m.reply(`¡Tu estómago aún está lleno bro! 🤢\nNo cocines todavía, si te llenas de más no podrás caminar! 🏃💨`);
  }

  let cooked = null;
  for (const [key, recipe] of Object.entries(RECIPES)) {
    let canCook = true;
    for (const [mat, qty] of Object.entries(recipe.materials)) {
      if ((user.inventory[mat] || 0) < qty) {
        canCook = false;
        break;
      }
    }
    if (canCook) {
      cooked = { key, ...recipe };
      break;
    }
  }

  if (!cooked) {
    let txt = `¡Hola Chef! ¿Qué quieres cocinar hoy? 🍳👨‍🍳\n\n`;
    txt += `Esta es la lista de recetas que puedes preparar:\n\n`;
    for (const [key, recipe] of Object.entries(RECIPES)) {
      txt += `*${recipe.name}*\n`;
      txt += `❤️ Cura: +${recipe.heal} HP\n`;
      txt += `📦 Ingredientes necesarios:\n`;
      for (const [mat, qty] of Object.entries(recipe.materials)) {
        const has = user.inventory[mat] || 0;
        txt += `• ${has >= qty ? "✅" : "❌"} ${mat}: ${has}/${qty}\n`;
      }
      txt += `\n`;
    }
    txt += `(El bot cocinará automáticamente la primera receta con suficientes ingredientes!)`;
    return m.reply(txt);
  }

  for (const [mat, qty] of Object.entries(cooked.materials)) {
    user.inventory[mat] -= qty;
  }

  await m.react("🍳");
  await m.reply(`¡Srengg... Srenggg...! 🔥🍳\nCocinando *${cooked.name}*, ¡el olor es delicioso! 🤤`);
  await new Promise((r) => setTimeout(r, 3000));

  const oldHealth = user.rpg.health;
  user.rpg.health = Math.min(user.rpg.health + cooked.heal, user.rpg.maxHealth);

  db.save();

  await m.react("✅");

  let txt = `¡ÑAM ÑAM! ¡Comida lista! 🍽️✨\n\n`;
  txt += `Te comiste el *${cooked.name}* y te sientes mejor!\n`;
  txt += `❤️ HP Recuperado: ${oldHealth} 📈 *${user.rpg.health}*\n\n`;
  txt += `¡Sigue aventurándote a tope! 🚀🔥`;

  await m.reply(txt);
}

export { pluginConfig as config, handler };
