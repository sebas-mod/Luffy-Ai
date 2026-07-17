import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "steal",
  alias: ["mencuri", "curi", "pickpocket"],
  category: "rpg",
  description: "Robar a NPCs para obtener oro",
  usage: ".steal",
  example: ".steal",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 300,
  energi: 2,
  isEnabled: true,
};

const TARGETS = [
  { name: "👨‍🌾 Campesino Descuidado", difficulty: 1, minGold: 50, maxGold: 150, catchChance: 10 },
  { name: "👨‍💼 Vendedor Ambulante", difficulty: 2, minGold: 100, maxGold: 300, catchChance: 20 },
  { name: "🧙‍♂️ Viejo Hechicero", difficulty: 3, minGold: 200, maxGold: 500, catchChance: 30 },
  { name: "⚔️ Caballero Real", difficulty: 4, minGold: 300, maxGold: 800, catchChance: 40 },
  { name: "👑 Noble Soberbio", difficulty: 5, minGold: 500, maxGold: 1500, catchChance: 50 },
  { name: "🏰 Rey Tirano", difficulty: 6, minGold: 1000, maxGold: 3000, catchChance: 60 },
];

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  const staminaCost = 15;
  user.rpg.stamina = user.rpg.stamina ?? 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`Vaya... ¿ser ladrón y estar débil? 😴\nNecesitas *${staminaCost} Stamina* para infiltrarte, solo tienes *${user.rpg.stamina}*. ¡Descansa!`);
  }

  user.rpg.stamina -= staminaCost;

  const userLevel = user.level || 1;
  const availableTargets = TARGETS.filter((t) => userLevel >= t.difficulty * 3);

  if (availableTargets.length === 0) {
    db.save();
    return m.reply(`Tu nivel es muy bajo (Nivel ${userLevel}). ¡Al objetivo más fácil le necesitas *Nivel 3* para que no te maten! 😂`);
  }

  const target = availableTargets[Math.floor(Math.random() * availableTargets.length)];

  await m.react("🥷");
  await m.reply(`*Avanzando sigilosamente...* Escalando la pared de la casa de *${target.name}*... 🥷⚔️`);
  await new Promise((r) => setTimeout(r, 2500));

  const luckBonus = (user.rpg.luck || 5) * 2;
  const adjustedCatchChance = Math.max(5, target.catchChance - luckBonus);
  const isCaught = Math.random() * 100 < adjustedCatchChance;

  if (isCaught) {
    const goldLoss = Math.floor((user.belly || 0) * 0.1);
    const healthLoss = 10 + target.difficulty * 5;

    user.belly = Math.max(0, (user.belly || 0) - goldLoss);
    user.rpg.health = Math.max(1, (user.rpg.health || 100) - healthLoss);

    db.save();

    await m.react("💀");
    return m.reply(
      `¡¡FALLASTE!! ¡TE ESTRELLASTE CON UNA MACETA!! 💥🚨\n\n` +
        `¡El *${target.name}* despierta y te golpea sin piedad!\n\n` +
        `*Pérdidas:* \n` +
        `💸 Dinero dispersado: *-Belly ${goldLoss.toLocaleString()}*\n` +
        `❤️ Golpeado: *-${healthLoss} HP*\n` +
        `⚡ Stamina para huir: *-${staminaCost}*\n\n` +
        `*Consejo:* ¡Aumenta tu estadística *Suerte* para que tus pasos no hagan ruido!`
    );
  }

  const goldStolen = Math.floor(Math.random() * (target.maxGold - target.minGold)) + target.minGold;
  const expReward = 50 + target.difficulty * 30;

  user.belly = (user.belly || 0) + goldStolen;
  await addExpWithLevelCheck(sock, m, db, user, expReward);

  const bonusItem = Math.random() > 0.7;
  let bonusText = "";
  if (bonusItem) {
    const items = ["potion", "key", "gem", "ring"];
    const item = items[Math.floor(Math.random() * items.length)];
    user.inventory[item] = (user.inventory[item] || 0) + 1;
    bonusText = `\n📦 Bonus Botín: *${item} x1*`;
  }

  db.save();

  await m.react("💰");
  return m.reply(
    `¡GOLPE NINJA EXITOSO! 🥷✨\n\n` +
      `¡Lograste saquear la casa de *${target.name}* sin ser descubierto!\n\n` +
      `*Botín Obtenido:* \n` +
      `💵 Barras de Oro: *+Belly ${goldStolen.toLocaleString()}*\n` +
      `✨ EXP Infiltración: *+${expReward}*` +
      `${bonusText}\n` +
      `⚡ Stamina: *-${staminaCost}*`
  );
}

export { pluginConfig as config, handler };
