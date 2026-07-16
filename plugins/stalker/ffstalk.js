import axios from "axios";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "ffstalk",
  alias: ["freefireid", "stalkff", "ff"],
  category: "stalker",
  description: "Ver información completa de una cuenta de Free Fire por ID.",
  usage: ".ffstalk <id>",
  example: ".ffstalk 470699855",
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
    return m.reply("❌ *¡Oye, el ID de Free Fire no se ha ingresado!*\n\nDebes escribir el UID del jugador de Free Fire que quieres rastrear. \n\nEjemplo: `.ffstalk 470699855`");
  }

  await m.react("🕕");

  try {
    const res = await axios.get(`https://api.nexray.eu.cc/stalker/freefire?uid=${uid}`, {
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });
    
    const data = res.data;

    if (!data.status || !data.result) {
      await m.react("❌");
      return m.reply(`⚠️ *¡Búsqueda Fallida!*\n\nEl ID *${uid}* no se encontró o la API está fallando. Asegúrese de que el ID que ingresó sea correcto.`);
    }

    const r = data.result;
    
    let caption = `🔥 *FREE FIRE STALK - PROFILE INFO* 🔥\n\n`;
    caption += `Halo! Aquí están los resultados de la búsqueda del perfil para el UID *${r.uid}*:\n\n`;
    
    caption += `👤 *INFO BÁSICA*\n`;
    caption += `  - Nombre: *${r.name || "-"}*\n`;
    caption += `  - Nivel: ${r.level || "-"} (EXP: ${r.exp || "-"})\n`;
    caption += `  - Región: ${r.region || "-"}\n`;
    caption += `  - Likes: ${r.likes || "-"} ❤️\n`;
    caption += `  - Credit Score: ${r.credit_score || "-"}\n`;
    caption += `  - Bio: ${r.signature || "-"}\n\n`;
    
    caption += `🏆 *RANKING Y ACTIVIDAD*\n`;
    caption += `  - BR Rank Point: ${r.br_rank_point || "-"} (Max: ${r.br_max_rank || "-"})\n`;
    caption += `  - CS Rank Point: ${r.cs_rank_point || "-"} (Max: ${r.cs_max_rank || "-"})\n`;
    caption += `  - Season ID: ${r.season_id || "-"}\n`;
    caption += `  - Cuenta Creada: ${r.created_at || "-"}\n`;
    caption += `  - Último Login: ${r.last_login || "-"}\n\n`;
    
    caption += `🛡️ *INFO DE GUILD*\n`;
    caption += `  - Nombre Guild: ${r.guild_name && r.guild_name !== "None" ? r.guild_name : "Sin guild"}\n`;
    if (r.guild_name && r.guild_name !== "None") {
      caption += `  - Nivel Guild: ${r.guild_level || "-"}\n`;
      caption += `  - Miembros: ${r.guild_member || "-"}/${r.guild_capacity || "-"}\n`;
      caption += `  - Líder Guild: ${r.guild_leader_name || "-"} (UID: ${r.guild_leader_uid || "-"})\n`;
    }
    caption += `\n`;
    
    caption += `🐾 *PET INFO*\n`;
    caption += `  - Pet Level: ${r.pet_level || "-"}\n`;
    caption += `  - Pet EXP: ${r.pet_exp || "-"}\n\n`;
    
    caption += `🔧 *OTROS*\n`;
    caption += `  - Idioma: ${r.language ? r.language.replace("Language_", "") : "-"}\n`;
    caption += `  - Modo Favorito: ${r.mode_prefer ? r.mode_prefer.replace("ModePrefer_", "") : "-"}\n\n`;

    caption += `¡El perfil es genial, verdad? ¡Compártelo con tus amigos! 🚀`;

    const isValidUrl = r.banner_image && (r.banner_image.startsWith("http://") || r.banner_image.startsWith("https://"));

    if (isValidUrl) {
      await sock.sendMessage(m.chat, {
        image: { url: r.banner_image },
        caption: caption
      }, { quoted: m });
    } else {
      await m.reply(caption);
    }

    await m.react("✅");

  } catch (error) {
    console.error("[FFStalk]", error.message);
    await m.react("☢");
    m.reply("😔 *Ocurrió un problema en nuestro sistema.* \n\nEl sistema no pudo obtener datos del servidor Free Fire. Por favor, inténtalo de nuevo en unos momentos.");
  }
}

export { pluginConfig as config, handler };
