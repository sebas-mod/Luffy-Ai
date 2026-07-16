import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";
const pluginConfig = {
  name: "enchant",
  alias: ["upgrade", "enhance", "tingkatkan"],
  category: "rpg",
  description: "Mejorar equipamiento con encantamiento",
  usage: ".enchant <item>",
  example: ".enchant sword",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 120,
  energi: 2,
  isEnabled: true,
};

const ENCHANTABLE = {
  sword: { name: "⚔️ Espada", stat: "attack", bonus: 5, cost: 500, successRate: 70 },
  shield: { name: "🛡️ Escudo", stat: "defense", bonus: 4, cost: 500, successRate: 70 },
  armor: { name: "🦺 Armadura", stat: "health", bonus: 20, cost: 800, successRate: 60 },
  helmet: { name: "⛑️ Casco", stat: "defense", bonus: 3, cost: 400, successRate: 75 },
  bow: { name: "🏹 Arco", stat: "attack", bonus: 4, cost: 450, successRate: 72 },
  goldsword: { name: "🗡️ Espada de Oro", stat: "attack", bonus: 10, cost: 2000, successRate: 50 },
  diamondarmor: { name: "💎 Armadura de Diamante", stat: "health", bonus: 50, cost: 5000, successRate: 40 },
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.inventory) user.inventory = {};
  if (!user.rpg) user.rpg = {};
  if (!user.rpg.enchants) user.rpg.enchants = {};

  const args = m.args || [];
  const itemName = args[0]?.toLowerCase();

  if (!itemName) {
    let txt = `✨ *ᴇɴᴄʜᴀɴᴛ - ᴜᴘɢʀᴀᴅᴇ ᴇǫᴜɪᴘ*\n\n`;
    txt += `> ¡Mejora tu equipo para obtener bonos de estadísticas!\n\n`;
    txt += `*📦 *ɪᴛᴇᴍ:*
\n`;

    for (const [key, item] of Object.entries(ENCHANTABLE)) {
      const currentLevel = user.rpg.enchants[key] || 0;
      txt += `> ${item.name}\n`;
      txt += `> 📊 Level: ${currentLevel}/10\n`;
      txt += `> 💪 Bonus: +${item.bonus} ${item.stat}\n`;
      txt += `> 💰 Cost: ${item.cost.toLocaleString()}\n`;
      txt += `> 🎯 Rate: ${item.successRate}%\n`;
      txt += `> → \`${key}\`\n> \n`;
    }
    txt += ``;

    return m.reply(txt);
  }

  const item = ENCHANTABLE[itemName];
  if (!item) {
    return m.reply(`❌ ¡Este objeto no se puede encantar!\n\n> Escribe \`${m.prefix}enchant\` para ver la lista.`);
  }

  if ((user.inventory[itemName] || 0) < 1) {
    return m.reply(`❌ ¡No tienes ${item.name}!`);
  }

  const currentLevel = user.rpg.enchants[itemName] || 0;
  if (currentLevel >= 10) {
    return m.reply(`❌ ¡${item.name} ya está en nivel MAX (10)!`);
  }

  const cost = item.cost * (currentLevel + 1);
  if ((user.koin || 0) < cost) {
    return m.reply(`❌ *ʙᴀʟᴀɴᴄᴇ ɪɴꜰᴜꜰiciente*\n\n` + `> Necesitas: ${cost.toLocaleString()}\n` + `> Balance: ${(user.koin || 0).toLocaleString()}`);
  }

  user.koin -= cost;

  await m.react("✨");
  await m.reply(`✨ *ᴇɴᴄʜᴀɴᴛɪɴɢ ${item.name.toUpperCase()}...*\n\n> Nivel ${currentLevel} → ${currentLevel + 1}`);
  await new Promise((r) => setTimeout(r, 2000));

  const adjustedRate = Math.max(20, item.successRate - currentLevel * 5);
  const isSuccess = Math.random() * 100 < adjustedRate;

  if (isSuccess) {
    user.rpg.enchants[itemName] = currentLevel + 1;
    user.rpg[item.stat] = (user.rpg[item.stat] || 0) + item.bonus;

    await addExpWithLevelCheck(sock, m, db, user, 150);
    db.save();

    await m.react("🎉");
    return m.reply(
      `🎉 *ᴇɴᴄʜᴀɴᴛ ʙᴇʀʜᴀsɪʟ!*\n\n` +
        `*✨ *ʀᴇsᴜʟᴛ:*
\n` +
        `> 📦 Item: *${item.name}*\n` +
        `> 📊 Nivel: *${currentLevel} → ${currentLevel + 1}*\n` +
        `> 💪 Bonus: *+${item.bonus} ${item.stat}*\n` +
        `> 💰 Cost: *-${cost.toLocaleString()}*\n` +
        `> ✨ EXP: *+150*\n` +
        ``,
    );
  } else {
    db.save();

    await m.react("💔");
    return m.reply(
      `💔 *ᴇɴᴄʜᴀɴᴛ ɢᴀɢᴀʟ!*\n\n` +
        `*😢 *ʀᴇsᴜʟᴛ:*
\n` +
        `> 📦 Item: *${item.name}*\n` +
        `> 📊 Nivel: *${currentLevel}* (no subió)\n` +
        `> 💰 Costo: *-${cost.toLocaleString()}* (perdido)\n` +
        `\n\n` +
        `💡 *Consejo:* ¡Inténtalo de nuevo! Probabilidad: ${adjustedRate}%`,
    );
  }
}

export { pluginConfig as config, handler };
