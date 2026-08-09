import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "steal",
  alias: ["mencuri", "curi", "pickpocket"],
  category: "rpg",
  description: "Mencuri dari NPC untuk gold",
  usage: ".steal",
  example: ".steal",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 300,
  carne: 2,
  isEnabled: true,
};

const TARGETS = [
  { name: "👨‍🌾 Campesino Distraído", difficulty: 1, minGold: 50, maxGold: 150, catchChance: 10 },
  { name: "👨‍💼 Vendedor Ambulante", difficulty: 2, minGold: 100, maxGold: 300, catchChance: 20 },
  { name: "🧙‍♂️ Viejo Hechicero", difficulty: 3, minGold: 200, maxGold: 500, catchChance: 30 },
  { name: "⚔️ Caballero del Reino", difficulty: 4, minGold: 300, maxGold: 800, catchChance: 40 },
  { name: "👑 Noble Arrogante", difficulty: 5, minGold: 500, maxGold: 1500, catchChance: 50 },
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
    return m.reply(`Vaya... ¿ladrón y tan cansado? 😴\nNecesitas *${staminaCost} de Resistencia* para colarte, solo tienes *${user.rpg.stamina}*. ¡Descansa!`);
  }

  user.rpg.stamina -= staminaCost;

  const userLevel = user.level || 1;
  const availableTargets = TARGETS.filter((t) => userLevel >= t.difficulty * 3);

  if (availableTargets.length === 0) {
    db.save();
    return m.reply(`Tu nivel es muy bajo (Nivel ${userLevel}). Hasta el objetivo más fácil necesita *Nivel 3* para que no mueras de forma ridícula! 😂`);
  }

  const target = availableTargets[Math.floor(Math.random() * availableTargets.length)];

  await m.react("🥷");
  await m.reply(`*Escabulléndose...* Escalando la pared de la casa de *${target.name}*... 🥷⚔️`);
  await new Promise((r) => setTimeout(r, 2500));

  const luckBonus = (user.rpg.luck || 5) * 2;
  const adjustedCatchChance = Math.max(5, target.catchChance - luckBonus);
  const isCaught = Math.random() * 100 < adjustedCatchChance;

  if (isCaught) {
    const goldLoss = Math.floor((user.berry || 0) * 0.1);
    const healthLoss = 10 + target.difficulty * 5;

    user.berry = Math.max(0, (user.berry || 0) - goldLoss);
    user.rpg.health = Math.max(1, (user.rpg.health || 100) - healthLoss);

    db.save();

    await m.react("💀");
    return m.reply(
      `¡¡MALDITOOO!! ¡TROPECÉ CON UNA MACETA!! 💥🚨\n\n` +
        `¡*${target.name}* se despertó al instante y te golpeó sin piedad!\n\n` +
        `*Pérdidas:* \n` +
        `💸 Dinero regado: *-Rp ${goldLoss.toLocaleString()}*\n` +
        `❤️ Golpes Recibidos: *-${healthLoss} HP*\n` +
        `⚡ Resistencia para huir: *-${staminaCost}*\n\n` +
        `*Consejo:* ¡Sube la estadística de *Suerte* para que tus pasos no suenen bro!`
    );
  }

  const goldStolen = Math.floor(Math.random() * (target.maxGold - target.minGold)) + target.minGold;
  const expReward = 50 + target.difficulty * 30;

  user.berry = (user.berry || 0) + goldStolen;
  await addExpWithLevelCheck(sock, m, db, user, expReward);

  const bonusItem = Math.random() > 0.7;
  let bonusText = "";
  if (bonusItem) {
    const items = ["potion", "key", "gem", "ring"];
    const item = items[Math.floor(Math.random() * items.length)];
    user.inventory[item] = (user.inventory[item] || 0) + 1;
    bonusText = `\n📦 Botín Extra: *${item} x1*`;
  }

  db.save();

  await m.react("💰");
  return m.reply(
    `¡ATAQUE NINJA EXITOSO! 🥷✨\n\n` +
      `¡Lograste saquear la casa de *${target.name}* sin que nadie se diera cuenta!\n\n` +
      `*Botín Robado:* \n` +
      `💵 Lingotes de Oro: *+Rp ${goldStolen.toLocaleString()}*\n` +
      `✨ EXP por Colarte: *+${expReward}*` +
      `${bonusText}\n` +
      `⚡ Resistencia: *-${staminaCost}*`
  );
}

export { pluginConfig as config, handler };
