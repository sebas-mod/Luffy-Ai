import config from "../../config.js";
import { getDatabase } from "./luffy-database.js";
import {
  buildJidCandidates,
  cacheLidJid,
  isParticipantMatch,
  resolveUsyncLid,
} from "./luffy-lid.js";
function levenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[b.length][a.length];
}

function formatAfkDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} días ${hours % 24} horas`;
  if (hours > 0) return `${hours} horas ${minutes % 60} minutos`;
  if (minutes > 0) return `${minutes} minutos`;
  return `${seconds} segundos`;
}

async function healAdminLid(m, sock) {
  if (!m?.isGroup || !m?.sender || !sock) return false;
  const pn = m.sender.includes("@") ? m.sender : m.sender + "@s.whatsapp.net";
  const lid = await resolveUsyncLid(sock, pn);
  if (!lid) return false;
  cacheLidJid(lid, pn);
  const extra = buildJidCandidates(lid);
  const members = m.groupMembers || [];
  const isAdminNow = members.some(
    (p) => p.admin && extra.some((j) => isParticipantMatch(p, j)),
  );
  if (isAdminNow) {
    m.isAdmin = true;
    if (!m.groupAdmins?.includes(pn) && !m.groupAdmins?.includes(lid)) {
      m.groupAdmins?.push(lid);
    }
    return true;
  }
  return false;
}

async function checkPermission(m, pluginConfig, sock) {
  const db = getDatabase();
  const user = db.getUser(m.sender) || {};
  let hasAccess = false;
  if (user.access && m.command) {
    const accessFound = user.access.find(
      (a) => a.cmd === m.command.toLowerCase(),
    );
    if (accessFound) {
      if (accessFound.expired === null || accessFound.expired > Date.now()) {
        hasAccess = true;
      } else {
        user.access = user.access.filter(
          (a) => a.cmd !== m.command.toLowerCase(),
        );
        db.setUser(m.sender, user);
      }
    }
  }

  if (pluginConfig.isOwner && !m.isOwner && !hasAccess) {
    return {
      allowed: false,
      reason: config.messages?.ownerOnly || "🚫 Owner only!",
    };
  }

  if (pluginConfig.isPartner && !m.isPartner && !m.isOwner && !hasAccess) {
    return { allowed: false, reason: "🤝 Partner only!" };
  }

  const overrides = db.setting("capprem") || {};
  const isPremiumFeature = overrides[pluginConfig.name] !== undefined ? overrides[pluginConfig.name] : pluginConfig.isPremium;

  if (
    isPremiumFeature &&
    !m.isPremium &&
    !m.isOwner &&
    !m.isPartner &&
    !hasAccess
  ) {
    return {
      allowed: false,
      reason: config.messages?.premiumOnly || "💎 Premium only!",
    };
  }

  if (pluginConfig.isGroup && !m.isGroup) {
    return {
      allowed: false,
      reason: config.messages?.groupOnly || "👥 Group only!",
    };
  }

  if (pluginConfig.isPrivate && m.isGroup) {
    return {
      allowed: false,
      reason: config.messages?.privateOnly || "📱 Private chat only!",
    };
  }

  if (
    pluginConfig.isAdmin &&
    m.isGroup &&
    !m.isAdmin &&
    !m.isOwner &&
    !hasAccess
  ) {
    if (sock) {
      const healed = await healAdminLid(m, sock);
      if (healed) {
        return { allowed: true };
      }
    }
    console.error(
      "[ADMIN-REJECT]",
      JSON.stringify({
        chat: m.chat,
        command: m.command,
        sender: m.sender,
        senderNumber: m.senderNumber,
        isOwner: m.isOwner,
        memberCount: m.groupMembers?.length,
        adminCount: m.groupAdmins?.length,
        admins: (m.groupAdmins || []).slice(0, 6),
        lidDebug: m.lidDebug || null,
      }),
    );
    return {
      allowed: false,
      reason: config.messages?.adminOnly || "👮 Admin grup only!",
    };
  }

  if (pluginConfig.isBotAdmin && m.isGroup && !m.isBotAdmin) {
    return {
      allowed: false,
      reason:
        config.messages?.botAdminOnly || "🤖 ¡El bot debe ser admin del grupo!",
    };
  }

  if (m.isGroup) {
    const group = db.getGroup(m.chat);
    if (group) {
      if (pluginConfig.category === "game" && group.game === false) {
        if (!m.isAdmin && !m.isOwner && !hasAccess) {
          return {
            allowed: false,
            reason: "🎮 ¡La función Game está desactivada en este grupo por el Admin!",
          };
        }
      }
      if (pluginConfig.category === "rpg" && group.rpg === false) {
        if (!m.isAdmin && !m.isOwner && !hasAccess) {
          return {
            allowed: false,
            reason: "⚔️ ¡La función RPG está desactivada en este grupo por el Admin!",
          };
        }
      }
    }
  }

  return { allowed: true, reason: "" };
}

function checkMode(m, getActiveJadibots) {
  const db = getDatabase();
  const dbMode = db.setting("botMode");
  const mode = dbMode || config.config.mode || "public";

  const onlyGc = db.setting("onlyGc");
  const onlyPc = db.setting("onlyPc");
  const selfAdmin = db.setting("selfAdmin");
  const publicAdmin = db.setting("publicAdmin");
  const botAfk = db.setting("botAfk");

  if (botAfk && botAfk.active) {
    if (m.fromMe || m.isOwner) {
      return { allowed: true };
    }
    const duration = formatAfkDuration(Date.now() - botAfk.since);
    return {
      allowed: false,
      isAfk: true,
      afkMessage:
        `💤 *ʙᴏᴛ ᴇsᴛá ᴀꜰᴋ*\n\n` +
        `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n` +
        `┃ 📝 ᴍᴏᴛɪᴠᴏ: \`${botAfk.reason || "AFK"}\`\n` +
        `┃ ⏱️ ᴅᴇsᴅᴇ: \`${duration}\`\n` +
        `╰┈┈⬡\n\n` +
        `> El bot no puede recibir órdenes en este momento\n` +
        `> Espera a que el capitán lo active de nuevo`,
    };
  }

  if (onlyGc && !m.isGroup && !m.isOwner) return { allowed: false };
  if (onlyPc && m.isGroup && !m.isOwner) return { allowed: false };

  const onlyThisGroup = db.setting("onlyThisGroup");
  if (onlyThisGroup && m.isGroup && !m.isOwner) {
    if (typeof onlyThisGroup === "string" && m.chat !== onlyThisGroup) {
      return { allowed: false };
    } else if (typeof onlyThisGroup === "object" && m.chat !== onlyThisGroup.jid) {
      return {
        allowed: false,
        isOnlyThisGroup: true,
        onlyThisGroupMessage:
          `🔒 *Acceso Denegado*\n\n` +
          `Lo sentimos, por ahora nuestro bot solo puede usarse de forma exclusiva en el Grupo Principal (*${onlyThisGroup.name}*).\n\n` +
          `Únete a nuestro grupo principal mediante el siguiente enlace:\n` +
          `🔗 ${onlyThisGroup.link}\n\n` +
          `Una vez dentro, podrás usar todas las funciones del bot. ¡Gracias!`
      };
    }
  }

  const selfGroups = db.setting("selfGroups") || [];
  if (m.isGroup && selfGroups.includes(m.chat)) {
    if (m.fromMe) return { allowed: true };
    if (m.isOwner) return { allowed: true };
    return { allowed: false, isSelfGroup: true };
  }

  const publicGroups = db.setting("publicGroups") || [];
  if (m.isGroup && publicGroups.includes(m.chat)) {
    return { allowed: true };
  }

  if (mode === "self") {
    if (m.fromMe) return { allowed: true };
    if (m.isOwner) return { allowed: true };

    const activeJadibots = getActiveJadibots();
    if (activeJadibots.length > 0) {
      let jadibotList = "";
      activeJadibots.forEach((jb, i) => {
        jadibotList += `┃ ${i + 1}. @${jb.id}\n`;
      });
      const mentions = activeJadibots.map((jb) => jb.id + "@s.whatsapp.net");
      return {
        allowed: false,
        hasJadibots: true,
        jadibotMessage:
          `🤖 *ᴍᴏᴅᴏ ᴘʀɪᴠᴀᴅᴏ*\n\n` +
          `El bot principal está en modo privado.\n` +
          `Puedes usar uno de nuestros bots derivados:\n\n` +
          `╭┈┈⬡「 📱 *ʙᴏᴛs ᴅɪsᴘᴏɴɪʙʟᴇs* 」\n` +
          `${jadibotList}` +
          `╰┈┈⬡\n\n` +
          `> Elige uno de los bots de arriba para acceder a las funciones.`,
        jadibotMentions: mentions,
      };
    }

    return { allowed: false };
  }

  if (mode === "public") {
    const onlyAdmin = db.setting("onlyAdmin");

    if (onlyAdmin) {
      if (m.fromMe || m.isOwner) return { allowed: true };
      if (!m.isGroup) return { allowed: true };
      if (m.isGroup && m.isAdmin) return { allowed: true };
      return { allowed: false };
    }

    if (selfAdmin) {
      if (m.fromMe || m.isOwner) return { allowed: true };
      if (m.isGroup && m.isAdmin) return { allowed: true };
      return { allowed: false };
    }

    if (publicAdmin) {
      if (m.fromMe || m.isOwner) return { allowed: true };
      if (!m.isGroup) return { allowed: true };
      if (m.isGroup && m.isAdmin) return { allowed: true };
      return { allowed: false };
    }

    return { allowed: true };
  }

  return { allowed: true };
}

export { levenshtein, formatAfkDuration, checkPermission, checkMode };
