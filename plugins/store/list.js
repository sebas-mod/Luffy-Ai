import { getDatabase } from "../../src/lib/luffy-database.js";
import config from "../../config.js";

const pluginConfig = {
  name: "list",
  alias: ["liststore", "info"],
  category: "store",
  description: "📋 Ver la lista de información de la tienda",
  usage: ".list o .list <numero>",
  example: ".list 1",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const lists = db.setting("storeLists") || [];

  if (lists.length === 0) {
    return m.reply(
      `📋 *Aún No Hay Información de la Tienda*\n\n` +
        `Actualmente no hay información agregada por el admin 😔\n\n` +
        `Vuelve a revisar más tarde o contacta al admin para más información.\n\n` +
        `_Gracias por tu interés_ 🙏`,
    );
  }

  const input = m.text?.trim();
  const idx = parseInt(input) - 1;

  if (!isNaN(idx) && idx >= 0 && idx < lists.length) {
    const l = lists[idx];
    let txt = `${l.content}`;

    if (l.image) {
      await sock.sendMessage(
        m.chat,
        { image: { url: l.image }, caption: txt },
        { quoted: m },
      );
      return;
    }
    if (l.video) {
      await sock.sendMessage(
        m.chat,
        { video: { url: l.video }, caption: txt },
        { quoted: m },
      );
      return;
    }
    return m.reply(txt);
  }

  let txt = `📋 *LISTA DE INFORMACIÓN DE LA TIENDA*\n\n`;
  txt += `A continuación la información disponible actualmente 📝\n`;
  txt += `Escribe \`${m.prefix}list <numero>\` para ver el detalle.\n\n`;

  for (let i = 0; i < lists.length; i++) {
    const l = lists[i];
    const mediaIcon = l.image ? "🖼️" : l.video ? "🎬" : "📝";
    txt += `*${i + 1}.* ${mediaIcon} *${l.name}*\n`;
  }
  txt += "\n";

  txt += `💡 _Escribe \`${m.prefix}list <numero>\` para leer el detalle de la información_`;

  await m.reply(txt);
}

export { pluginConfig as config, handler };
