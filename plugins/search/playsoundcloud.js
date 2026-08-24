import { scSearch } from "./soundcloud.js";
import scdl from "../../src/scraper/soundclouddl.js";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "playsoundcloud",
  alias: ["playsc"],
  category: "search",
  description: "Busca y descarga canciones de SoundCloud",
  usage: ".playsc judul",
  example: ".playsc Only We Know",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  carne: 2,
  isEnabled: true,
};

async function handler(m, { args, sock }) {
  if (!args[0]) {
    let txt = `╭━━━〔 🎶 PLAY SOUNDCLOUD 〕━━━╮\n\n`;
    txt += `¡Hola! ¿Quieres escuchar canciones de SoundCloud? Puedo buscarlas y descargarlas en formato MP3 para ti!\n\n`;
    txt += `*Cómo Usar:*\n`;
    txt += `👉 \`${m.prefix}playsc <título de la canción>\`\n\n`;
    txt += `*Ejemplo:*\n`;
    txt += `\`${m.prefix}playsc Only We Know\``;
    return m.reply(txt);
  }

  await m.react("🕕");

  try {
    const searchResults = await scSearch(args.join(" "));
    if (!searchResults.length) {
      return m.reply(`╰┈➤ ❌ ¡Vaya, no encontré la canción! Intenta buscar con otro título. 😭`);
    }

    const track = searchResults[0];
    const downloadInfo = await scdl(track.url);
    let contentTxt = `╰┈➤ 🎵 *Título :* ${downloadInfo.title}\n`;
    contentTxt += `╰┈➤ 👤 *Subido por :* ${downloadInfo.uploader}\n`;
    contentTxt += `╰┈➤ ⏱️ *Duración :* ${downloadInfo.duration}\n`;
    contentTxt += `╰┈➤ 👁️ *Vistas :* ${downloadInfo.views}\n`;
    contentTxt += `╰┈➤ ❤️ *Likes :* ${downloadInfo.likes}\n`;
    contentTxt += `╰┈➤ 📦 *Tamaño :* ${downloadInfo.size}`;

    let txt = `╭━━━〔 🎉 CANCIÓN DESCARGADA 〕━━━╮\n\n`;
    txt += contentTxt.trim().split("\n").map(line => `${line}`).join("\n");
    txt += `\n\n`;
    txt += `──────────\n╰┈➤ _El audio MP3 se está enviando, ¡espera!_ 🎶\n\n╰━━━━━━━━━━━━╯`;

    await sock.sendMedia(m.chat, downloadInfo.thumbnail || track.artwork, txt.trim(), m, { type: "image" });
    await sock.sendMedia(m.chat, downloadInfo.download_url, downloadInfo.title, m, { type: "audio" });

    await m.react("✅");
  } catch (e) {
    m.reply(`╰┈➤ ❌ ¡Error al descargar la canción! 😭\nError: ${e.message}`);
  }
}

export { pluginConfig as config, handler };
