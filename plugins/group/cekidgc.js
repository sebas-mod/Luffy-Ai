import sharp from "sharp";
import config from "../../config.js";
import axios from "axios";
import { generateWAMessageFromContent, proto } from "ourin";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "cekidgc",
  alias: ["idgc", "idgrup", "groupid", "infogc", "groupinfo"],
  category: "group",
  description: "Verificar ID e información completa del grupo",
  usage: ".cekidgc [link grup]",
  example: ".cekidgc https://chat.whatsapp.com/xxxxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  isAdmin: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function formatDate(timestamp) {
  if (!timestamp) return "—";
  const d = new Date(
    typeof timestamp === "number" && timestamp < 1e12
      ? timestamp * 1000
      : timestamp,
  );
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function handler(m, { sock }) {
  await m.react("⏳");

  try {
    const input = m.text?.trim();
    let groupJid = null;
    let groupMeta = null;

    if (input && input.includes("chat.whatsapp.com/")) {
      const inviteCode = input
        .split("chat.whatsapp.com/")[1]
        ?.split(/[\s?]/)[0];

      if (!inviteCode) {
        m.react("✘");
        return m.reply(`── .✦ ──\n\n> Link de grupo no válido .☘︎ ݁˖`);
      }

      try {
        groupMeta = await sock.groupGetInviteInfo(inviteCode);
        groupJid = groupMeta?.id;
      } catch {
        m.react("✘");
        return m.reply(
          `── .✦ ──\n\n> Link de grupo no válido o ya expirado .☘︎ ݁˖`,
        );
      }
    } else if (input && input.endsWith("@g.us")) {
      groupJid = input;
      try {
        groupMeta = await sock.groupMetadata(groupJid);
      } catch {
        m.react("✘");
        return m.reply(
          `── .✦ ──\n\n> No se puede acceder a ese grupo .☘︎ ݁˖`,
        );
      }
    } else if (m.isGroup) {
      groupJid = m.chat;
      groupMeta = await sock.groupMetadata(groupJid);
    } else {
      return m.reply(
        `── .✦ 𝗖𝗘𝗞 𝗜𝗗 𝗚𝗥𝗨𝗣 ✦. ── 𝜗ৎ\n\n` +
          `> Usa en grupo o ingresa link del grupo\n\n` +
          `> \`${m.prefix}cekidgc\` — dentro del grupo\n` +
          `> \`${m.prefix}cekidgc https://chat.whatsapp.com/xxx\``,
      );
    }

    if (!groupMeta || !groupJid) {
      m.react("✘");
      return m.reply(`── .✦ ──\n\n> No se pudo encontrar información del grupo .☘︎ ݁˖`);
    }

    const groupName = groupMeta.subject || "Unknown";
    const participants = groupMeta.participants || [];
    const memberCount = participants.length || groupMeta.size || 0;
    const admins = participants.filter(
      (p) => p.admin === "admin" || p.admin === "superadmin",
    );
    const adminCount = admins.length;
    const groupOwner = groupMeta.owner || groupMeta.subjectOwner || "—";
    const createdAt = formatDate(groupMeta.creation);
    const groupDesc = groupMeta.desc || "—";
    const descPreview =
      groupDesc.length > 120 ? groupDesc.slice(0, 120) + "..." : groupDesc;
    const isRestrict = groupMeta.restrict ? "Solo Admin" : "Todos los Miembros";
    const isAnnounce = groupMeta.announce ? "Activo" : "Inactivo";
    const isCommunity = groupMeta.isCommunity ? "✓ Sí" : "✘ No";
    const joinMode = groupMeta.joinApprovalMode ? "Requiere Aprobación" : "Libre";

    let ppBuffer = null;
    try {
      const ppUrl = await sock.profilePictureUrl(groupJid, "image");
      if (ppUrl) {
        ppBuffer = Buffer.from(
          (
            await axios.get(ppUrl, {
              responseType: "arraybuffer",
              timeout: 10000,
            })
          ).data,
        );
      }
    } catch {}

    const saluranId = config.saluran?.id || "120363400911374213@newsletter";
    const saluranName = config.saluran?.name || config.bot?.name || "Luffy-AI";

    const infoText =
      `── .✦ 𝗚𝗥𝗢𝗨𝗣 𝗜𝗡𝗙𝗢 ✦. ── 𝜗ৎ\n\n` +
      `╭─〔 ${groupName} 〕───⬣\n` +
      `│  ✦ ɴᴀᴍᴀ        : *${groupName}*\n` +
      `│  ✦ ɪᴅ             : \`${groupJid}\`\n` +
      `│  ✦ ᴍᴇᴍʙᴇʀ     : *${memberCount}*\n` +
      `│  ✦ ᴀᴅᴍɪɴ        : *${adminCount}*\n` +
      `│  ✦ ᴏᴡɴᴇʀ       : @${groupOwner.replace(/@.+/g, "")}\n` +
      `│  ✦ ᴄʀᴇᴀᴅᴏ       : *${createdAt}*\n` +
      `│  ✦ ᴄᴏᴍᴜɴɪᴅᴀᴅ : *${isCommunity}*\n` +
      `│  ✦ ᴇᴅɪᴛᴀʀ ɪɴꜰᴏ   : *${isRestrict}*\n` +
      `│  ✦ ᴀɴɴᴏᴜɴᴄᴇ : *${isAnnounce}*\n` +
      `│  ✦ ᴊᴏɪɴ ᴍᴏᴅᴇ  : *${joinMode}*\n` +
      `│  ✦ ᴅᴇsᴄʀɪᴘᴄɪóɴ  : ${descPreview}\n` +
      `╰──────────────⬣\n\n` +
      `.☘︎ ݁˖ © ${config.bot?.name || "Luffy-AI"}`;

    const buttons = [
      {
        name: "cta_copy",
        buttonParamsJson: JSON.stringify({
          display_text: "✦ Copiar ID del Grupo",
          copy_code: groupJid,
        }),
      },
    ];

    if (ppBuffer) {
      let headerMedia = null;
      try {
        const resized = await sharp(ppBuffer)
          .resize(300, 300, { fit: "cover" })
          .jpeg({ quality: 80 })
          .toBuffer();
        headerMedia = await prepareWAMessageMedia(
          { image: resized },
          { upload: sock.waUploadToServer },
        );
      } catch {}

      const msg = generateWAMessageFromContent(
        m.chat,
        {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
              },
              interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                body: proto.Message.InteractiveMessage.Body.fromObject({
                  text: infoText,
                }),
                footer: proto.Message.InteractiveMessage.Footer.fromObject({
                  text: `© ${config.bot?.name || "Luffy-AI"}`,
                }),
                header: proto.Message.InteractiveMessage.Header.fromObject({
                  hasMediaAttachment: !!headerMedia,
                  ...(headerMedia || {}),
                }),
                nativeFlowMessage:
                  proto.Message.InteractiveMessage.NativeFlowMessage.fromObject(
                    { buttons },
                  ),
                contextInfo: {
                  mentionedJid: [m.sender, groupOwner],
                  forwardingScore: 9999,
                  isForwarded: true,
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: saluranId,
                    newsletterName: saluranName,
                    serverMessageId: 127,
                  },
                },
              }),
            },
          },
        },
        { userJid: m.sender, quoted: m },
      );

      await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    } else {
      const msg = generateWAMessageFromContent(
        m.chat,
        {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
              },
              interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                body: proto.Message.InteractiveMessage.Body.fromObject({
                  text: infoText,
                }),
                footer: proto.Message.InteractiveMessage.Footer.fromObject({
                  text: `© ${config.bot?.name || "Luffy-AI"}`,
                }),
                nativeFlowMessage:
                  proto.Message.InteractiveMessage.NativeFlowMessage.fromObject(
                    { buttons },
                  ),
                contextInfo: {
                  mentionedJid: [m.sender, groupOwner],
                  forwardingScore: 9999,
                  isForwarded: true,
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: saluranId,
                    newsletterName: saluranName,
                    serverMessageId: 127,
                  },
                },
              }),
            },
          },
        },
        { userJid: m.sender, quoted: m },
      );

      await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    }

    await m.react("✓");
  } catch (error) {
    console.error("[CekIdGc] Error:", error.message);
    await m.react("✘");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
