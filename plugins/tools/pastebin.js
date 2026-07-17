import axios from "axios";
import te from "../../src/lib/ourin-error.js";
import { sendToolsPreview } from "../../src/lib/ourin-context.js";
const pluginConfig = {
  name: "pastebin",
  alias: ["paste", "pb"],
  category: "tools",
  description: "Subir texto a Pastebin",
  usage: ".pastebin <texto>",
  example: '.pastebin console.log("Hola Mundo")',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  let text = m.args.join(" ");

  if (m.quoted?.text) {
    text = m.quoted.text;
  }

  if (!text) {
    return m.reply(
      `📋 *ᴘᴀsᴛᴇʙɪɴ ᴜᴘʟᴏᴀᴅ*\n\n` +
        `Envía texto para subir a Pastebin.\n\n` +
        `*Cómo usar:*\n` +
        `• \`${m.prefix}pastebin <texto>\`\n` +
        `• Responde a texto con \`${m.prefix}pastebin\`\n\n` +
        `> Ejemplo: \`${m.prefix}pastebin console.log("Hola")\``,
    );
  }

  const api_dev_key = "h9WMT2Mn9QW-qDhvUSc-KObqAYcjI0he";
  const api_paste_code = text.trim();
  const api_paste_name = `Pegado de ${m.pushName || "User"} - ${new Date().toLocaleDateString("es-ES")}`;

  const data = new URLSearchParams({
    api_dev_key,
    api_option: "paste",
    api_paste_code,
    api_paste_name,
    api_paste_private: "1",
  });

  try {
    const res = await axios.post(
      "https://pastebin.com/api/api_post.php",
      data.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 15000,
      },
    );

    const url = res.data;

    if (url.startsWith("Bad API request")) {
      return m.reply(`❌ *ꜰᴀʟʟᴏ*\n\n> ${url}`);
    }

    const responseText =
      `✅ *ᴘᴀsᴛᴇʙɪɴ ᴇxɪᴛᴏsᴏ*\n\n` +
      `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇs* 」\n` +
      `┃ 📝 ᴛɪᴛᴜʟᴏ: *${api_paste_name}*\n` +
      `┃ 📊 ᴛᴀᴍᴀñᴏ: *${text.length} chars*\n` +
      `┃ 🔗 ʟɪɴᴋ: ${url}\n` +
      `╰┈┈⬡\n\n` +
      `> El pegado expirará según la configuración de Pastebin.`;
    await sendToolsPreview(
      sock,
      m.chat,
      responseText,
      "Pastebin Upload",
      api_paste_name,
      { quoted: m },
    );
  } catch (e) {
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
