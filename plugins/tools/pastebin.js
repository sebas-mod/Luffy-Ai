import axios from "axios";
import te from "../../src/lib/luffy-error.js";
import { sendToolsPreview } from "../../src/lib/luffy-context.js";
const pluginConfig = {
  name: "pastebin",
  alias: ["paste", "pb"],
  category: "tools",
  description: "Sube texto a Pastebin",
  usage: ".pastebin <texto>",
  example: '.pastebin console.log("Hello World")',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  let text = m.args.join(" ");

  if (m.quoted?.text) {
    text = m.quoted.text;
  }

  if (!text) {
    return m.reply(
      `☽◯☾ ╭━ ♰ 📋 sᴜʙɪʀ ᴀ ᴘᴀsᴛᴇʙɪɴ ♰ ━╮ ☽◯☾\n\n` +
        `Envía texto para subirlo a Pastebin.\n\n` +
        `*Cómo usar:*\n` +
        `• \`${m.prefix}pastebin <texto>\`\n` +
        `• Responde un texto con \`${m.prefix}pastebin\`\n\n` +
        `> Ejemplo: \`${m.prefix}pastebin console.log("Hello")\`\n\n╰━ ⊱༺༒༻⊰ ━╯`,
    );
  }

  const api_dev_key = "h9WMT2Mn9QW-qDhvUSc-KObqAYcjI0he";
  const api_paste_code = text.trim();
  const api_paste_name = `Paste de ${m.pushName || "User"} - ${new Date().toLocaleDateString("es-AR")}`;

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
      return m.reply(`☽◯☾ ♰ ❌ *ᴇʀʀᴏʀ*\n\n> ${url}`);
    }

    const responseText =
      `✅ *ᴘᴀsᴛᴇʙɪɴ ᴇxɪᴛᴏsᴏ*\n\n` +
      `☽◯☾ ♰ 「 📋 *ᴅᴇᴛᴀʟʟᴇ* 」\n` +
      `┃ 📝 ᴛɪᴛᴜʟᴏ: *${api_paste_name}*\n` +
      `┃ 📊 ᴛᴀᴍᴀɴᴏ: *${text.length} caracteres*\n` +
      `┃ 🔗 ᴇɴʟᴀᴄᴇ: ${url}\n` +
      `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
      `> El paste expirará según la configuración de Pastebin.`;
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
