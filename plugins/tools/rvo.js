import config from "../../config.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "rvo",
  alias: ["readvo", "readviewonce", "readview"],
  category: "tools",
  description: "Leer mensaje de vista única (view once)",
  usage: ".rvo (responder a mensaje view once)",
  example: ".rvo",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const quoted = m.quoted;
  if (!quoted) {
    return m.reply(
      `Responde a un mensaje de vista única (view once) para abrirlo.\n\n\`Ejemplo: ${m.prefix}rvo\` (responder a mensaje view once)`,
    );
  }

  if (!quoted.isViewOnce && !quoted.isMedia) {
    return m.reply("❌ Responde a un mensaje view once (vista única) para abrirlo.");
  }

  m.react("⏱️");

  try {
    let originalCaption = "";
    if (quoted.message?.[quoted.type]?.caption) {
      originalCaption = quoted.message[quoted.type].caption;
    } else if (quoted.body) {
      originalCaption = quoted.body;
    }

    const buffer = await quoted.download();
    if (!buffer) throw new Error("Error al descargar el medio");

    const caption = originalCaption ? `\`Mensaje :\`\n> ${originalCaption}` : "";

    if (quoted.isImage) {
      await sock.sendMessage(
        m.chat,
        {
          image: buffer,
          caption,
        },
        { quoted: m },
      );
    } else if (quoted.isVideo) {
      await sock.sendMessage(
        m.chat,
        {
          video: buffer,
          caption,
        },
        { quoted: m },
      );
    } else if (quoted.isAudio) {
      await sock.sendMessage(
        m.chat,
        {
          audio: buffer,
          mimetype: quoted.message?.[quoted.type]?.mimetype || "audio/mpeg",
        },
        { quoted: m },
      );
    } else {
      const ext = quoted.type?.replace("Message", "") || "bin";
      await sock.sendMessage(
        m.chat,
        {
          document: buffer,
          fileName: `rvo_${Date.now()}.${ext}`,
          mimetype:
            quoted.message?.[quoted.type]?.mimetype ||
            "application/octet-stream",
          caption: caption || "📎 Medio de vista única",
        },
        { quoted: m },
      );
    }

    m.react("✅");
  } catch (e) {
    m.react("☢");
    let msg = e.message;
    if (
      msg.includes("Error al descargar") ||
      msg.includes("decrypt") ||
      msg.includes("download") ||
      msg.includes("Timeout") ||
      msg.includes("404") ||
      msg.includes("Gone")
    ) {
      msg =
        "El medio ya expiró o fue eliminado del servidor de WhatsApp.\n\n_Los mensajes View Once que llevan mucho tiempo o se abren frecuentemente suelen eliminarse automáticamente del sistema de WhatsApp y no se pueden descargar de nuevo._";
    }
    m.reply(`❌ *Error al Abrir Vista Única*\n\n> ${msg}`);
  }
}

export { pluginConfig as config, handler };
