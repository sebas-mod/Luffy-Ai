import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "fishing",
  alias: ["rpgfish", "mancing"],
  category: "rpg",
  description: "Pescar para obtener peces (RPG)",
  usage: ".fishing",
  example: ".fishing",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  const staminaCost = 15;
  user.rpg.stamina = user.rpg.stamina || 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡Ay, tu stamina se agotó! 😭⚡\n\nPara pescar necesitas *${staminaCost} Stamina*, pero solo tienes *${user.rpg.stamina}*.\n¡Descansa para recargar! 🛌💤`);
  }

  user.rpg.stamina -= staminaCost;

  await m.react("🎣");
  await m.reply(`Lanzando el anzuelo al agua tranquila... 🌊🎣\nShhh, ¡no hagas ruido para que los peces muerdan! 🤫👀`);
  await new Promise((r) => setTimeout(r, 4000));

  const drops = [
    { item: "trash", chance: 20, name: "🗑️ Basura", exp: 10 },
    { item: "fish", chance: 50, name: "🐟 Pez", exp: 100 },
    { item: "prawn", chance: 30, name: "🦐 Camarón", exp: 150 },
    { item: "octopus", chance: 15, name: "🐙 Pulpo", exp: 300 },
    { item: "shark", chance: 5, name: "🦈 Tiburón", exp: 800 },
    { item: "whale", chance: 1, name: "🐳 Ballena", exp: 2000 },
  ];

  const rand = Math.random() * drops.reduce((sum, d) => sum + d.chance, 0);
  let caught = drops[0];

  let cumulative = 0;
  for (const drop of drops) {
    cumulative += drop.chance;
    if (rand <= cumulative) {
      caught = drop;
      break;
    }
  }

  const qty = 1;
  user.inventory[caught.item] = (user.inventory[caught.item] || 0) + qty;

  const expReward = caught.exp;
  const levelResult = await addExpWithLevelCheck(sock, m, db, user, expReward);

  db.save();

  await m.react("✅");

  let txt = `¡TRAC! ¡El anzuelo fue arrastrado! 🎣💦\n\n¡Wow, lograste sacar:\n`;
  if (caught.item === "trash") {
    txt += `> ${caught.name} 🤢\n¡Qué mal, sacaste basura! Pero al menos ganaste *+${expReward} EXP* de experiencia en reciclaje! 😂\n\n`;
  } else {
    txt += `> *${caught.name}* 🎉✨\n¡Genial! ¡También ganaste *+${expReward} EXP*!\n\n`;
  }
  
  txt += `⚡ Estamina usada: *-${staminaCost}*\n`;
  txt += `\nEl pez/basura ya está en tu mochila (\`.inv\`). ¡No olvides pescar de nuevo después! 💖🌊`;

  await m.reply(txt);
}

export { pluginConfig as config, handler };
