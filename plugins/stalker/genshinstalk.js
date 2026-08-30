import axios from "axios";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "genshinstalk",
  alias: ["genshin", "stalkgenshin", "gi"],
  category: "stalker",
  description: "Ver la información de una cuenta de Genshin Impact por UID.",
  usage: ".genshinstalk <uid>",
  example: ".genshinstalk 856012067",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const uid = m.text?.trim() || m.args[0];

  if (!uid) {
    return m.reply("☽◯☾ ♰ ❌ *¿Y el UID de Genshin?*\n\nDebes ingresar el UID del jugador de Genshin Impact que quieres buscar. \n\nEjemplo: `.genshinstalk 856012067`");
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
      return m.reply(`☽◯☾ ♰ ⚠️ *¡Búsqueda Fallida!*\n\nEl UID *${uid}* no fue encontrado o el perfil está en privado. Asegúrate de que el UID que ingresaste sea correcto.`);
    }

    const r = data.result.player_info;
    const imageUrl = data.result.image_url;
    
    let caption = `☽◯☾ ╭━ ♰ 🌟 GENSHIN IMPACT STALK ♰ ━╮ ☽◯☾\n\n`;
    caption += `¡Hola Traveler! Esta es la información de la cuenta del UID *${data.result.id}*:\n\n`;
    
    caption += `👤 *INFO DEL JUGADOR*\n`;
    caption += `› Nickname: *${r.nickname || "-"}*\n`;
    caption += `› Adventure Rank (AR): ${r.level || "-"}\n`;
    caption += `› World Level (WL): ${r.world_level || "-"}\n`;
    caption += `› Signature: ${r.signature || "-"}\n\n`;
    
    caption += `🏆 *LOGROS*\n`;
    caption += `› Total de logros: ${r.achievements || "-"}\n`;
    caption += `› Spiral Abyss: ${r.spiral_abyss || "Sin datos"}\n`;
    if (r.theater) caption += `› Imaginarium Theater: ${r.theater}\n`;
    if (r.stygian_onslaught) caption += `› Stygian Onslaught: ${r.stygian_onslaught}\n`;
    caption += `\n`;
    
    caption += `──────────\n☽◯☾ ♰ ¿Qué tal están tus stats? ¡Muéstralos a tus amigos! 🚀\n\n╰━ ⊱༺༒༻⊰ ━╯`;

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
    m.reply("☽◯☾ ♰ 😔 *Hubo un problema en nuestro sistema.* \n\nEl sistema no pudo obtener los datos del servidor de Genshin Impact. Vuelve a intentarlo en unos momentos.");
  }
}

export { pluginConfig as config, handler };
