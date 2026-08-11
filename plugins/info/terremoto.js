import axios from "axios";
import { saluranCtx } from "../../src/lib/luffy-context.js";

const pluginConfig = {
  name: "terremoto",
  alias: ["bmkg", "infogempa", "earthquake"],
  category: "info",
  description: "Información del último terremoto de BMKG",
  usage: ".gempa",
  example: ".gempa",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  await m.react("🕕");

  try {
    const response = await axios.get(
      "https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json",
      { timeout: 15000 },
    );

    const g = response.data.Infogempa.gempa;
    const shakemapUrl = g.Shakemap
      ? `https://data.bmkg.go.id/DataMKG/TEWS/${g.Shakemap}`
      : null;

    const text =
      `🌍 *Info del Terremoto Reciente — BMKG*\n\n` +
      `> 📅 Fecha: *${g.Tanggal}*\n` +
      `> 🕐 Hora: *${g.Jam}*\n` +
      `> 📐 Coordenadas: *${g.Coordinates}*\n` +
      `> 📍 Latitud: *${g.Lintang}*\n` +
      `> 📍 Longitud: *${g.Bujur}*\n` +
      `> 💥 Magnitud: *${g.Magnitude}*\n` +
      `> 🔽 Profundidad: *${g.Kedalaman}*\n` +
      `> 🗺️ Zona: *${g.Wilayah}*\n` +
      `> ⚠️ Potencial: *${g.Potensi}*\n` +
      `> 🏠 Sentido: *${g.Dirasakan}*\n\n` +
      `_Fuente: BMKG Indonesia_`;

    await m.react("✅");

    if (shakemapUrl) {
      try {
        const imgRes = await axios.get(shakemapUrl, {
          responseType: "arraybuffer",
          timeout: 15000,
        });
        await sock.sendMedia(m.chat, Buffer.from(imgRes.data), text, m, {
          type: "image",
        });
      } catch {
        await m.reply(text, { contextInfo: saluranCtx() });
      }
    } else {
      await m.reply(text, { contextInfo: saluranCtx() });
    }
  } catch (e) {
    await m.react("☢");
    await m.reply(
      `❌ *Error al obtener los datos del terremoto*\n\n> ${e.message || "Inténtalo de nuevo más tarde"}`,
    );
  }
}

export { pluginConfig as config, handler };
