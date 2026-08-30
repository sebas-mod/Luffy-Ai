import config from "../../config.js";
import { saluranCtx } from "../../src/lib/luffy-context.js";
import te from "../../src/lib/luffy-error.js";
import { findParticipantByNumber } from "../../src/lib/luffy-lid.js";

const pluginConfig = {
  name: "join",
  alias: ["joingrup", "joingroup", "gabung"],
  category: "owner",
  description: "El bot se une a grupos mediante enlace de invitación, admite responder mensajes con enlace",
  usage: ".join <enlace> / .join (responde un mensaje con enlace)",
  example: ".join https://chat.whatsapp.com/xxx",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

function extractAllInviteCodes(text) {
  if (!text) return [];
  const codes = [];
  const seen = new Set();

  const patterns = [
    /chat\.whatsapp\.com\/([a-zA-Z0-9]{20,})/gi,
    /invite\.whatsapp\.com\/([a-zA-Z0-9]{20,})/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const code = match[1];
      if (!seen.has(code)) {
        seen.add(code);
        codes.push(code);
      }
    }
  }

  return codes;
}

async function joinGroup(sock, inviteCode) {
  try {
    const groupInfo = await sock.groupGetInviteInfo(inviteCode);
    if (!groupInfo) return { success: false, error: "No se pudo obtener la info del grupo" };

    const botNum = sock.user?.id?.split(":")[0] || "";
    const botLid = sock.user?.lid ? String(sock.user.lid).replace(/@.+/g, "") : null;
    const botJid = botNum ? botNum + "@s.whatsapp.net" : "";
    const isMember =
      (botJid
        ? findParticipantByNumber(groupInfo.participants || [], botJid) !== null
        : false) ||
      (botLid
        ? (groupInfo.participants || []).some((p) => {
            const pLidNum = String(p.lid || p.id || "").replace(/@.+/g, "");
            return pLidNum === botLid;
          })
        : false);

    if (isMember) {
      return {
        success: false,
        alreadyMember: true,
        subject: groupInfo.subject || "Unknown",
      };
    }

    await sock.groupAcceptInvite(inviteCode);
    return {
      success: true,
      subject: groupInfo.subject || "Unknown",
      members: groupInfo.size || groupInfo.participants?.length || 0,
      owner: groupInfo.owner?.split("@")[0] || "Unknown",
    };
  } catch (error) {
    let errorMsg = error.message || "Enlace no válido";
    if (errorMsg.includes("not-authorized")) errorMsg = "El enlace ya no es válido o ha expirado";
    else if (errorMsg.includes("gone") || errorMsg.includes("item-not-found") || errorMsg.includes("404")) errorMsg = "Grupo no encontrado (enlace inválido/revocado)";
    else if (errorMsg.includes("conflict")) errorMsg = "El bot ya es miembro";
    else errorMsg = "Enlace no válido o el bot tiene prohibido unirse";
    return { success: false, error: errorMsg };
  }
}

async function handler(m, { sock }) {
  const input = m.args.join(" ").trim();
  let sourceText = input;

  if (!input && m.quoted) {
    sourceText = m.quoted.body || m.quoted.text || m.quoted.contentText || "";
  }

  if (!sourceText) {
    return m.reply(
      `🔗 *Unirse al Grupo*\n\n` +
        `El bot se unirá al grupo según el enlace de invitación que proporciones.\n\n` +
        `*USO:*\n` +
        `> *${m.prefix}join <enlace>* — Unirse directamente por enlace\n` +
        `> *${m.prefix}join* (responder mensaje) — Unirse desde el enlace del mensaje respondido\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}join https://chat.whatsapp.com/xxx*\n` +
        `> Responde un mensaje con enlace y escribe *${m.prefix}join*\n\n` +
        `_El bot detectará todos los enlaces de grupo en el mensaje y se unirá uno por uno_`
    );
  }

  const inviteCodes = extractAllInviteCodes(sourceText);

  if (inviteCodes.length === 0) {
    return m.reply(
      `❌ *Sin Enlace de Grupo*\n\n` +
        `> El bot no encontró enlaces de invitación de grupo en el mensaje.\n\n` +
        `*Formatos de enlace compatibles:*\n` +
        `> *https://chat.whatsapp.com/xxx*\n` +
        `> *https://invite.whatsapp.com/xxx*`
    );
  }

  m.react("🕕");

  if (inviteCodes.length === 1) {
    const result = await joinGroup(sock, inviteCodes[0]);

    if (result.alreadyMember) {
      m.react("❌");
      return m.reply(
        `👑•─────•👑\n❌ *Ya es Miembro*\n\n> El bot ya está unido al grupo *${result.subject}*\n♰ ──────── ♱✦`
      );
    }

    if (!result.success) {
      m.react("❌");
      return m.reply(`👑•─────•👑\n❌ *Error al Unirse*\n\n> ${result.error}\n♰ ──────── ♱✦`);
    }

    m.react("✅");
    const ctx = saluranCtx();
    return m.reply(
      `✅ *¡Unión Exitosa!*\n\n` +
        `> 🏠 Nombre: *${result.subject}*\n` +
        `> 👥 Miembros: *${result.members}*\n` +
        `> 👤 Owner: *${result.owner}*`,
      { contextInfo: ctx }
    );
  }

  let resultText =
    `🔗 *Multi Join — ${inviteCodes.length} Enlaces Detectados*\n\n` +
    `El bot se unirá a todos los grupos uno por uno.\n\n`;

  let successCount = 0;
  let alreadyCount = 0;
  let failedCount = 0;

  for (let i = 0; i < inviteCodes.length; i++) {
    const result = await joinGroup(sock, inviteCodes[i]);

    if (result.alreadyMember) {
      alreadyCount++;
      resultText += `*${i + 1}.* ${result.subject} — ⚠️ Ya es miembro\n`;
    } else if (result.success) {
      successCount++;
      resultText += `*${i + 1}.* ${result.subject} — ✅ Unión exitosa\n`;
    } else {
      failedCount++;
      resultText += `*${i + 1}.* ${inviteCodes[i].substring(0, 12)}... — ❌ ${result.error}\n`;
    }

    if (i < inviteCodes.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  resultText +=
    `\n*Resultado:*\n` +
    `> ✅ Exitosos: *${successCount}*\n` +
    `> ⚠️ Ya miembro: *${alreadyCount}*\n` +
    `> ❌ Fallidos: *${failedCount}*\n` +
    `> 📊 Total: *${inviteCodes.length}*`;

  m.react(successCount > 0 ? "✅" : "❌");
  return m.reply(resultText);
}

export { pluginConfig as config, handler };
