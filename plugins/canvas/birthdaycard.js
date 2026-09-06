import axios from "axios";
import config from "../../config.js";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "birthdaycard",
  alias: ["borncard", "tarjetacumple", "happybday", "bannercumple"],
  category: "maker",
  description: "Genera una tarjeta de cumpleaños personalizada",
  usage: ".birthdaycard <nombre>|<edad>|<fecha>|<color?>",
  example: ".birthdaycard Juan|25|10 de Agosto 2026|rosa",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
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
        `🎂 *GENERADOR DE TARJETA DE CUMPLEAÑOS*\n\n` +
        `╭─〔 Cómo Usarlo 〕───⬣\n` +
        `│  ✦ ${m.prefix}birthdaycard <nombre>|<edad>|<fecha>|<color>\n` +
        `╰──────────────⬣\n\n` +
        `*${m.prefix}birthdaycard Juan|25|10 de Agosto 2026|rosa*\n` +
        `*${m.prefix}birthdaycard Ana|30|12 de Marzo* (color por defecto)\n\n` +
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
          `> Uso: ${m.prefix}birthdaycard <nombre>|<edad>|<fecha>|<color?>\n` +
          `> Ej: ${m.prefix}birthdaycard Juan|25|10 de Agosto 2026|rosa`,
      );
    }

    const url = `https://api-yosoyyo-api-ofc.onrender.com/api/birthday?name=${encodeURIComponent(name)}&age=${encodeURIComponent(age)}&date=${encodeURIComponent(date)}&apiKey=${encodeURIComponent(getApiKey())}${color ? `&color=${encodeURIComponent(color)}` : ""}`;

    const res = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 45000,
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (res.status !== 200) {
      await m.react("✘");
      return m.reply(
        `☽◯☾ ♰ ❌ No se pudo generar la tarjeta (HTTP ${res.status}). Intenta de nuevo.`,
      );
    }

    const media = res.data;
    const isPng = res.headers["content-type"]?.includes("png");
    const textInfo =
      `🎂 *TARJETA DE CUMPLEAÑOS*\n\n` +
      `👤 Nombre: *${name}*\n` +
      (age ? `🎈 Edad: *${age}* años\n` : "") +
      `📅 Fecha: *${date}*\n` +
      (color ? `🎨 Color: *${color}*` : "");

    await sock.sendMessage(
      m.chat,
      { image: media, mimetype: isPng ? "image/png" : "image/jpeg", caption: textInfo },
      { quoted: m },
    );

    await m.react("✅");
  } catch (error) {
    console.error("[BirthdayCard] Error:", error.message);
    await m.react("✘");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };