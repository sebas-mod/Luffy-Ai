import {
  generateWAMessage,
  generateWAMessageFromContent,
  prepareWAMessageMedia,
} from "ourin";
import te from "../../src/lib/luffy-error.js";
import { f } from "../../src/lib/luffy-http.js";

const pluginConfig = {
  name: "pap",
  alias: ["papcewe", "papcowo", "papfemboy"],
  category: "search",
  description: "Pide fotos de chica, chico o femboy desde Pinterest",
  usage: ".pap <cewe/cowo/femboy>",
  example: ".pap cewe",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const arg = m.args[0]?.toLowerCase();
  const validTypes = ["cewe", "cowo", "femboy"];

  if (!arg || !validTypes.includes(arg)) {
    return m.reply("╰┈➤ ❌ Elige uno de los tipos de pap disponibles: `cewe`, `cowo` o `femboy`.\n\nEjemplo: `.pap cewe`");
  }

  await m.react("🕕");

  try {
    const query = arg;
    
    const data = await f(
      `https://api.cuki.biz.id/api/search/pinterest?apikey=cuki-x&query=${encodeURIComponent(query)}&type=image`
    );

    const results = data?.data?.results?.filter(item => item.image_url);
    if (!results || results.length === 0) {
      await m.react("❌");
      return m.reply(`╰┈➤ ❌ Vaya, no hay fotos de pap ${query} por ahora. Inténtalo de nuevo más tarde.`);
    }

    const randomItem = results[Math.floor(Math.random() * results.length)];
    const imageUrl = randomItem.image_url;

    if (!imageUrl) {
      await m.react("❌");
      return m.reply("╰┈➤ ⚠️ Imagen no disponible.");
    }

    const mediaMessage = await prepareWAMessageMedia({
      image: { url: imageUrl }
    }, { upload: sock.waUploadToServer });

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {},
          interactiveMessage: {
            header: {
              title: "",
              subtitle: "",
              hasMediaAttachment: true,
              imageMessage: mediaMessage.imageMessage
            },
            footer: {
              text: "Elige otro menú de pap a continuación 👇"
            },
            body: {
              text: `📸 *PAP ${arg.toUpperCase()}*`
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "🔁 Next",
                    id: `${m.prefix}pap ${arg}`
                  })
                },
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "👧 Cewe",
                    id: `${m.prefix}pap cewe`
                  })
                },
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "👦 Cowo",
                    id: `${m.prefix}pap cowo`
                  })
                },
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "⚧ Femboy",
                    id: `${m.prefix}pap femboy`
                  })
                }
              ]
            }
          }
        }
      }
    }, { quoted: m, userJid: sock.user.jid });

    await sock.relayMessage(m.chat, msg.message, {
      messageId: msg.key.id,
    });

    await m.react("✅");

  } catch (error) {
    console.error("[PAP Search]", error.message);
    await m.react("☢");
    m.reply("╰┈➤ 😔 Error al cargar el PAP. El servidor de Pinterest puede estar teniendo problemas.");
  }
}

export { pluginConfig as config, handler };
