import { getDatabase } from "../../src/lib/luffy-database.js";
const pluginConfig = {
  name: "topchat",
  alias: ["chatstat", "chatstats", "totalchat"],
  category: "group",
  description: "Ver las estadísticas de chat de los miembros del grupo",
  usage: ".topchat",
  example: ".topchat",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const group = db.getGroup(m.chat) || {};
  const chatStats = group.chatStats || {};
  const sorted = Object.entries(chatStats)
    .map(([jid, data]) => ({
      jid,
      count: data.count || 0,
      lastChat: data.lastChat || 0,
    }))
    .sort((a, b) => b.count - a.count);
  if (sorted.length === 0) {
    return m.reply(
      `📊 *ᴇsᴛᴀᴅísᴛɪᴄᴀs ᴅᴇ ᴄʜᴀᴛ*\n\n` +
      `> Todavía no hay datos de chat en este grupo.\n` +
      `> Los datos se registrarán automáticamente cuando los miembros chateen.`,
    );
  }
  let txt = `📊 *TOTAL DE CHAT*\nA continuación se muestra la cantidad de mensajes enviados por los miembros de este grupo:\n\n`;
  for (let i = 0; i < sorted.length; i++) {
    const { jid, count } = sorted[i];
    const name = group.chatStats[jid]?.name || jid.split("@")[0];
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "▸";
    txt += `${medal} @${jid.split("@")[0]} — *${count.toLocaleString("id-ID")}* mensajes\n`;
  }
  txt += `\n*Total de Mensajes: ${sorted.reduce((a, b) => a + b.count, 0).toLocaleString("id-ID")}*`;
  const mentions = sorted.map((u) => u.jid);
  await m.reply(txt, { mentions });
}
function incrementChatCount(chatId, senderJid, db, pushName) {
  if (!chatId || !senderJid) return;
  const group = db.getGroup(chatId) || {};
  if (!group.chatStats) group.chatStats = {};
  if (!group.chatStats[senderJid]) {
    group.chatStats[senderJid] = {
      count: 0,
      lastChat: 0,
      name: pushName || null,
    };
  }

  group.chatStats[senderJid].count++;
  group.chatStats[senderJid].lastChat = Date.now();
  if (pushName) group.chatStats[senderJid].name = pushName;

  db.setGroup(chatId, group);
}

export { pluginConfig as config, handler, incrementChatCount };
