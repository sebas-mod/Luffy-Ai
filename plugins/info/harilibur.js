import axios from "axios";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "harilibur",
  alias: ["libur", "harinasional"],
  category: "info",
  description: "Mostrar información de días festivos y días nacionales próximos",
  usage: ".harilibur",
  example: ".harilibur",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  await m.react("🕕");

  try {
    const res = await axios.get("https://api.nexray.eu.cc/information/hari-libur", {
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const data = res.data;
    if (!data.status || !data.result) {
      await m.react("❌");
      return m.reply("⚠️ ¡No se pudo obtener la información de días festivos!");
    }

    const r = data.result;
    let caption = `📅 *DÍAS FESTIVOS Y NACIONALES PRÓXIMOS* 📅\n\n`;

    if (r.mendatang.hari_libur && r.mendatang.hari_libur.length > 0) {
      caption += `*Próximos Días Festivos*\n`;
      r.mendatang.hari_libur.slice(0, 5).forEach(item => {
        caption += `- ${item.date}: ${item.event} (${item.daysUntil} días más)\n`;
      });
      caption += `\n`;
    }

    if (r.mendatang.event_nasional && r.mendatang.event_nasional.length > 0) {
      caption += `*Próximos Días Nacionales*\n`;
      r.mendatang.event_nasional.slice(0, 5).forEach(item => {
        caption += `- ${item.date}: ${item.event} (${item.daysUntil} días más)\n`;
      });
    }

    await m.reply(caption.trim());
    await m.react("✅");

  } catch (error) {
    console.error("[Días Festivos]", error.message);
    await m.react("☢");
    m.reply("😔 Ocurrió un error al obtener los datos de días festivos.");
  }
}

export { pluginConfig as config, handler };
