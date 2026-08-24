import config from "../../config.js";
import { getDatabase } from "../../src/lib/luffy-database.js";
import te from "../../src/lib/luffy-error.js";
const pluginConfig = {
  name: "autojoingc",
  alias: ["autojoin", "autojoingroup"],
  category: "owner",
  description: "Auto unirse a grupos desde el enlace detectado en el chat",
  usage: ".autojoingc on/off",
  example: ".autojoingc on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  carne: 0,
  isEnabled: true,
};
const GROUP_LINK_REGEX = /chat\.whatsapp\.com\/([a-zA-Z0-9]{18,24})/gi;
async function handler(m) {
  const db = getDatabase();
  const arg = (m.args?.[0] || "").toLowerCase();
  if (!arg || !["on", "off"].includes(arg)) {
    const current = db.setting("autoJoinGc") || false;
    return m.reply(
      `👑•─────•👑\n🔗 *AUTO JOIN DE GRUPOS*\n\nEstado: *${current ? "ON ✅" : "OFF ❌"}*\n\n\`${m.prefix}autojoingc on\` — activar\n\`${m.prefix}autojoingc off\` — desactivar\n✦────────✦`,
    );
  }
  const enabled = arg === "on";
  db.setting("autoJoinGc", enabled);
  await db.save();
  m.reply(
    `╭━━━〔 👑 OWNER 〕━━━╮\n┃ ${enabled ? "✅" : "❌"} Auto join de grupos *${enabled ? "activado" : "desactivado"}*\n╰━━━━━━━━━━━━╯`,
  );
}
async function autoJoinDetector(m, sock) {
  const db = getDatabase();
  if (!db?.ready) return false;
  if (!db.setting("autoJoinGc")) return false;
  if (!m.body) return false;
  const matches = [...m.body.matchAll(GROUP_LINK_REGEX)];
  if (!matches.length) return false;
  let joined = 0;
  for (const match of matches) {
    const code = match[1];
    try {
      const result = await sock.groupAcceptInvite(code);
      if (result) {
        joined++;
      }
    } catch (e) {
      const msg = e.message || String(e);
      if (msg.includes("already") || msg.includes("participant")) {
        await m.reply(`╰┈➤ ⚠️ Ya estoy en ese grupo`);
      } else if (msg.includes("expired") || msg.includes("revoked")) {
        await m.reply(`╰┈➤ ❌ El link del grupo está expirado/revocado`);
      } else {
        await m.reply(te(m.prefix, m.command, m.pushName));
      }
    }
  }
  return joined > 0;
}
export { pluginConfig as config, handler, autoJoinDetector };
