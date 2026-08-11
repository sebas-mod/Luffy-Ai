import { getDatabase } from "../../src/lib/luffy-database.js";
import { calculateLevel, getRole } from "../user/level.js";

const EXP_PER_LEVEL = 10000;

const pluginConfig = {
  name: "dellevel",
  alias: ["kuranglevel", "removelevel", "dellvl"],
  category: "owner",
  description: "Restar nivel a un usuario (vía exp)",
  usage: ".dellevel <jumlah> @user",
  example: ".dellevel 5 @user",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  carne: 0,
  isEnabled: true,
};

function extractTarget(m) {
  if (m.quoted) return m.quoted.sender;
  if (m.mentionedJid?.length) return m.mentionedJid[0];
  return null;
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args;

  const numArg = args.find((a) => !isNaN(a) && !a.startsWith("@"));
  let levels = parseInt(numArg) || 0;

  let targetJid = await extractTarget(m);

  if (!targetJid && levels > 0) {
    targetJid = m.sender;
  }

  if (!targetJid || levels <= 0) {
    return m.reply(
      `📊 *ʀᴇsᴛᴀʀ ɴɪᴠᴇʟ*\n\n` +
        `╭┈┈⬡「 📋 *ᴜsᴏ*\n` +
        `┃ > \`.dellevel <cantidad>\` - a ti mismo\n` +
        `┃ > \`.dellevel <cantidad> @user\` - a otra persona\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `> Ejemplo: \`${m.prefix}dellevel 5\``,
    );
  }

  const user = db.getUser(targetJid) || db.setUser(targetJid);

  const oldLevel = calculateLevel(user.exp || 0);
  const expToRemove = levels * EXP_PER_LEVEL;
  user.exp = Math.max(0, (user.exp || 0) - expToRemove);
  const newLevel = calculateLevel(user.exp);

  db.save();
  await m.react("✅");

  await m.reply(
    `✅ *ɴɪᴠᴇʟ ʀᴇsᴛᴀᴅᴏ*\n\n` +
      `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇ* 」\n` +
      `┃ 👤 ᴜsᴜᴀʀɪᴏ: @${targetJid.split("@")[0]}\n` +
      `┃ ➖ ʀᴇsᴛᴀᴅᴏ: *-${levels} Nivel*\n` +
      `┃ 🚄 ᴇxᴘ ʀᴇᴛɪʀᴀᴅᴏ: *-${expToRemove.toLocaleString("id-ID")}*\n` +
      `┃ 📊 ɴɪᴠᴇʟ: *${oldLevel} → ${newLevel}*\n` +
      `┃ ${getRole(newLevel)}\n` +
      `╰┈┈┈┈┈┈┈┈⬡`,
    { mentions: [targetJid] },
  );
}

export { pluginConfig as config, handler };
