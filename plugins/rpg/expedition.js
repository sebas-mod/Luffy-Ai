import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "expedition",
  alias: ["ekspedisi", "exp", "explore"],
  category: "rpg",
  description: "Enviar expedición automática para obtener objetos",
  usage: ".expedition <start/claim/status>",
  example: ".expedition start forest",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

const EXPEDITIONS = {
  forest: { name: "🌲 Hutan Laba-laba", duration: 1800000, rewards: ["wood", "herb", "mushroom"], exp: 100, minLevel: 1 },
  cave: { name: "🏔️ Gua Kelelawar", duration: 3600000, rewards: ["iron", "gold", "gem"], exp: 200, minLevel: 5 },
  volcano: { name: "🌋 Gunung Naga", duration: 7200000, rewards: ["lava", "dragonscale", "titancore"], exp: 400, minLevel: 15 },
  ocean: { name: "🌊 Samudra Kraken", duration: 5400000, rewards: ["fish", "pearl", "seagem"], exp: 300, minLevel: 10 },
  ruins: { name: "🏛️ Reruntuhan Kuno", duration: 10800000, rewards: ["ancientcoin", "relic", "mysterybox"], exp: 600, minLevel: 20 },
};

function formatTime(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.inventory) user.inventory = {};
  if (!user.rpg) user.rpg = {};
  if (!user.rpg.expeditions) user.rpg.expeditions = [];

  const args = m.args || [];
  const action = args[0]?.toLowerCase();
  const expType = args[1]?.toLowerCase();

  const maxExpeditions = Math.min(5, 1 + Math.floor((user.level || 1) / 10));

  if (!action || !["start", "claim", "status", "list"].includes(action)) {
    let txt = `🗺️ *MARKAS EKSPEDISI* 🗺️\n\n`;
    txt += `¡Envía una expedición a buscar tesoros mientras descansas!\n\n`;
    txt += `*Lista de Comandos:*\n`;
    txt += `📜 \`${m.prefix}expedition list\` (Ver Zonas)\n`;
    txt += `🚀 \`${m.prefix}expedition start <zona>\` (Iniciar Expedición)\n`;
    txt += `⏳ \`${m.prefix}expedition status\` (Ver Temporizador)\n`;
    txt += `💰 \`${m.prefix}expedition claim\` (Cobrar Recompensas)\n\n`;
    txt += `📊 Capacidad de Expedición: *${user.rpg.expeditions.length}/${maxExpeditions} Grupo(s)*`;
    return m.reply(txt);
  }

  if (action === "list") {
    let txt = `📜 *MAPA DE EXPLORACIÓN* 📜\n\n`;

    for (const [key, exp] of Object.entries(EXPEDITIONS)) {
      const canGo = (user.level || 1) >= exp.minLevel;
      txt += `📍 ${exp.name} ${canGo ? "🔓" : "🔒"}\n`;
      txt += `   ├ ⏳ Tiempo: ${formatTime(exp.duration)}\n`;
      txt += `   ├ 🎁 Botín Potencial: ${exp.rewards.join(", ")}\n`;
      txt += `   ├ 📈 EXP: ${exp.exp} (Min Lv. ${exp.minLevel})\n`;
      txt += `   └ 🚀 Código de Zona: \`${key}\`\n\n`;
    }
    return m.reply(txt);
  }

  if (action === "start") {
    if (user.rpg.expeditions.length >= maxExpeditions) {
      return m.reply(`¡Oh no, tu capacidad de expedición está llena! (${user.rpg.expeditions.length}/${maxExpeditions})\n¡Espera a que los demás regresen primero!`);
    }

    if (!expType) {
      return m.reply(`¡Elige la zona de destino de la expedición!\nEjemplo: \`${m.prefix}expedition start forest\``);
    }

    const exp = EXPEDITIONS[expType];
    if (!exp) {
      return m.reply(`Lo siento, ¡la zona *${expType}* no existe en el mapa!`);
    }

    if ((user.level || 1) < exp.minLevel) {
      return m.reply(`¡Ay, tu nivel es insuficiente! Necesitas *Nivel ${exp.minLevel}* para esa expedición!`);
    }

    user.rpg.expeditions.push({
      type: expType,
      startedAt: Date.now(),
      duration: exp.duration,
    });
    db.save();

    let txt = `🚀 *EKSPEDISI DIBERANGKATKAN!* 🚀\n\n`;
    txt += `¡Tu grupo de expedición ya partió hacia el destino!\n`;
    txt += `📍 Tujuan: *${exp.name}*\n`;
    txt += `⏱️ Estimasi Waktu: *${formatTime(exp.duration)}*\n\n`;
    txt += `> ¡Relájate y cuando termine, reclama tu botín con \`${m.prefix}expedition claim\`!`;

    return m.reply(txt);
  }

  if (action === "status") {
    if (user.rpg.expeditions.length === 0) {
      return m.reply(`No hay ninguna expedición en curso. ¡Envía una ahora! 🏕️`);
    }

    let txt = `⏳ *RADAR EKSPEDISI* ⏳\n\n`;

    for (let i = 0; i < user.rpg.expeditions.length; i++) {
      const exp = user.rpg.expeditions[i];
      const expInfo = EXPEDITIONS[exp.type];
      const elapsed = Date.now() - exp.startedAt;
      const remaining = Math.max(0, exp.duration - elapsed);
      const done = remaining <= 0;

      txt += `🗺️ *Grupo ${i + 1}* -> ${expInfo.name}\n`;
      txt += `   └ Estado: ${done ? "✅ ¡COMPLETADO! (Listo para cobrar)" : `🕒 Queda ${formatTime(remaining)}`}\n\n`;
    }
    return m.reply(txt);
  }

  if (action === "claim") {
    const completedExps = user.rpg.expeditions.filter((e) => {
      return Date.now() - e.startedAt >= e.duration;
    });

    if (completedExps.length === 0) {
      return m.reply(`No hay ninguna expedición completada. ¡Revisa con \`${m.prefix}expedition status\`!`);
    }

    let totalExp = 0;
    let allRewards = [];

    for (const exp of completedExps) {
      const expInfo = EXPEDITIONS[exp.type];
      totalExp += expInfo.exp;

      for (const rewardItem of expInfo.rewards) {
        if (Math.random() > 0.4) {
          const qty = Math.floor(Math.random() * 5) + 1;
          user.inventory[rewardItem] = (user.inventory[rewardItem] || 0) + qty;
          allRewards.push(`${rewardItem} x${qty}`);
        }
      }
    }

    user.rpg.expeditions = user.rpg.expeditions.filter((e) => {
      return Date.now() - e.startedAt < e.duration;
    });

    await addExpWithLevelCheck(sock, m, db, user, totalExp);
    db.save();

    await m.react("✅");

    let txt = `🎉 *EKSPEDISI SELESAI!* 🎉\n\n`;
    txt += `¡Los grupos regresaron con botín de *${completedExps.length} expediciones*!\n\n`;
    txt += `*🎁 HASIL PENCARIAN:*\n`;
    txt += `✨ EXP: *+${totalExp}*\n`;
    if (allRewards.length > 0) {
      txt += `📦 Items:\n`;
      for (const r of allRewards) {
        txt += `  • ${r}\n`;
      }
    } else {
      txt += `📦 Items: *Qué lástima, ¡esta vez no conseguiste nada...* 😭\n`;
    }

    return m.reply(txt);
  }
}

export { pluginConfig as config, handler };
