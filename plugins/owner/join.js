import config from "../../config.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "join",
  alias: ["joingrup", "joingroup", "gabung"],
  category: "owner",
  description: "El bot se une a un grupo mediante enlace; admite responder al mensaje con enlace",
  usage: ".join <link> / .join (reply mensaje bercontenido link)",
  example: ".join https://chat.whatsapp.com/xxx",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
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
    if (!groupInfo) return { success: false, error: "No se pudo obtener la información del grupo" };

    const botJid = sock.user?.id?.replace(/:.*@/, "@") || "";
    const isMember = groupInfo.participants?.some(
      (p) => p.id === botJid || p.id?.includes(sock.user?.id?.split(":")[0]),
    );

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
    let errorMsg = error.message || "Link no válido";
    if (errorMsg.includes("not-authorized")) errorMsg = "Link ya no válido o expired";
    else if (errorMsg.includes("gone") || errorMsg.includes("item-not-found") || errorMsg.includes("404")) errorMsg = "Grup no encontrado (link ngasal/ya direvoa)";
    else if (errorMsg.includes("conflict")) errorMsg = "El bot ya es miembro";
    else errorMsg = "Link no válido o bot dilarang join";
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
      `🔗 *Join Grup*\n\n` +
        `El bot se unirá al grupo basándose en el enlace de invitación que proporcionaste.\n\n` +
        `*PENGGUNAAN:*\n` +
        `> *${m.prefix}join <link>* — Join via link langsung\n` +
        `> *${m.prefix}join* (reply mensaje) — Unirse del enlace en el mensaje respondido\n\n` +
        `*CONTOH:*\n` +
        `> *${m.prefix}join https://chat.whatsapp.com/xxx*\n` +
        `> Responde a un mensaje con enlace y luego escribe *${m.prefix}join*\n\n` +
        `_El bot detectará todos los enlaces de grupo en el mensaje y se unirá uno por uno_`
    );
  }

  const inviteCodes = extractAllInviteCodes(sourceText);

  if (inviteCodes.length === 0) {
    return m.reply(
      `❌ *No Ada Link Grup*\n\n` +
        `> El bot no encontró enlaces de invitación de grupo en el mensaje.\n\n` +
        `*Formatos de enlace soportados:*\n` +
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
        `❌ *Ya es miembro*\n\n> El bot ya se unió al grupo *${result.subject}*`
      );
    }

    if (!result.success) {
      m.react("❌");
      return m.reply(`❌ *Error al unirse*\n\n> ${result.error}`);
    }

    m.react("✅");
    const ctx = saluranCtx();
    return m.reply(
      `✅ *Éxito Join!*\n\n` +
        `> 🏠 Nombre: *${result.subject}*\n` +
        `> 👥 Member: *${result.members}*\n` +
        `> 👤 Owner: *${result.owner}*`,
      { contextInfo: ctx }
    );
  }

  let resultText =
    `🔗 *Multi Unión — ${inviteCodes.length} Enlaces Detectados*\n\n` +
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
    `\n*Hasil:*\n` +
    `> ✅ Éxito: *${successCount}*\n` +
    `> ⚠️ Ya es miembro: *${alreadyCount}*\n` +
    `> ❌ Fallo: *${failedCount}*\n` +
    `> 📊 Total: *${inviteCodes.length}*`;

  m.react(successCount > 0 ? "✅" : "❌");
  return m.reply(resultText);
}

export { pluginConfig as config, handler };
