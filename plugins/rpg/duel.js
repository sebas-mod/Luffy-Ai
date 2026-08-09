import { getDatabase } from "../../src/lib/luffy-database.js";
import { addExpWithLevelCheck } from "../../src/lib/luffy-level.js";
import { sendRpgPreview } from "../../src/lib/luffy-context.js";

const pluginConfig = {
  name: "duel",
  alias: ["pvp", "fight"],
  category: "rpg",
  description: "Duel PvP dengan player lain",
  usage: ".duel @user <bet>",
  example: ".duel @user 5000",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 120,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];

  const target = m.mentionedJid?.[0] || m.quoted?.sender;
  const bet = parseInt(args[1]) || 1000;

  if (!target) {
    let txt = `⚔️ *DUELO DE APUESTAS* ⚔️\n\n`;
    txt += `¡Desafía a tu amigo a un duelo con apuesta de dinero bro!\n\n`;
    txt += `*Cómo Desafiar:*\n`;
    txt += `👉 \`.duel @user 5000\`\n`;
    txt += `_(Significa que lo invitas a un duelo con una apuesta de Rp 5.000)_`;
    return m.reply(txt);
  }

  if (target === m.sender) {
    return m.reply(`Jejeje bro, ¿en serio quieres pelear contra el espejo? ¡Etiqueta a otro amigo! 😂`);
  }

  if (bet < 1000) {
    return m.reply(`¡La apuesta es muy pequeña bro! La apuesta mínima para un duelo es *Rp 1.000*! 💸`);
  }

  const player1 = db.getUser(m.sender);
  const player2 = db.getUser(target) || db.setUser(target);

  if ((player1.berry || 0) < bet) {
    return m.reply(`¡Uy bro, tu saldo no alcanza para apostar eso!\nTus berry actuales: *Rp ${(player1.berry || 0).toLocaleString("id-ID")}*`);
  }

  if ((player2.berry || 0) < bet) {
    return m.reply(`Vaya bro, parece que el saldo de tu rival no alcanza para aceptar esta apuesta. ¡Busca otro rival o baja la apuesta!`);
  }

  if (!player1.rpg) player1.rpg = {};
  if (!player2.rpg) player2.rpg = {};

  player1.rpg.health = player1.rpg.health || 100;
  player2.rpg.health = player2.rpg.health || 100;

  if (player1.rpg.health < 30) {
    return m.reply(`¡Espera bro! Tu sangre está casi al límite (*${player1.rpg.health} HP*). Debes tener al menos *30 HP* para participar en el duelo. ¡Descansa un poco! 💉`);
  }

  await sendRpgPreview(sock, m.chat, `⚔️ *¡DUELO INICIADO!* ⚔️\n\n@${m.sender.split("@")[0]} desafía con valentía a @${target.split("@")[0]}!\n💰 Apuesta Total en el Centro: *Rp ${(bet * 2).toLocaleString("id-ID")}*`, "⚔️ ARENA DE DUELO", "¡A Pelear!", { quoted: m });

  await new Promise((r) => setTimeout(r, 2000));

  const p1Power = (player1.rpg.level || 1) * 10 + Math.random() * 50;
  const p2Power = (player2.rpg.level || 1) * 10 + Math.random() * 50;

  const winner = p1Power > p2Power ? m.sender : target;
  const loser = winner === m.sender ? target : m.sender;
  const winnerData = winner === m.sender ? player1 : player2;
  const loserData = winner === m.sender ? player2 : player1;

  winnerData.berry = (winnerData.berry || 0) + bet;
  loserData.berry = (loserData.berry || 0) - bet;
  loserData.rpg.health = Math.max(0, (loserData.rpg.health || 100) - 20);

  const expGain = 500;
  await addExpWithLevelCheck(sock, { ...m, sender: winner }, db, winnerData, expGain);

  db.save();

  let txt = `⚔️ *RESULTADO DEL DUELO SANGRIENTO* ⚔️\n\n`;
  txt += `🏆 *Ganador:* @${winner.split("@")[0]}\n`;
  txt += `💀 *Perdedor:* @${loser.split("@")[0]} (Se retira herido de gravedad)\n\n`;
  txt += `🎁 *El Ganador Se Lleva a Casa:*\n`;
  txt += `> 💰 Apuesta del Rival: *+Rp ${bet.toLocaleString("id-ID")}*\n`;
  txt += `> ✨ Bonus EXP de Combate: *+${expGain} EXP*`;

  await sendRpgPreview(sock, m.chat, txt, "⚔️ ARENA DE DUELO", "¡Resultado del Duelo!", { quoted: m });
}

export { pluginConfig as config, handler };
