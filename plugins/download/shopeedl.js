import te from "../../src/lib/luffy-error.js";

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

  if (!url || !url.includes("shopee")) {
    return m.reply("❌ Ingresa un enlace de video de Shopee válido.\n\nEjemplo: `.shopeedl https://shopee.co.id/...`");
  }

  await m.react("🕕");

  try {
    const data = await extract(url);
    if (!data || !data.streams_array || data.streams_array.length === 0) {
      await m.react("❌");
      return m.reply("⚠️ Error al extraer el video. Asegúrate de que el enlace del video de Shopee sea correcto y público.");
    }

    const best = bestStream(data.streams_array);
    const videoUrl = best.stream_url;

    let caption = `🛍️ *DESCARGADOR DE VIDEOS SHOPEE* 🛍️\n\n`;
    if (data.username) caption += `*Usuario:* ${data.username}\n`;
    caption += `*Calidad:* ${best.quality}\n`;
    caption += `\n> Hecho por tu bot favorito`;

    await sock.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: caption
    }, { quoted: m });

    await m.react("✅");

  } catch (error) {
    console.error("[Shopee DL]", error.message);
    await m.react("☢");
    m.reply("😔 Error al descargar el video de Shopee.");
  }
}

export { pluginConfig as config, handler };
