import axios from "axios";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "pintereststalk",
  alias: ["pinterestid", "stalkpinterest", "stalkpin"],
  category: "stalker",
  description: "Ver información completa de una cuenta de Pinterest por username.",
  usage: ".pintereststalk <username>",
  example: ".pintereststalk dims",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const username = m.text?.trim() || m.args[0];

  if (!username) {
    return m.reply("❌ *¡Oye, el username de Pinterest no se ha ingresado!*\n\nDebes escribir el username de Pinterest que quieres rastrear. \n\nEjemplo: `.pintereststalk dims`");
  }

  await m.react("🕕");

  try {
    const res = await axios.get(`https://api.nexray.eu.cc/stalker/pinterest?username=${encodeURIComponent(username)}`, {
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });
    
    const data = res.data;

    if (!data.status || !data.result) {
      await m.react("❌");
      return m.reply(`⚠️ *¡Búsqueda Fallida!*\n\nEl username *${username}* no se encontró en Pinterest. Asegúrese de que esté escrito correctamente.`);
    }

    const r = data.result;
    
    let caption = `📌 *PINTEREST STALK - PROFILE INFO* 📌\n\n`;
    caption += `¡Hola! Aquí están los resultados de la búsqueda del perfil para el username *@${r.username}*:\n\n`;
    
    caption += `👤 *INFO DEL PERFIL*\n`;
    caption += `  - Nombre Completo: *${r.full_name || "-"}*\n`;
    caption += `  - Bio: ${r.bio || "-"}\n`;
    caption += `  - Tipo de Cuenta: ${r.account_type || "-"}\n`;
    caption += `  - Cuenta Creada: ${r.created_at || "-"}\n\n`;
    
    caption += `📊 *ESTADÍSTICAS*\n`;
    caption += `  - Seguidores (Followers): ${r.stats?.followers || 0}\n`;
    caption += `  - Siguiendo (Following): ${r.stats?.following || 0}\n`;
    caption += `  - Total Pines: ${r.stats?.pins || 0}\n`;
    caption += `  - Total Tableros: ${r.stats?.boards || 0}\n\n`;
    
    caption += `🔗 *ENLACE DEL PERFIL*\n`;
    caption += `  - ${r.profile_url}\n\n`;

    caption += `¿Te gusta recopilar inspiración de Pinterest? ¡Compártelo con tus amigos! 🚀`;

    const imageUrl = r.image?.original || r.image?.large || r.image?.medium || r.image?.small;

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
    console.error("[Pinterest Stalk]", error.message);
    await m.react("☢");
    m.reply("😔 *Ocurrió un problema en nuestro sistema.* \n\nEl sistema no pudo obtener datos del servidor Pinterest. Por favor, inténtalo de nuevo en unos momentos.");
  }
}

export { pluginConfig as config, handler };
