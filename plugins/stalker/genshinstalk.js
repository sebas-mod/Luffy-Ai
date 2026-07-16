import axios from "axios";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "genshinstalk",
  alias: ["genshin", "stalkgenshin", "gi"],
  category: "stalker",
  description: "Ver información de una cuenta de Genshin Impact por UID.",
  usage: ".genshinstalk <uid>",
  example: ".genshinstalk 856012067",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const uid = m.text?.trim() || m.args[0];

  if (!uid) {
    return m.reply("❌ *¿Dónde está el UID de Genshin?*\n\nDebes ingresar el UID del jugador de Genshin Impact que quieres rastrear. \n\nEjemplo: `.genshinstalk 856012067`");
  }

  await m.react("🕕");

  try {
    const res = await axios.get(`https://api.nexray.eu.cc/stalker/genshin?id=${uid}`, {
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });
    
    const data = res.data;

    if (!data.status || !data.result) {
      await m.react("❌");
      return m.reply(`⚠️ *¡Búsqueda Fallida!*\n\nEl UID *${uid}* no se encontró o el perfil es privado. Asegúrese de que el UID que ingresó sea correcto.`);
    }

    const r = data.result.player_info;
    const imageUrl = data.result.image_url;
    
    let caption = `🌟 *GENSHIN IMPACT STALK* 🌟\n\n`;
    caption += `¡Hola Viajero! Aquí está la información de la cuenta para el UID *${data.result.id}*:\n\n`;
    
    caption += `👤 *INFO DEL JUGADOR*\n`;
    caption += `  - Nickname: *${r.nickname || "-"}*\n`;
    caption += `  - Nivel de Aventura (AR): ${r.level || "-"}\n`;
    caption += `  - Nivel de Mundo (WL): ${r.world_level || "-"}\n`;
    caption += `  - Signature: ${r.signature || "-"}\n\n`;
    
    caption += `🏆 *LOGROS*\n`;
    caption += `  - Logros Totales: ${r.achievements || "-"}\n`;
    caption += `  - Abismo Espiral: ${r.spiral_abyss || "Sin datos aún"}\n`;
    if (r.theater) caption += `  - Imaginarium Theater: ${r.theater}\n`;
    if (r.stygian_onslaught) caption += `  - Stygian Onslaught: ${r.stygian_onslaught}\n`;
    caption += `\n`;
    
    caption += `¿Qué tal, están buenos los stats? ¡Presúmelo a tus amigos! 🚀`;

    if (imageUrl) {
      await sock.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption: caption
      }, { quoted: m });
    } else {
      await m.reply(caption);
    }

    await m.react("✅");

  } catch (error) {
    console.error("[Genshin Stalk]", error.message);
    await m.react("☢");
    m.reply("😔 *Ocurrió un problema en nuestro sistema.* \n\nEl sistema no pudo obtener datos del servidor Genshin Impact. Por favor, inténtalo de nuevo en unos momentos.");
  }
}

export { pluginConfig as config, handler };
