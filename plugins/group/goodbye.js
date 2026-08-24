import {
  cacheParticipantLids,
  getCachedJid,
  isLid,
  isLidConverted,
  lidToJid,
} from "../../src/lib/luffy-lid.js";
import moment from "moment-timezone";
import config from "../../config.js";
import { getDatabase } from "../../src/lib/luffy-database.js";
import { saluranCtx } from "../../src/lib/luffy-context.js";
import { createGoodbyeCard } from "../../src/lib/luffy-welcome-card.js";
import { resolveAnyLidToJid } from "../../src/lib/luffy-lid.js";
import path from "path";
import fs from "fs";
import te from "../../src/lib/luffy-error.js";
import { getAssetBuffer } from "../../src/lib/luffy-asset-manager.js";
import { prepareWAMessageMedia, generateWAMessageFromContent } from "ourin";
function resolvePlaceholders(
  template,
  username,
  groupName,
  groupDesc,
  memberCount,
  groupOwner,
  prefix,
) {
  const now = moment().tz("Asia/Jakarta");
  const dayNames = {
    Sunday: "Domingo",
    Monday: "Lunes",
    Tuesday: "Martes",
    Wednesday: "Miércoles",
    Thursday: "Jueves",
    Friday: "Viernes",
    Saturday: "Sábado",
  };
  const dayId = dayNames[now.format("dddd")] || now.format("dddd");
  return template
    .replace(/{user}/gi, `@${username}`)
    .replace(/{number}/gi, username)
    .replace(/{group}/gi, groupName || "Grupo")
    .replace(/{desc}/gi, groupDesc || "")
    .replace(/{count}/gi, memberCount?.toString() || "0")
    .replace(/{owner}/gi, groupOwner || "Admin")
    .replace(/{date}/gi, now.format("DD/MM/YYYY"))
    .replace(/{time}/gi, now.format("HH:mm"))
    .replace(/{day}/gi, dayId)
    .replace(/{bot}/gi, config.bot?.name || "Luffy")
    .replace(/{prefix}/gi, prefix);
}
const pluginConfig = {
  name: "goodbye",
  alias: ["bye", "leave"],
  category: "group",
  description: "Configurar el mensaje de despedida para el grupo",
  usage: ".goodbye <on/off>",
  example: ".goodbye on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};
// eslint-disable-next-line require-await
async function buildGoodbyeMessage(
  participant,
  groupName,
  groupDesc,
  memberCount,
  customMsg = null,
  groupOwner = "",
  prefix = ".",
) {
  const farewells = [
    `Sayonara`,
    `Hasta pronto`,
    `Bye bye`,
    `Adiós`,
    `Nos vemos`,
    `Cuídate`,
    `Oyasumi~`,
  ];
  const quotes = [
    `Que tu camino se llene de facilidades de ahora en adelante.`,
    `Gracias por haber sido parte de este grupo.`,
    `Esperamos que nos volvamos a ver en otra ocasión.`,
    `La puerta siempre está abierta si algún día quieres volver.`,
    `Cuídate mucho, tomodachi.`,
    `Los recuerdos de aquí siempre quedarán.`,
  ];
  const emojis = ["🌙", "👋", "🥀", "💫", "😢", "🤍"];
  const headers = [
    `🌙 Oyasumi~ minna-san...
Hoy un tomodachi debe despedirse.
Que su nuevo camino esté lleno de cosas buenas.`,
    `🥀 Minna-san...
Hoy hay una pequeña despedida.
Gracias por haber caminado a nuestro lado.`,
    `💫 Sayonara~
No es el final, solo un hasta pronto.
Que tus días siempre estén llenos de calidez.`,
    `🌌 Minna-san...
Una estrella cambia de cielo esta noche.
Deseémosle lo mejor.`,
  ];
  const farewell = farewells[Math.floor(Math.random() * farewells.length)];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  const header = headers[Math.floor(Math.random() * headers.length)];
  const username = participant?.split("@")[0] || "Usuario";
  const now = moment().tz("Asia/Jakarta");
  const dayNames = {
    Sunday: "Domingo",
    Monday: "Lunes",
    Tuesday: "Martes",
    Wednesday: "Miércoles",
    Thursday: "Jueves",
    Friday: "Viernes",
    Saturday: "Sábado",
  };
  const dayId = dayNames[now.format("dddd")] || now.format("dddd");
  if (customMsg) {
    return resolvePlaceholders(
      customMsg,
      username,
      groupName,
      groupDesc,
      memberCount,
      groupOwner,
      prefix,
    );
  }
  let msg = `👋🏻 *SAYONARA MIEMBRO* 👋🏻\n\n`;
  msg += `${header}\n`;
  msg += `${emoji} ${farewell}, *@${username}* 🤍\n\n`;
  msg += `📌 *INFO DEL GRUPO*\n`;
  msg += `> 🏠 *Nombre* : ${groupName}\n`;
  msg += `> 👥 *Miembros Restantes* : ${memberCount}\n`;
  msg += `> 📅 *Fecha* : ${now.format("DD/MM/YYYY")}\n\n`;
  msg += `💌 *Mensaje*\n> 「 ${quote} 」\n\n🌸 _Hasta pronto, tomodachi._ 🤍`;

  return msg;

  return msg;
}
async function sendGoodbyeMessage(sock, groupJid, participant, groupMeta) {
  try {
    const db = getDatabase();
    const groupData = db.getGroup(groupJid);
    if (groupData?.goodbye !== true && groupData?.leave !== true) return false;
    const goodbyeType = db.setting("goodbyeType") || 1;
    if (groupMeta?.participants) {
      cacheParticipantLids(groupMeta.participants);
    }
    let realParticipant = participant;
    const cachedJid = getCachedJid(participant);
    if (cachedJid && !isLidConverted(cachedJid)) {
      realParticipant = cachedJid;
    } else if (isLid(participant)) {
      const lidFormat = participant;
      const cachedFromLid = getCachedJid(lidFormat);
      if (cachedFromLid && !isLidConverted(cachedFromLid)) {
        realParticipant = cachedFromLid;
      } else {
        realParticipant = lidToJid(participant);
      }
    } else if (isLidConverted(participant)) {
      const lidNumber = participant.replace("@s.whatsapp.net", "");
      const lidFormat = lidNumber + "@lid";
      const cachedFromLid = getCachedJid(lidFormat);
      if (cachedFromLid && !isLidConverted(cachedFromLid)) {
        realParticipant = cachedFromLid;
      }
    }
    const memberCount = groupMeta?.participants?.length || 0;
    const groupName = groupMeta?.subject || "Grupo";
    let userName = realParticipant?.split("@")[0] || "Usuario";
    let ppUrl = "https://files.catbox.moe/wmib77.jpg";
    try {
      ppUrl = (await sock.profilePictureUrl(realParticipant, "image")) || ppUrl;
    } catch { }
    const text = await buildGoodbyeMessage(
      realParticipant,
      groupMeta?.subject,
      groupMeta?.descOwner,
      memberCount,
      groupData?.goodbyeMsg,
      groupMeta?.owner?.split("@")[0] || "",
      config.command?.prefix || ".",
    );
    const saluranId = config.saluran?.id || "120363400911374213@newsletter";
    const saluranName = config.saluran?.name || config.bot?.name || "Luffy-Ai";
    if (goodbyeType === 2) {
      const cardBody = groupData?.goodbyeMsg
        ? resolvePlaceholders(
          groupData.goodbyeMsg,
          userName,
          groupMeta?.subject,
          groupMeta?.desc,
          memberCount,
          groupMeta?.owner?.split("@")[0] || "",
          config.command?.prefix || ".",
        )
        : `Gracias por haber estado en *${groupName}*\nQuedan ${memberCount} miembros`;
      await sock.sendMessage(groupJid, {
        interactiveMessage: {
          body: {
            text: "╰┈➤ "+`👋 *Sayonara* *@${userName}*`,
          },
          footer: { text: config.bot?.name || "Luffy-Ai" },
          header: { title: "Despedida", hasMediaAttachment: false },
          carouselMessage: {
            cards: [
              {
                header: {
                  imageMessage: { url: ppUrl },
                },
                body: {
                  text: cardBody,
                },
                footer: { text: config.bot?.name || "Luffy-Ai" },
                nativeFlowMessage: {
                  buttons: [
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({
                        display_text: "👋 Hasta pronto",
                        id: "bye",
                      }),
                    },
                  ],
                },
              },
            ],
            messageVersion: 1,
            carouselCardType: 1,
          },
          contextInfo: {
            ...saluranCtx(),
            mentionedJid: [realParticipant],
          },
        },
      });
    } else if (goodbyeType === 3) {
      const textOnly = groupData?.goodbyeMsg
        ? resolvePlaceholders(
          groupData.goodbyeMsg,
          userName,
          groupMeta?.subject,
          groupMeta?.desc,
          memberCount,
          groupMeta?.owner?.split("@")[0] || "",
          config.command?.prefix || ".",
        )
        : `*Sayonara* @${userName} 👋`;
      await sock.sendMessage(groupJid, {
        text: textOnly,
        contextInfo: {
          ...saluranCtx(),
          mentionedJid: [realParticipant],
          forwardedNewsletterMessageInfo: {
            newsletterName: config?.saluran?.name,
            newsletterJid: config?.saluran?.id,
          },
        },
      });
    } else if (goodbyeType === 4) {
      await sock.sendText(groupJid, text, null, {
        mentions: [realParticipant],
        contextInfo: {
          ...saluranCtx(),
          mentionedJid: [realParticipant],
        },
      });
    } else if (goodbyeType === 5) {
      await sock.sendPreview(
        groupJid,
        {
          caption: "https://goodbye.guys " + text,
          url: "https://goodbye.guys",
          title: `Despedida de ${groupName}`,
          description: `👋 Sayonara @${userName}!`,
          image: ppUrl,
          previewType: 1,
        },
        {
          contextInfo: {
            mentionedJid: [realParticipant],
          }
        }
      );
    } else if (goodbyeType === 6) {
      await sock.sendMessage(groupJid, {
        video: getAssetBuffer("luffy-mp4") || { url: "https://files.catbox.moe/k28dhp.mp4" },
        gifPlayback: true,
        caption: text,
        contextInfo: {
          mentionedJid: [realParticipant],
        }
      });
    } else if (goodbyeType === 7) {
      const qFake = {
        key: {
          fromMe: false,
          participant: realParticipant,
          remoteJid: realParticipant
        },
        message: {
          conversation: `¡Adiós a todos! 👋`
        }
      };

      const media = await prepareWAMessageMedia({
        image: { url: ppUrl }
      }, { upload: sock.waUploadToServer });

      const msg = generateWAMessageFromContent(groupJid, {
        viewOnceMessage: {
          message: {
            messageContextInfo: {},
            interactiveMessage: {
              header: {
                title: "",
                subtitle: "",
                hasMediaAttachment: true,
                imageMessage: media.imageMessage
              },
              body: {
                text: text
              },
              footer: {
                text: config.bot?.name || "Luffy-Ai"
              },
              contextInfo: {
                mentionedJid: [realParticipant],
                isForwarded: true,
                forwardingScore: 9,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: saluranId,
                  newsletterName: saluranName,
                  serverMessageId: 127,
                },
              },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                      display_text: "👋 Hasta pronto",
                      id: "bye"
                    })
                  }
                ]
              }
            }
          }
        }
      }, { quoted: qFake, userJid: sock.user.jid });

      await sock.relayMessage(groupJid, msg.message, {
        messageId: msg.key.id,
      });
    } else if (goodbyeType === 8) {
      await sock.sendMessage(groupJid, {
        text: "୨୧〔 ❀ DESPEDIDA 〕୨୧\n"+`Adiós @${userName}, gracias por estar en el grupo ${groupName}`+"\n♡ ────── ♡",
        mentions: [realParticipant],
      });
    } else {
      let canvasBuffer = null;
      try {
        canvasBuffer = await createGoodbyeCard(
          userName,
          ppUrl,
          groupName,
          memberCount.toLocaleString(),
        );
      } catch (e) {
        console.error("Goodbye Canvas Error:", e.message);
      }
      await sock.sendMessage(groupJid, {
        image: canvasBuffer,
        caption: text,
        mentions: [realParticipant],
        contextInfo: {
          ...saluranCtx(),
          mentionedJid: [realParticipant],
          forwardedNewsletterMessageInfo: {
            newsletterJid: saluranId,
            newsletterName: saluranName,
            serverMessageId: 127,
          },
        },
      });
    }
    return true;
  } catch (error) {
    console.error("Goodbye Error:", error);
    return false;
  }
}
async function handler(m, { sock }) {
  const db = getDatabase();
  const args = m.args || [];
  const sub = args[0]?.toLowerCase();
  const sub2 = args[1]?.toLowerCase();
  const groupData = db.getGroup(m.chat) || {};
  const currentStatus = groupData.goodbye === true;
  if (sub === "on" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply("╰┈➤ "+`❌ Solo el owner puede usar esta función!`);
    }
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { goodbye: true, leave: true });
        count++;
      }
      m.react("✅");
      return m.reply(
        `✅ *ᴅᴇsᴘᴇᴅɪᴅᴀ ɢʟᴏʙᴀʟ ᴏɴ*\n\n` +
        `> Despedida activada en *${count}* grupos!`,
      );
    } catch (err) {
      m.react("☢");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  if (sub === "off" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply("╰┈➤ "+`❌ Solo el owner puede usar esta función!`);
    }
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { goodbye: false, leave: false });
        count++;
      }
      m.react("✅");
      return m.reply(
        `❌ *ᴅᴇsᴘᴇᴅɪᴅᴀ ɢʟᴏʙᴀʟ ᴏꜰꜰ*\n\n` +
        `> Despedida desactivada en *${count}* grupos!`,
      );
    } catch (err) {
      m.react("☢");
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }
  if (sub === "on") {
    if (currentStatus) {
      return m.reply(
        `⚠️ *ᴅᴇsᴘᴇᴅɪᴅᴀ ʏᴀ ᴀᴄᴛɪᴠᴀ*\n\n` +
        `> Estado: *✅ ON*\n` +
        `> La despedida ya está activa en este grupo.\n\n` +
        `_Usa \`${m.prefix}goodbye off\` para desactivarla._`,
      );
    }
    db.setGroup(m.chat, { goodbye: true, leave: true });
    return m.reply(
      `✅ *ᴅᴇsᴘᴇᴅɪᴅᴀ ᴀᴄᴛɪᴠᴀ*\n\n` +
      `> El mensaje de despedida se activó correctamente!\n` +
      `> Los miembros que salgan recibirán un mensaje.\n\n` +
      `_Usa \`${m.prefix}configurar_despedida\` para personalizar el mensaje._`,
    );
  }
  if (sub === "off") {
    if (!currentStatus) {
      return m.reply(
        `⚠️ *ᴅᴇsᴘᴇᴅɪᴅᴀ ʏᴀ ɪɴᴀᴄᴛɪᴠᴀ*\n\n` +
        `> Estado: *❌ OFF*\n` +
        `> La despedida ya está inactiva en este grupo.\n\n` +
        `_Usa \`${m.prefix}goodbye on\` para activarla._`,
      );
    }
    db.setGroup(m.chat, { goodbye: false, leave: false });
    return m.reply(
      `❌ *ᴅᴇsᴘᴇᴅɪᴅᴀ ɪɴᴀᴄᴛɪᴠᴀ*\n\n` +
      `> El mensaje de despedida se desactivó correctamente.\n` +
      `> Los miembros que salgan no recibirán mensaje.`,
    );
  }
  m.reply(
    `👋 *ᴄᴏɴꜰɪɢᴜʀᴀᴄɪóɴ ᴅᴇ ᴅᴇsᴘᴇᴅɪᴅᴀ*\n\n` +
    `> Estado: *${currentStatus ? "✅ ON" : "❌ OFF"}*\n\n` +
    `\`\`\`━━━ ᴏᴘᴄɪᴏɴᴇs ━━━\`\`\`\n` +
    `> \`${m.prefix}goodbye on\` → Activar\n` +
    `> \`${m.prefix}goodbye off\` → Desactivar\n` +
    `> \`${m.prefix}goodbye on all\` → Global ON (owner)\n` +
    `> \`${m.prefix}goodbye off all\` → Global OFF (owner)\n` +
    `> \`${m.prefix}configurar_despedida\` → Personalizar mensaje\n` +
    `> \`${m.prefix}resetear_despedida\` → Restablecer predeterminado`,
  );
}
export { pluginConfig as config, handler, sendGoodbyeMessage };
