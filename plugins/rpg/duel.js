import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";
import { sendRpgPreview } from "../../src/lib/ourin-context.js";

const pluginConfig = {
  name: "duel",
  alias: ["pvp", "fight"],
  category: "rpg",
  description: "Duelo PvP con otro jugador",
  usage: ".duel @user <bet>",
  example: ".duel @user 5000",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 120,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];

  const target = m.mentionedJid?.[0] || m.quoted?.sender;
  const bet = parseInt(args[1]) || 1000;

  if (!target) {
    let txt = `⚔️ *DUEL TARUHAN* ⚔️\n\n`;
    txt += `¡Desafía a tu amigo a un duelo por dinero!\n\n`;
    txt += `*Cómo Desafiar:*\n`;
    txt += `👉 \`.duel @user 5000\`\n`;
    txt += `_(Significa que lo retas a un duelo con apuesta de Rp 5.000)_`;
    return m.reply(txt);
  }

  if (target === m.sender) {
    return m.reply(`Jajajaja, ¿vas a pelearte con tu espejo? ¡Busca a otro amigo! 😂`);
  }

  if (bet < 1000) {
    return m.reply(`¡Vaya, la apuesta es demasiado baja! ¡La mínima es *Rp 1.000*! 💸`);
  }

  const player1 = db.getUser(m.sender);
  const player2 = db.getUser(target) || db.setUser(target);

  if ((player1.koin || 0) < bet) {
    return m.reply(`¡Ay, tu saldo no alcanza para esa apuesta!\nTus monedas: *Rp ${(player1.koin || 0).toLocaleString("id-ID")}*`);
  }

  if ((player2.koin || 0) < bet) {
    return m.reply(`Vaya, parece que el oponente no tiene suficiente dinero para la apuesta. ¡Busca otro o reduce la apuesta!`);
  }

  if (!player1.rpg) player1.rpg = {};
  if (!player2.rpg) player2.rpg = {};

  player1.rpg.health = player1.rpg.health || 100;
  player2.rpg.health = player2.rpg.health || 100;

  if (player1.rpg.health < 30) {
    return m.reply(`¡Espera! Tu salud es muy baja (*${player1.rpg.health} HP*). Necesitas mínimo *30 HP* para el duelo. ¡Descansa primero! 💉`);
  }

  await sendRpgPreview(sock, m.chat, `⚔️ *¡¡DUELO COMIENZA!!* ⚔️\n\n@${m.sender.split("@")[0]} desafía valientemente a @${target.split["@")[0]}!\n💰 Total de Apuestas: *Rp ${(bet * 2).toLocaleString("id-ID")}*`, "⚔️ ARENA DE DUELO", "¡A pelear!", { quoted: m });

  await new Promise((r) => setTimeout(r, 2000));

  const p1Power = (player1.rpg.level || 1) * 10 + Math.random() * 50;
  const p2Power = (player2.rpg.level || 1) * 10 + Math.random() * 50;

  const winner = p1Power > p2Power ? m.sender : target;
  const loser = winner === m.sender ? target : m.sender;
  const winnerData = winner === m.sender ? player1 : player2;
  const loserData = winner === m.sender ? player2 : player1;

  winnerData.koin = (winnerData.koin || 0) + bet;
  loserData.koin = (loserData.koin || 0) - bet;
  loserData.rpg.health = Math.max(0, (loserData.rpg.health || 100) - 20);

  const expGain = 500;
  await addExpWithLevelCheck(sock, { ...m, sender: winner }, db, winnerData, expGain);

  db.save();

  let txt = `⚔️ *RESULTADO DEL DUELO SANGRIENTO* ⚔️\n\n`;
  txt += `🏆 *Ganador:* @${winner.split("@")[0]}\n`;
  txt += `💀 *Perdedor:* @${loser.split["@")[0]} (Retira con heridas graves)\n\n`;
  txt += `🎁 *El Ganador Se Lleva:*\n`;
  txt += `> 💰 Apuesta del Oponente: *+Rp ${bet.toLocaleString("id-ID")}*\n`;
  txt += `> ✨ Bonus EXP de Batalla: *+${expGain} EXP*`;

  await sendRpgPreview(sock, m.chat, txt, "⚔️ ARENA DUEL", "Hasil Duel!", { quoted: m });
}

export { pluginConfig as config, handler };
