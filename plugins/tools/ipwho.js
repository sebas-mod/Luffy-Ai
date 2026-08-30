import config from "../../config.js";
import te from "../../src/lib/luffy-error.js";
import { sendToolsPreview, saluranCtx } from "../../src/lib/luffy-context.js";
const pluginConfig = {
  name: "ipwho",
  alias: ["ip", "iplookup", "ipinfo"],
  category: "tools",
  description: "Busca información de una dirección IP",
  usage: ".ipwho <ip>",
  example: ".ipwho 8.8.8.8",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const ip = m.args?.[0];

  if (!ip) {
    return m.reply(
      `☽◯☾ ╭━ ♰ ⚠️ ᴄᴏᴍᴏ ᴜsᴀʀ ♰ ━╮ ☽◯☾\n\n` +
        `> \`${m.prefix}ipwho <ip>\`\n\n` +
        `> Ejemplo:\n` +
        `> \`${m.prefix}ipwho 8.8.8.8\`\n\n╰━ ⊱༺༒༻⊰ ━╯`,
    );
  }

  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) {
    return m.reply(`☽◯☾ ♰ ❌ *ғᴏʀᴍᴀᴛᴏ ɪɴᴠᴀʟɪᴅᴏ*\n\n> Ejemplo: \`8.8.8.8\``);
  }

  await m.react("🕕");
  await m.reply(`☽◯☾ ♰ 🕕 *ʙᴜsᴄᴀɴᴅᴏ ɪɴғᴏ ᴅᴇ ɪᴘ...*`);

  try {
    const res = await fetch(`https://ipwho.is/${ip}`);
    const data = await res.json();

    if (!data.success) {
      await m.react("❌");
      return m.reply(`☽◯☾ ♰ ❌ *ɪᴘ ɴᴏ ᴇɴᴄᴏɴᴛʀᴀᴅᴀ*\n\n> IP ${ip} no válida`);
    }

    if (data.latitude && data.longitude) {
      await sock.sendMessage(
        m.chat,
        {
          location: {
            degreesLatitude: data.latitude,
            degreesLongitude: data.longitude,
          },
        },
        { quoted: m },
      );
    }

    const text =
      `🌐 *ɪᴘ ʟᴏᴏᴋᴜᴘ*\n\n` +
      `☽◯☾ ♰ 「 📍 *ᴜʙɪᴄᴀᴄɪᴏɴ* 」\n` +
      `┃ 🔢 IP: ${data.ip}\n` +
      `┃ 🌍 País: ${data.country} ${data.country_code}\n` +
      `┃ 🏙️ Ciudad: ${data.city || "-"}\n` +
      `┃ 📍 Región: ${data.region || "-"}\n` +
      `┃ 🌐 Continente: ${data.continent || "-"}\n` +
      `┃ 📮 Código Postal: ${data.postal || "-"}\n` +
      `┃ ⏰ Zona Horaria: ${data.timezone?.id || "-"}\n` +
      `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
      `☽◯☾ ♰ 「 🔌 *ᴄᴏɴᴇxɪᴏɴ* 」\n` +
      `┃ 🏢 ISP: ${data.connection?.isp || "-"}\n` +
      `┃ 🌐 ORG: ${data.connection?.org || "-"}\n` +
      `┃ 📡 ASN: ${data.connection?.asn || "-"}\n` +
      `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
      `☽◯☾ ♰ 「 🛡️ *sᴇɢᴜʀɪᴅᴀᴅ* 」\n` +
      `┃ 🔒 VPN: ${data.security?.vpn ? "✅ Yes" : "❌ No"}\n` +
      `┃ 🌐 Proxy: ${data.security?.proxy ? "✅ Yes" : "❌ No"}\n` +
      `┃ 🤖 Tor: ${data.security?.tor ? "✅ Yes" : "❌ No"}\n` +
      `╰━ ⊱༺༒༻⊰ ━╯`;

    await m.react("✅");
    await sendToolsPreview(sock, m.chat, text, "🌐 *ɪᴘ ʟᴏᴏᴋᴜᴘ*", data.country, {
      quoted: m,
    });
  } catch (e) {
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
