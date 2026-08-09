import {
  getParticipantJid,
  getParticipantJids,
} from "../../src/lib/luffy-lid.js";
import te from "../../src/lib/luffy-error.js";
const pluginConfig = {
  name: "tagall",
  alias: ["all", "everyone"],
  category: "group",
  description: "Etiquetar a todos los miembros del grupo",
  usage: ".tagall <mensaje>",
  example: ".tagall Hola a todos!",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 30,
  carne: 0,
  isEnabled: true,
  isAdmin: true,
  isBotAdmin: false,
};

async function handler(m, { sock }) {
  const text = m.text || "Etiquetar a Todos los Miembros";

  try {
    const groupMeta = m.groupMetadata;
    const participants = groupMeta.participants || [];

    if (participants.length === 0) {
      await m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> No hay miembros en este grupo.`);
      return;
    }

    const targetParticipants = participants.filter((participant) => {
      return getParticipantJid(participant) !== m.sender;
    });

    if (targetParticipants.length === 0) {
      await m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> No hay otros miembros para etiquetar.`);
      return;
    }

    const mentions = getParticipantJids(targetParticipants);
    const memberList = targetParticipants
      .map((participant) => `@${getParticipantJid(participant).split("@")[0]}`)
      .join("\n")
      .trim();

    await m.reply(
      `*Mensaje:* ${text}\n\n` +
        `\`\`\`━━━ ${targetParticipants.length} MIEMBROS EN TOTAL ━━━\`\`\`\n` +
        memberList,
      { mentions: mentions },
    );
  } catch (error) {
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
