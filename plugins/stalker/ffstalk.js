import axios from "axios";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "ffstalk",
  alias: ["freefireid", "stalkff", "ff"],
  category: "stalker",
  description: "Ver la información completa de una cuenta de Free Fire según su ID.",
  usage: ".ffstalk <id>",
  example: ".ffstalk 470699855",
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
    return m.reply("☽◯☾ ♰ ❌ *Vaya, el ID de Free Fire aún no se ha ingresado!*\n\nDebes escribir el UID del jugador de Free Fire que quieres buscar. \n\nEjemplo: `.ffstalk 470699855`");
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
      return m.reply(`☽◯☾ ♰ ⚠️ *¡Búsqueda Fallida!*\n\nEl ID *${uid}* no fue encontrado o la API está teniendo problemas. Asegúrate de que el ID que ingresaste sea correcto.`);
    }

    const r = data.result;
    
    let caption = `☽◯☾ ╭━ ♰ 🔥 FREE FIRE STALK ♰ ━╮ ☽◯☾\n\n`;
    caption += `☽◯☾ ♰ ¡Hola! Estos son los resultados de la búsqueda del perfil del UID *${r.uid}*:\n──────────\n`;
    
    caption += `👤 *INFO BÁSICA*\n`;
    caption += `› Nombre: *${r.name || "-"}*\n`;
    caption += `› Nivel: ${r.level || "-"} (EXP: ${r.exp || "-"})\n`;
    caption += `› Región: ${r.region || "-"}\n`;
    caption += `› Me gusta: ${r.likes || "-"} ❤️\n`;
    caption += `› Puntaje de crédito: ${r.credit_score || "-"}\n`;
    caption += `› Bio: ${r.signature || "-"}\n\n`;
    
    caption += `🏆 *RANKING Y ACTIVIDAD*\n`;
    caption += `› Puntos BR Rank: ${r.br_rank_point || "-"} (Máx: ${r.br_max_rank || "-"})\n`;
    caption += `› Puntos CS Rank: ${r.cs_rank_point || "-"} (Máx: ${r.cs_max_rank || "-"})\n`;
    caption += `› ID de temporada: ${r.season_id || "-"}\n`;
    caption += `› Cuenta creada: ${r.created_at || "-"}\n`;
    caption += `› Último inicio de sesión: ${r.last_login || "-"}\n\n`;
    
    caption += `🛡️ *INFO DEL GREMIO*\n`;
    caption += `› Nombre del gremio: ${r.guild_name && r.guild_name !== "None" ? r.guild_name : "Sin gremio"}\n`;
    if (r.guild_name && r.guild_name !== "None") {
      caption += `› Nivel del gremio: ${r.guild_level || "-"}\n`;
      caption += `› Miembros: ${r.guild_member || "-"}/${r.guild_capacity || "-"}\n`;
      caption += `› Líder del gremio: ${r.guild_leader_name || "-"} (UID: ${r.guild_leader_uid || "-"})\n`;
    }
    caption += `\n`;
    
    caption += `🐾 *INFO DE LA MASCOTA*\n`;
    caption += `› Nivel de la mascota: ${r.pet_level || "-"}\n`;
    caption += `› EXP de la mascota: ${r.pet_exp || "-"}\n\n`;
    
    caption += `🔧 *OTROS*\n`;
    caption += `› Idioma: ${r.language ? r.language.replace("Language_", "") : "-"}\n`;
    caption += `› Modo favorito: ${r.mode_prefer ? r.mode_prefer.replace("ModePrefer_", "") : "-"}\n\n`;

    caption += `──────────\n☽◯☾ ♰ ¿Qué tal está su perfil? ¡Compártelo con tus amigos! 🚀\n\n╰━ ⊱༺༒༻⊰ ━╯`;

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
    m.reply("☽◯☾ ♰ 😔 *Hubo un problema en nuestro sistema.* \n\nEl sistema no pudo obtener los datos del servidor de Free Fire. Vuelve a intentarlo en unos momentos.");
  }
}

export { pluginConfig as config, handler };
