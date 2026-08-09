import te from "../../src/lib/luffy-error.js";
import config from "../../config.js";
import axios from "axios";

const pluginConfig = {
  name: "carigrup",
  alias: ["searchgrup", "findgrup", "grupwa"],
  category: "search",
  description: "Buscar grupos de WhatsApp por palabra clave",
  usage: ".carigrup <keyword>",
  example: ".carigrup gb isian",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ");

  if (!text) {
    return m.reply(
      `🔍 *ʙᴜsǫᴜᴇᴅᴀ ᴅᴇ ɢʀᴜᴘᴏs*\n\n> Ingresa una palabra clave de búsqueda\n\n\`Ejemplo: ${m.prefix}carigrup gb isian\``,
    );
  }

  m.react("🕕");

  try {
    const url = `https://api.cuki.biz.id/api/search/whatsapp-group?apikey=${config.APIkey.cuki}&query=${encodeURIComponent(text)}`;
    const { data } = await axios.get(url, { timeout: 30000 });

    if (!data.status || !data.data?.groups?.length) {
      m.react("❌");
      return m.reply(`❌ No se encontraron grupos para la palabra clave *${text}*`);
    }

    const groups = data.data.groups;
    let result =
      `🔍 *ʙᴜsǫᴜᴇᴅᴀ ᴅᴇ ɢʀᴜᴘᴏs*\n\n` +
      `📌 Palabra clave: *${data.data.query}*\n` +
      `📊 Total: *${data.data.total}* grupos encontrados\n`;

    groups.forEach((g, i) => {
      result +=
        `\n━━━━━━━━━━━━━━━\n` +
        `*${i + 1}. ${g.title}*\n` +
        `📅 ${g.date}\n` +
        `🏷️ ${g.category}\n` +
        `📝 ${g.description ? g.description.slice(0, 150) + (g.description.length > 150 ? "..." : "") : "-"}\n` +
        `🔗 ${g.group_link}`;
    });

    m.react("✅");
    await m.reply(result);
  } catch (error) {
    console.log(error);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
