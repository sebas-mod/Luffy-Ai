import { getDatabase } from "../../src/lib/ourin-database.js";

const pluginConfig = {
  name: "cook",
  alias: ["masak"],
  category: "rpg",
  description: "Cocinar comida para recuperar salud",
  usage: ".cook",
  example: ".cook",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  energi: 0,
  isEnabled: true,
};

const RECIPES = {
  fish_soup: { name: "🍲 Sopa de Pescado", materials: { fish: 2 }, heal: 30 },
  grilled_meat: { name: "🍖 Carne Asada", materials: { rabbit: 1, wood: 1 }, heal: 40 },
  apple_pie: { name: "🥧 Tarta de Manzana", materials: { apple: 3 }, heal: 25 },
  steak: { name: "🥩 Steak", materials: { boar: 1, coal: 1 }, heal: 60 },
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  user.rpg.health = user.rpg.health || 100;
  user.rpg.maxHealth = user.rpg.maxHealth || 100;

  if (user.rpg.health >= user.rpg.maxHealth) {
    return m.reply(`¡Tu barriga está llena! 🤢\n¡No cocines ahora, si comes más no podrás caminar! 🏃💨`);
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
    let txt = `¡Hola Chef! ¿Qué vas a cocinar hoy? 🍳👨‍🍳\n\n`;
    txt += `Estas son las recetas que puedes preparar:\n\n`;
    for (const [key, recipe] of Object.entries(RECIPES)) {
      txt += `*${recipe.name}*\n`;
      txt += `❤️ Heal: +${recipe.heal} HP\n`;
      txt += `📦 Materiales necesarios:\n`;
      for (const [mat, qty] of Object.entries(recipe.materials)) {
        const has = user.inventory[mat] || 0;
        txt += `• ${has >= qty ? "✅" : "❌"} ${mat}: ${has}/${qty}\n`;
      }
      txt += `\n`;
    }
    txt += `(¡El bot cocinará automáticamente la primera receta cuyos materiales sean suficientes!)`;
    return m.reply(txt);
  }

  for (const [mat, qty] of Object.entries(cooked.materials)) {
    user.inventory[mat] -= qty;
  }

  await m.react("🍳");
  await m.reply(`Chissss... Chissss... 🔥🍳\nCocinando *${cooked.name}*, ¡huele delicioso! 🤤`);
  await new Promise((r) => setTimeout(r, 3000));

  const oldHealth = user.rpg.health;
  user.rpg.health = Math.min(user.rpg.health + cooked.heal, user.rpg.maxHealth);

  db.save();

  await m.react("✅");

  let txt = `¡ÑAM ÑAM! ¡Comida Lista! 🍽️✨\n\n`;
  txt += `Devoraste *${cooked.name}* y te sientes mucho mejor!\n`;
  txt += `❤️ HP Recuperado: ${oldHealth} 📈 *${user.rpg.health}*\n\n`;
  txt += `¡A la siguiente aventura! 🚀🔥`;

  await m.reply(txt);
}

export { pluginConfig as config, handler };
