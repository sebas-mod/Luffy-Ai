import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";

const pluginConfig = {
  name: "arena",
  alias: ["pvp", "battle", "fight"],
  category: "rpg",
  description: "Pelear en la arena PvP",
  usage: ".arena <@user>",
  example: ".arena @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 180,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  const mentioned = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!mentioned) {
    let txt = `⚔️ *ARENA GLADIADOR* ⚔️\n\n`;
    txt += `¡Vamos, desafía a tu amigo a un duelo en la arena bro!\n\n`;
    txt += `*Cómo Desafiar:*\n`;
    txt += `🗡️ \`${m.prefix}arena @user\`\n`;
    txt += `🗡️ O responde a su mensaje con \`${m.prefix}arena\`\n\n`;
    txt += `> _⚠️ ¡Ten cuidado bro, si pierdes tus berry se reducirán un 20%!_`;
    return m.reply(txt);
  }

  if (mentioned === m.sender) {
    return m.reply(`Uy bro, ¿en serio quieres golpearte a ti mismo? ¡Busca otro rival! 😂`);
  }

  const opponent = db.getUser(mentioned);
  if (!opponent) {
    return m.reply(`¡El rival que etiquetaste aún no está registrado en nuestra base de datos bro!`);
  }

  if (!opponent.rpg) opponent.rpg = {};

  const myHealth = user.rpg.health || 100;
  const myAttack = (user.rpg.attack || 10) + (user.level || 1) * 2;
  const myDefense = (user.rpg.defense || 5) + (user.level || 1);

  const oppHealth = opponent.rpg.health || 100;
  const oppAttack = (opponent.rpg.attack || 10) + (opponent.level || 1) * 2;
  const oppDefense = (opponent.rpg.defense || 5) + (opponent.level || 1);

  await m.react("⚔️");
  await m.reply(`⚔️ *¡EL COMBATE HA COMENZADO!* ⚔️\n\n@${m.sender.split("@")[0]} se lanza contra @${mentioned.split("@")[0]}!\n¡Buena suerte bro! 🔥`, { mentions: [m.sender, mentioned] });
  await new Promise((r) => setTimeout(r, 2000));

  let myHp = myHealth;
  let oppHp = oppHealth;
  let round = 0;
  let battleLog = [];

  while (myHp > 0 && oppHp > 0 && round < 10) {
    round++;

    const myDmg = Math.max(5, myAttack - oppDefense + Math.floor(Math.random() * 10));
    oppHp -= myDmg;
    battleLog.push(`🔥 Lanzas un ataque poderoso: *-${myDmg} HP*`);

    if (oppHp <= 0) break;

    const oppDmg = Math.max(5, oppAttack - myDefense + Math.floor(Math.random() * 10));
    myHp -= oppDmg;
    battleLog.push(`💢 El rival responde con fuerza: *-${oppDmg} HP*`);
  }

  const isWin = myHp > oppHp;

  let txt = `⚔️ *RESULTADO DEL COMBATE* ⚔️\n\n`;
  txt += `*📊 Condición Final:*\n`;
  txt += `🧑 Tú: *${Math.max(0, myHp)}/${myHealth} HP*\n`;
  txt += `👤 Rival: *${Math.max(0, oppHp)}/${oppHealth} HP*\n`;
  txt += `🔄 Duración: *${round} Rondas*\n\n`;

  txt += `📜 *Resumen del Combate:*\n`;
  txt += battleLog
    .slice(-6)
    .map((l) => `> ${l}`)
    .join("\n");
  txt += `\n\n`;

  if (isWin) {
    const expReward = 300 + (opponent.level || 1) * 50;
    const goldReward = Math.floor((opponent.berry || 0) * 0.1);

    user.berry = (user.berry || 0) + goldReward;
    opponent.berry = Math.max(0, (opponent.berry || 0) - goldReward);

    await addExpWithLevelCheck(sock, m, db, user, expReward);

    txt += `🏆 *¡VICTORIA ALCANZADA!* 🎉\n`;
    txt += `¡Increíble bro! Esta es tu recompensa de la arena:\n`;
    txt += `✨ EXP: *+${expReward}*\n`;
    txt += `💰 Berry de Botín: *+Rp ${goldReward.toLocaleString()}*`;

    await m.react("🏆");
  } else {
    const goldLoss = Math.floor((user.berry || 0) * 0.2);
    user.berry = Math.max(0, (user.berry || 0) - goldLoss);

    txt += `💀 *LAMENTABLEMENTE, PERDISTE...* 💔\n`;
    txt += `No te pongas triste bro, ¡inténtalo de nuevo!\n`;
    txt += `💸 Berry Perdidos: *-Rp ${goldLoss.toLocaleString()}*`;

    await m.react("💀");
  }

  db.setUser(m.sender, user);
  db.setUser(mentioned, opponent);
  db.save();

  return m.reply(txt, { mentions: [m.sender, mentioned] });
}

export { pluginConfig as config, handler };
