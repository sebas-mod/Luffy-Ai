import te from "../../src/lib/luffy-error.js";
import { card, fail, usage } from "../../src/lib/luffy-dl-ui.js";

const pluginConfig = {
  name: "shopeedl",
  alias: ["shopeevideo", "shopeevid"],
  category: "download",
  description: "Descarga videos de Shopee",
  usage: ".shopeedl <url>",
  example: ".shopeedl https://shopee.co.id/universal-link/video/...",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 2,
  isEnabled: true,
};

const BASE_URL = "https://shopeenowatermark.com";

async function extract(url) {
  const form = new FormData();
  form.append("url", url);

  const res = await fetch(`${BASE_URL}/api/extract`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Error al extraer el enlace");
  return data;
}

function bestStream(streams) {
  const order = ["V1080P", "V720P", "V540P", "V360P", "V1080P_H265", "V720P_H265", "V540P_H265", "V360P_H265"];
  for (const q of order) {
    const s = streams.find(s => s.quality === q);
    if (s) return s;
  }
  return streams[0];
}

async function handler(m, { sock }) {
  const url = m.args[0] || m.text?.trim();

  if (!url) {
    return m.reply(
      `🛍️ *𝗦𝗛𝗢𝗣𝗘𝗘*\n` +
        `> Descarga videos de Shopee sin marca de agua.` +
        usage(m.prefix, "shopeedl", "https://shopee.co.id/..."),
    );
  }

  if (!url.includes("shopee")) {
    await m.react("❌");
    return m.reply(fail("SHOPEE", "Ingresa un enlace de video de Shopee válido."));
  }

  await m.react("🕕");

  try {
    const data = await extract(url);
    if (!data || !data.streams_array || data.streams_array.length === 0) {
      await m.react("❌");
      return m.reply(fail("SHOPEE", "Error al extraer el video. Asegúrate de que el enlace del video de Shopee sea correcto y público."));
    }

    const best = bestStream(data.streams_array);
    const videoUrl = best.stream_url;

    const caption = card({
      emoji: "🛍️",
      title: "𝗦𝗛𝗢𝗣𝗘𝗘",
      fields: [
        ["Usuario", data.username],
        ["Calidad", best.quality],
      ],
      footer: "Hecho por tu bot favorito ✨",
    });

    await sock.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: caption
    }, { quoted: m });

    await m.react("✅");

  } catch (error) {
    console.error("[Shopee DL]", error.message);
    await m.react("☢");
    m.reply(fail("SHOPEE", "Error al descargar el video de Shopee."));
  }
}

export { pluginConfig as config, handler };
