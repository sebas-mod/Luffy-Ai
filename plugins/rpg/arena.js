import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";

const pluginConfig = {
  name: "arena",
  alias: ["pvp", "battle", "fight"],
  category: "rpg",
  description: "Luchar en la arena PvP",
  usage: ".arena <@user>",
  example: ".arena @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 180,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  const mentioned = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!mentioned) {
    let txt = `⚔️ *ARENA GLADIATOR* ⚔️\n\n`;
    txt += `¡Invita a tu amigo a un duelo en la arena!\n\n`;
    txt += `*Cómo Desafiar:*\n`;
    txt += `🗡️ \`${m.prefix}arena @user\`\n`;
    txt += `🗡️ O responde a su mensaje con \`${m.prefix}arena\`\n\n`;
    txt += `> _⚠️ ¡Ten cuidado, si pierdes perderás el 20% de tus monedas!_`;
    return m.reply(txt);
  }

  if (mentioned === m.sender) {
    return m.reply(`¡Ay, ¿vas a pegarte a ti mismo? ¡Busca a otro oponente! 😂`);
  }

  const opponent = db.getUser(mentioned);
  if (!opponent) {
    return m.reply(`¡El oponente que etiquetaste no está registrado en la base de datos!`);
  }

  if (!opponent.rpg) opponent.rpg = {};

  const myHealth = user.rpg.health || 100;
  const myAttack = (user.rpg.attack || 10) + (user.level || 1) * 2;
  const myDefense = (user.rpg.defense || 5) + (user.level || 1);

  const oppHealth = opponent.rpg.health || 100;
  const oppAttack = (opponent.rpg.attack || 10) + (opponent.level || 1) * 2;
  const oppDefense = (opponent.rpg.defense || 5) + (opponent.level || 1);

  await m.react("⚔️");
  await m.reply(`⚔️ *¡¡COMIENZA LA PELEA!!* ⚔️\n\n@${m.sender.split("@")[0]} carga contra @${mentioned.split("@")[0]}!\n¡Buena suerte! 🔥`, { mentions: [m.sender, mentioned] });
  await new Promise((r) => setTimeout(r, 2000));

  let myHp = myHealth;
  let oppHp = oppHealth;
  let round = 0;
  let battleLog = [];

  while (myHp > 0 && oppHp > 0 && round < 10) {
    round++;

    const myDmg = Math.max(5, myAttack - oppDefense + Math.floor(Math.random() * 10));
    oppHp -= myDmg;
    battleLog.push(`🔥 ¡Lanzas un ataque potente: *-${myDmg} HP*`);

    if (oppHp <= 0) break;

    const oppDmg = Math.max(5, oppAttack - myDefense + Math.floor(Math.random() * 10));
    myHp -= oppDmg;
    battleLog.push(`💢 El oponente contraataca con fuerza: *-${oppDmg} HP*`);
  }

  const isWin = myHp > oppHp;

  let txt = `⚔️ *RESULTADO DE LA BATALLA* ⚔️\n\n`;
  txt += `*📊 Estado Final:*\n`;
  txt += `🧑 Tú: *${Math.max(0, myHp)}/${myHealth} HP*\n`;
  txt += `👤 Oponente: *${Math.max(0, oppHp)}/${oppHealth} HP*\n`;
  txt += `🔄 Duración: *${round} Ronda(s)*\n\n`;

  txt += `📜 *Resumen de la Batalla:*\n`;
  txt += battleLog
    .slice(-6)
    .map((l) => `> ${l}`)
    .join("\n");
  txt += `\n\n`;

  if (isWin) {
    const expReward = 300 + (opponent.level || 1) * 50;
    const goldReward = Math.floor((opponent.belly || 0) * 0.1);

    user.belly = (user.belly || 0) + goldReward;
    opponent.belly = Math.max(0, (opponent.belly || 0) - goldReward);

    await addExpWithLevelCheck(sock, m, db, user, expReward);

    txt += `🏆 *¡¡VICTORIA LOGRADA!!* 🎉\n`;
    txt += `¡Increíble! Aquí están tus recompensas:\n`;
    txt += `✨ EXP: *+${expReward}*\n`;
    txt += `💰 Belly Botín: *+Belly ${goldReward.toLocaleString()}*`;

    await m.react("🏆");
  } else {
    const goldLoss = Math.floor((user.belly || 0) * 0.2);
    user.belly = Math.max(0, (user.belly || 0) - goldLoss);

    txt += `💀 *LÁSTIMA, PERDISTE...* 💔\n`;
    txt += `¡No te pongas triste, la próxima vez será!\n`;
    txt += `💸 Belly Perdido: *-Belly ${goldLoss.toLocaleString()}*`;

    await m.react("💀");
  }

  db.setUser(m.sender, user);
  db.setUser(mentioned, opponent);
  db.save();

  return m.reply(txt, { mentions: [m.sender, mentioned] });
}

export { pluginConfig as config, handler };
