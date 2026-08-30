import { getAssetBuffer } from "../../src/lib/luffy-asset-manager.js";
import { fileTypeFromBuffer } from "file-type";
import { config } from "../../config.js";
import te from "../../src/lib/luffy-error.js";
import { saluranCtx } from "../../src/lib/luffy-context.js";
import { generateWAMessage } from "ourin";

const botConfig = config;

function buildSyntheticSwGcRawMessage(sock, remoteJid, innerMessage, messageId) {
  const botJid = sock.user?.id?.split(":")[0] + "@s.whatsapp.net";
  return {
    key: {
      remoteJid,
      fromMe: true,
      id: messageId,
      participant: botJid,
    },
    message: {
      groupStatusMessageV2: {
        message: innerMessage,
      },
    },
    messageTimestamp: Math.floor(Date.now() / 1000),
  };
}

const pluginConfig = {
  name: "estado_grupo_v2_todo",
  alias: ["statusgrupv2all"],
  category: "owner",
  description: "Publicar Group Status V2 en TODOS los grupos",
  usage: ".swgcv2all <texto> o responde a un medio",
  example: ".swgcv2all ¡Hola a todos los grupos!",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.text || "";

  let rawContent = null;

  if (m.isMedia || (m.quoted && m.quoted.isMedia)) {
    let buffer;
    if (m.quoted && m.quoted.isMedia) {
      buffer = await m.quoted.download();
    } else if (m.isMedia) {
      buffer = await m.download();
    }

    if (!buffer) {
      return m.reply("☽◯☾ ♰ ❌ Error al descargar el media. Inténtalo de nuevo.");
    }

    const fileType = await fileTypeFromBuffer(buffer);
    const mime = fileType ? fileType.mime : "application/octet-stream";

    if (mime.startsWith("image/")) {
      rawContent = { image: buffer, caption: text };
    } else if (mime.startsWith("video/")) {
      rawContent = { video: buffer, caption: text };
    } else if (mime.startsWith("audio/")) {
      rawContent = {
        audio: buffer,
        mimetype: "audio/mpeg",
        ptt: m.quoted?.ptt || m.ptt || false,
      };
    } else {
      return m.reply("☽◯☾ ♰ ❌ Formato de media no soportado para SW GC.");
    }
  } else if (text) {
    rawContent = { text: text };
  } else {
    return m.reply(
      `👋 *sᴡɢᴄᴠ2 ᴀʟʟ ɢʟᴏʙᴀʟ*\n\n` +
      `> Envía un mensaje de *Estado de Grupo V2* a TODOS los grupos a la vez.\n\n` +
      `☽◯☾ ♰ 「 📋 *ᴄóᴍᴏ ᴜsᴀʀ* 」\n` +
      `┃ ${m.prefix}estado_grupo_v2_todo ¡Hola a todos!\n` +
      `┃ o responde una imagen/video con caption ${m.prefix}estado_grupo_v2_todo\n` +
      `╰━ ⊱༺༒༻⊰ ━╯`
    );
  }

  await m.react("🕕");

  try {
    const groups = await sock.groupFetchAllParticipating();
    const groupIds = Object.keys(groups);

    if (groupIds.length === 0) {
      await m.react("❌");
      return m.reply("☽◯☾ ♰ ❌ El bot no está en ningún grupo.");
    }

    await m.reply(`👑•─────•👑\n⏳ *Iniciando el broadcast del Estado de Grupo V2 a ${groupIds.length} grupos...*\n\n> Este proceso puede tardar unos momentos.\n♰ ──────── ♱`);

    let successCount = 0;
    let failCount = 0;

    for (const targetGroupId of groupIds) {
      try {
        let baseContent = {};
        if (rawContent.image) {
          baseContent = { image: rawContent.image, caption: rawContent.caption || "" };
        } else if (rawContent.video) {
          baseContent = { video: rawContent.video, caption: rawContent.caption || "" };
        } else if (rawContent.audio) {
          baseContent = { audio: rawContent.audio, mimetype: rawContent.mimetype || "audio/mpeg", ptt: rawContent.ptt || false };
        } else if (rawContent.text) {
          baseContent = { text: rawContent.text };
        }

        const genMsg = await generateWAMessage(targetGroupId, baseContent, {
          userJid: sock.user.id,
          upload: sock.waUploadToServer
        });

        const msgType = Object.keys(genMsg.message).find(k => k.endsWith('Message') && k !== 'senderKeyDistributionMessage');

        let mediaMessage = {};
        if (msgType) {
          mediaMessage[msgType] = genMsg.message[msgType];
          const newContextInfo = {
            isGroupStatus: true,
            statusSourceType: rawContent.text ? 4 : rawContent.audio ? 3 : rawContent.video ? 1 : 0,
            featureEligibilities: {
              canBeReshared: true,
              canBeSentToParticipants: true
            },
            statusAttributions: [
              {
                type: 10
              }
            ],
            statusAudienceMetadata: {
              audienceType: 1
            }
          };

          if (mediaMessage[msgType].contextInfo) {
            Object.assign(mediaMessage[msgType].contextInfo, newContextInfo);
          } else {
            mediaMessage[msgType].contextInfo = newContextInfo;
          }
        }

        const messageId = genMsg.key.id;
        const finalMessage = buildSyntheticSwGcRawMessage(
          sock,
          targetGroupId,
          mediaMessage,
          messageId
        );

        await sock.relayMessage(targetGroupId, finalMessage.message, {
          messageId: messageId,
        });
        
        successCount++;
      } catch (err) {
        failCount++;
      }
    }

    await m.react("✅");
    await m.reply(
      `✅ *sᴡɢᴄᴠ2 ᴀʟʟ ᴄᴏᴍᴘʟᴇᴛᴀᴅᴏ*\n\n` +
      `☽◯☾ ♰ 「 📊 *ʀᴇsᴜʟᴛᴀᴅᴏ* 」\n` +
      `┃ 🌐 Total de Grupos: *${groupIds.length}*\n` +
      `┃ ✅ Exitosos: *${successCount}*\n` +
      `┃ ❌ Errores: *${failCount}*\n` +
      `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
      `> ¡El broadcast del Estado de Grupo V2 (Ring Pink) se envió con éxito a todos los grupos!`
    );

  } catch (error) {
    console.error("[SwgcV2All] Error:", error.message);
    await m.react("☢");
    await m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
