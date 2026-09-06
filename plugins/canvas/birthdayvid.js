import axios from "axios";
import config from "../../config.js";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "birthdayvid",
  alias: ["bornvideo", "videocumple", "happybdayvid"],
  category: "maker",
  description: "Genera un video de cumpleaños personalizado",
  usage: ".birthdayvid <nombre>|<edad>|<fecha>|<color?>",
  example: ".birthdayvid Juan|25|10 de Agosto 2026|rosa",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  carne: 2,
  isEnabled: true,
};

function getApiKey() {
  return (
    config.downloader?.spotifySearchKey ||
    config.downloader?.apiKey ||
    "sebasapi2024"
  );
}

async function handler(m, { sock }) {
  const text = m.text?.trim();

  if (!text) {
    return m.reply(
      `☽◯☾ ╭ ── ☽◯☾ ── ╮\n` +
        `🎂 *GENERADOR DE VIDEO DE CUMPLEAÑOS*\n\n` +
        `╭─〔 Cómo Usarlo 〕───⬣\n` +
        `│  ✦ ${m.prefix}birthdayvid <nombre>|<edad>|<fecha>|<color>\n` +
        `╰──────────────⬣\n\n` +
        `*${m.prefix}birthdayvid Juan|25|10 de Agosto 2026|rosa*\n` +
        `*${m.prefix}birthdayvid Ana|30|12 de Marzo* (color por defecto)\n\n` +
        `Colores: rosa, rojo, azul, verde, dorado, morado, negro... ☘︎ ݁˖`,
    );
  }

  await m.react("🕕");

  try {
    const parts = text.split("|").map((p) => p.trim());
    const name = parts[0];
    const age = parts[1];
    const date = parts[2];
    const color = parts[3];

    if (!name || !age || !date) {
      await m.react("✘");
      return m.reply(
        `☽◯☾ ♰ ❌ Faltan datos: necesito *nombre*, *edad* y *fecha*.\n` +
          `> Uso: ${m.prefix}birthdayvid <nombre>|<edad>|<fecha>|<color?>\n` +
          `> Ej: ${m.prefix}birthdayvid Juan|25|10 de Agosto 2026|rosa`,
      );
    }

    const url = `https://api-yosoyyo-api-ofc.onrender.com/api/birthdayvid?name=${encodeURIComponent(name)}&age=${encodeURIComponent(age)}&date=${encodeURIComponent(date)}&apiKey=${encodeURIComponent(getApiKey())}${color ? `&color=${encodeURIComponent(color)}` : ""}`;

    const res = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 60000,
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (res.status !== 200) {
      await m.react("✘");
      return m.reply(
        `☽◯☾ ♰ ❌ No se pudo generar el video (HTTP ${res.status}). Intenta de nuevo.`,
      );
    }

    const media = res.data;
    if (!media || !media.length) {
      await m.react("✘");
      return m.reply(
        `☽◯☾ ♰ ❌ La API no devolvió un video válido. Intenta de nuevo.`,
      );
    }

    const textInfo =
      `🎂 *VIDEO DE CUMPLEAÑOS*\n\n` +
      `👤 Nombre: *${name}*\n` +
      (age ? `🎈 Edad: *${age}* años\n` : "") +
      `📅 Fecha: *${date}*\n` +
      (color ? `🎨 Color: *${color}*` : "");

    await sock.sendMessage(
      m.chat,
      {
        video: media,
        mimetype: "video/mp4",
        caption: textInfo,
      },
      { quoted: m },
    );

    await m.react("✅");
  } catch (error) {
    console.error("[BirthdayVid] Error:", error.message);
    await m.react("✘");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };