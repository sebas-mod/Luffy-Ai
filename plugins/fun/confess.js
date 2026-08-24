import config from "../../config.js";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "confess",
  alias: ["confession", "menfess", "anonim"],
  category: "fun",
  description: "Envía un mensaje anónimo a alguien",
  usage: ".confess número|mensaje",
  example: ".confess 6281234567890|¡Hola, me gustas!",
  isOwner: false,
  isPremium: true,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  carne: 1,
  isEnabled: true,
};

if (!global.confessData) global.confessData = new Map();

async function handler(m, { sock }) {
  const input = m.fullArgs?.trim() || m.text?.trim();

  if (!input || !input.includes("|")) {
    let txt = `💌 *SERVICIO DE MENFESS ANÓNIMO* 💌\n\n`;
    txt += `¿Quieres enviar un mensaje secreto a tu crush o a un amigo sin que te descubran? ¡Claro que puedes!\n\n`;
    txt += `*Cómo Usar:*\n`;
    txt += `👉 \`${m.prefix}confess número|mensaje\`\n\n`;
    txt += `*Ejemplo:*\n`;
    txt += `> \`${m.prefix}confess 6281234567890|¡Hola, me encanta tu sonrisa!\`\n\n`;
    txt += `> 🤫 _Tranquilo, tu identidad está 100% segura y protegida!_`;
    return m.reply(txt);
  }

  const [rawNumber, ...messageParts] = input.split("|");
  const message = messageParts.join("|").trim();

  if (!rawNumber || !message) {
    return m.reply(`¡Ups, el formato es incorrecto! 😅\n\nIntenta escribirlo así: \`${m.prefix}confess número|mensaje\``);
  }

  let targetNumber = rawNumber.trim().replace(/[^0-9]/g, "");

  if (targetNumber.startsWith("0")) {
    targetNumber = "62" + targetNumber.slice(1);
  }

  if (targetNumber.length < 10 || targetNumber.length > 15) {
    return m.reply(`Hmm, el número de destino que ingresaste no parece válido 🤔`);
  }

  const targetJid = targetNumber + "@s.whatsapp.net";
  const senderNumber = m.sender.split("@")[0];

  if (targetNumber === senderNumber) {
    return m.reply(`¿Vas a enviarte un menfess a ti mismo? ¡Mejor dáselo a otra persona! 😂`);
  }

  try {
    const [onWa] = await sock.onWhatsApp(targetNumber);
    if (!onWa?.exists) {
      return m.reply(`Vaya, el número \`${targetNumber}\` no está registrado en WhatsApp! 😔`);
    }
  } catch (e) {}

  if (message.length < 5) {
    return m.reply(`¡El mensaje es muy corto! Mínimo 5 caracteres para que tenga más significado. 📝`);
  }

  if (message.length > 1000) {
    return m.reply(`¡El mensaje es muy largo! Máximo 1000 caracteres para que no sea difícil de leer. 📜`);
  }

  const confessText = `💌 *¡HAY UN MENSAJE SECRETO PARA TI!* 💌\n\n` +
    `Shhh.. Hay alguien que te envió un mensaje en secreto:\n\n` +
    `💬 *Contenido del Mensaje:*\n` +
    `\`\`\`${message}\`\`\`\n\n` +
    `> 🔒 _Este mensaje se envió de forma anónima (la identidad del remitente se mantiene en secreto)._\n` +
    `> ✉️ _¡Puedes responder este mensaje! Solo *RESPONDE* al mensaje!_`;

  try {
    const sentMsg = await sock.sendMessage(targetJid, {
      text: confessText,
      contextInfo: {
        forwardingScore: 99,
        isForwarded: true,
      },
    });

    global.confessData.set(sentMsg.key.id, {
      senderJid: m.sender,
      senderChat: m.chat,
      targetJid: targetJid,
      createdAt: Date.now(),
    });

    setTimeout(() => {
      global.confessData.delete(sentMsg.key.id);
    }, 24 * 60 * 60 * 1000);

    let successTxt = `✅ ──────────\n*¡MENFESS ENVIADO CON ÉXITO!* ✅\n──────────\n\n`;
    successTxt += `> 📱 Enviado a: \`${targetNumber}\`\n`;
    successTxt += `> 🔒 ¡Tu identidad está a salvo!\n\n`;
    successTxt += `> _Si responde el mensaje, te lo haré llegar aquí. ¡Tranquilo!_ 😉`;
    await m.reply(successTxt);
  } catch (error) {
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

async function replyHandler(m, { sock }) {
  if (!m.quoted) return false;

  const quotedId = m.quoted?.id || m.quoted?.key?.id;
  if (!quotedId) return false;

  const confessInfo = global.confessData.get(quotedId);
  if (!confessInfo) return false;

  if (m.sender !== confessInfo.targetJid) return false;

  const replyMessage = m.body?.trim();
  if (!replyMessage) return false;

  const saluranId = config.saluran?.id || "120363400911374213@newsletter";
  const saluranName = config.saluran?.name || config.bot?.name || "Luffy-Ai";

  const replyText = `💌 *¡HAY UNA RESPUESTA DE MENFESS!* 💌\n\n` +
    `La persona a la que le enviaste el menfess acaba de responder tu mensaje:\n\n` +
    `💬 *Contenido de la Respuesta:*\n` +
    `\`\`\`${replyMessage}\`\`\`\n\n` +
    `> 🔒 _Tranquilo, tu identidad sigue segura!_`;

  try {
    await sock.sendMessage(confessInfo.senderChat, {
      text: replyText,
      contextInfo: {
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: saluranId,
          newsletterName: saluranName,
          serverMessageId: 127,
        },
      },
    });

    await sock.sendMessage(m.chat, {
      text: `✅ ¡Listo! Tu respuesta ya se la envié al remitente secreto.`,
    });

    global.confessData.delete(quotedId);
    return true;
  } catch (error) {
    return false;
  }
}

export { pluginConfig as config, handler, replyHandler };
