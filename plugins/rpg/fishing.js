import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "fishing",
  alias: ["rpgfish", "mancing"],
  category: "rpg",
  description: "Pesca para obtener peces (RPG)",
  usage: ".fishing",
  example: ".fishing",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  carne: 1,
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
    return m.reply(`Uy bro, ¡tu resistencia se agotó! 😭⚡\n\nPara pescar necesitas *${staminaCost} de Resistencia*, solo te quedan *${user.rpg.stamina}*.\n¡Descansa un poco para recuperarte! 🛌💤`);
  }

  user.rpg.stamina -= staminaCost;

  await m.react("🎣");
  await m.reply(`Lanzando el anzuelo al agua tranquila... 🌊🎣\nShhh, no hagas ruido para que el pez muerda el cebo! 🤫👀`);
  await new Promise((r) => setTimeout(r, 4000));

  const drops = [
    { item: "trash", chance: 20, name: "🗑️ Basura", exp: 10 },
    { item: "fish", chance: 50, name: "🐟 Pescado", exp: 100 },
    { item: "prawn", chance: 30, name: "🦐 Camarón", exp: 150 },
    { item: "octopus", chance: 15, name: "🐙 Pulpo", exp: 300 },
    { item: "shark", chance: 5, name: "🦈 Tiburón", exp: 800 },
    { item: "whale", chance: 1, name: "🐳 Ballena", exp: 2000 },
  ];

  const rand = Math.random() * 100;
  let caught = drops[0];

  for (const drop of drops.sort((a, b) => a.chance - b.chance)) {
    if (rand <= drop.chance) {
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

  let txt = `¡HAPPP! ¡El hilo fue jalado! 🎣💦\n\nVaya, lograste conseguir:\n`;
  if (caught.item === "trash") {
    txt += `> ${caught.name} 🤢\nUy, te tocó basura bro... Bueno, al menos ganaste *+${expReward} EXP* por tirar la basura en su lugar! 😂\n\n`;
  } else {
    txt += `> *${caught.name}* 🎉✨\n¡Qué genial! También ganaste *+${expReward} EXP*!\n\n`;
  }
  
  txt += `⚡ Resistencia usada: *-${staminaCost}*\n`;
  txt += `\nEl pez/basura ya está en tu bolsa (\`.inv\`)! No olvides pescar más tarde! 💖🌊`;

  await m.reply(txt);
}

export { pluginConfig as config, handler };
