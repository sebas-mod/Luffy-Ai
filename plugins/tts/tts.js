import te from "../../src/lib/luffy-error.js";
import ourinApi from "../../src/lib/luffy-apimanager.js";
const pluginConfig = {
  name: "tts",
  alias: ["say"],
  category: "tts",
  description: "Texto a voz de Google",
  usage: ".tts <text>",
  example: ".tts hola a todos",
  cooldown: 10,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.text?.trim();

  if (!text) {
    return m.reply(`☽◯☾ ╭━ ♰ ✦ ♰ ━╮ ☽◯☾\n\n🎤 *Google TTS*\n\n☽◯☾ ♰ Usa:\n${m.prefix}tts hola mundo\n\n╰━ ⊱༺༒༻⊰ ━╯`);
  }

  m.react("🎤");

  async function textToSpeech2(text) {
    try {
      const response = await ourinApi.nexray.geminiTts(text);
      return response;
    } catch (error) {
      return error;
    }
  }

  try {
    const t = await textToSpeech2(text);
    await sock.sendMessage(
      m.chat,
      {
        audio: { url: t.result },
        mimetype: "audio/mpeg",
      },
      { quoted: m },
    );
    m.react("✅");
  } catch (err) {
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
