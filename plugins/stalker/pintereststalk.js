import axios from "axios";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "pintereststalk",
  alias: ["pinterestid", "stalkpinterest", "stalkpin"],
  category: "stalker",
  description: "Ver la información completa de una cuenta de Pinterest por username.",
  usage: ".pintereststalk <username>",
  example: ".pintereststalk dims",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const username = m.text?.trim() || m.args[0];

  if (!username) {
    return m.reply("☽◯☾ ♰ ❌ *Vaya, el username de Pinterest aún no se ha ingresado!*\n\nDebes escribir el username de Pinterest que quieres buscar. \n\nEjemplo: `.pintereststalk dims`");
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
      return m.reply(`☽◯☾ ♰ ⚠️ *¡Búsqueda Fallida!*\n\nEl username *${username}* no fue encontrado en Pinterest. Asegúrate de que esté bien escrito.`);
    }

    const r = data.result;
    
    let caption = `☽◯☾ ╭━ ♰ 📌 PINTEREST STALK ♰ ━╮ ☽◯☾\n\n`;
    caption += `☽◯☾ ♰ ¡Hola! Estos son los resultados de la búsqueda del perfil del username *@${r.username}*:\n──────────\n`;
    
    caption += `👤 *INFO DEL PERFIL*\n`;
    caption += `› Nombre completo: *${r.full_name || "-"}*\n`;
    caption += `› Username: @${r.username}\n`;
    caption += `› Bio: ${r.bio || "-"}\n`;
    caption += `› Tipo de cuenta: ${r.account_type || "-"}\n`;
    caption += `› Cuenta creada: ${r.created_at || "-"}\n\n`;
    
    caption += `📊 *ESTADÍSTICAS*\n`;
    caption += `› Seguidores: ${r.stats?.followers || 0}\n`;
    caption += `› Siguiendo: ${r.stats?.following || 0}\n`;
    caption += `› Total de pines: ${r.stats?.pins || 0}\n`;
    caption += `› Total de boards: ${r.stats?.boards || 0}\n\n`;
    
    caption += `🔗 *LINK DEL PERFIL*\n`;
    caption += `› ${r.profile_url}\n\n`;

    caption += `──────────\n☽◯☾ ♰ ¿Te gusta coleccionar inspiración de Pinterest? ¡Muéstralo a tus amigos! 🚀\n\n╰━ ⊱༺༒༻⊰ ━╯`;

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
    m.reply("☽◯☾ ♰ 😔 *Hubo un problema en nuestro sistema.* \n\nEl sistema no pudo obtener los datos del servidor de Pinterest. Vuelve a intentarlo en unos momentos.");
  }
}

export { pluginConfig as config, handler };
