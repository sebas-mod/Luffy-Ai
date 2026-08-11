import config from "../../config.js";
import { getDatabase } from "../../src/lib/luffy-database.js";
import {
  addJadibotPremium,
  removeJadibotPremium,
  getJadibotPremiums,
} from "../../src/lib/luffy-jadibot-database.js";
const pluginConfig = {
  name: "agregar_premium",
  alias: [
    "addpremium",
    "setprem",
    "delprem",
    "delpremium",
    "listprem",
    "premlist",
  ],
  category: "owner",
  description: "Gestionar usuarios premium",
  usage:
    ".agregar_premium <número/@tag> [días]\n.delprem <número/@tag>\n.listprem\n.ver_premium <número/@tag>",
  example: ".agregar_premium 6281234567890 30",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  carne: 0,
  isEnabled: true,
};

function formatDate(ts) {
  return new Date(ts).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function extractTarget(m) {
  if (m.quoted) return m.quoted.sender?.replace(/[^0-9]/g, "") || "";
  if (m.mentionedJid?.length)
    return m.mentionedJid[0]?.replace(/[^0-9]/g, "") || "";
  if (m.args?.length) return m.args[0].replace(/[^0-9]/g, "");
  return "";
}

function toMentionJid(value) {
  const number = String(value || "").replace(/[^0-9]/g, "");
  return number ? `${number}@s.whatsapp.net` : null;
}

async function handler(m, { sock, jadibotId, isJadibot }) {
  const db = getDatabase();
  const cmd = m.command.toLowerCase();

  const isAdd = ["agregar_premium", "addpremium", "setprem"].includes(cmd);
  const isDel = ["delprem", "delpremium"].includes(cmd);
  const isList = ["listprem", "premlist"].includes(cmd);

  if (!db.data.premium) db.data.premium = [];

  if (isList) {
    if (isJadibot && jadibotId) {
      const jbPremiums = getJadibotPremiums(jadibotId);
      if (jbPremiums.length === 0) {
        return m.reply(
          `💎 Aún no hay premium en este jadibot\nUsa \`${m.prefix}agregar_premium\` para añadir`,
        );
      }
      let txt = `💎 *LISTA DE PREMIUM JADIBOT* — ${jadibotId}\n\n`;
      const mentions = jbPremiums
        .map((p) => (typeof p === "string" ? p : p.jid))
        .map(toMentionJid)
        .filter(Boolean);
      jbPremiums.forEach((p, i) => {
        const num = typeof p === "string" ? p : p.jid;
        const number = String(num || "").replace(/[^0-9]/g, "");
        txt += `${i + 1}. @${number}\n`;
      });
      txt += `\nTotal: *${jbPremiums.length}* premium`;
      return m.reply(txt, { mentions });
    }

    if (db.data.premium.length === 0) {
      return m.reply(`💎 Aún no hay premium registrados`);
    }
    let txt = `💎 *LISTA DE PREMIUM*\n\n`;
    const now = Date.now();
    const mentions = db.data.premium
      .map((p) => (typeof p === "string" ? p : p.id))
      .map(toMentionJid)
      .filter(Boolean);
    db.data.premium.forEach((p, i) => {
      const num = typeof p === "string" ? p : p.id;
      const remaining =
        typeof p === "object" && p.expired
          ? Math.ceil((p.expired - now) / (1000 * 60 * 60 * 24))
          : null;
      const status =
        remaining === null
          ? "Permanente"
          : remaining > 0
            ? remaining + "d"
            : "Caducado";
      const number = String(num || "").replace(/[^0-9]/g, "");
      txt += `${i + 1}. @${number} — ${status}\n`;
    });
    txt += `\nTotal: *${db.data.premium.length}* premium`;
    return m.reply(txt, { mentions });
  }

  let targetNumber = await extractTarget(m);

  if (!targetNumber) {
    return m.reply(
      `💎 *${isAdd ? "AGREGAR" : "ELIMINAR"} PREMIUM*\n\nIntroduce el número o etiqueta al usuario\n\`Ejemplo: ${m.prefix}${cmd} 6281234567890\``,
    );
  }

  if (targetNumber.startsWith("0")) {
    targetNumber = "62" + targetNumber.slice(1);
  }

  if (targetNumber.length < 10 || targetNumber.length > 15) {
    return m.reply(`❌ Formato de número no válido`);
  }

  if (isJadibot && jadibotId) {
    if (isAdd) {
      if (addJadibotPremium(jadibotId, targetNumber)) {
        await m.react("💎");
        return m.reply(
          `✅ Exitoso, se añadió *${targetNumber}* como premium de jadibot`,
        );
      } else {
        return m.reply(`❌ \`${targetNumber}\` ya es premium en este Jadibot`);
      }
    } else if (isDel) {
      if (removeJadibotPremium(jadibotId, targetNumber)) {
        await m.react("✅");
        return m.reply(
          `✅ Exitoso, se eliminó *${targetNumber}* de los premium de jadibot`,
        );
      } else {
        return m.reply(`❌ \`${targetNumber}\` no es premium en este Jadibot`);
      }
    }
    return;
  }

  if (isAdd) {
    const existingIndex = db.data.premium.findIndex((p) =>
      typeof p === "string" ? p === targetNumber : p.id === targetNumber,
    );

    let durationMs = 30 * 24 * 60 * 60 * 1000;
    let durationLabel = "30 días";
    
    const timeArg = m.args?.find((a) => /^\d+(h|hora|min|minuto|s|segundo|d|día|dias)?$/i.test(a));
    if (timeArg) {
      const match = timeArg.toLowerCase().match(/^(\d+)(h|hora|min|minuto|s|segundo|d|día|dias)?$/);
      if (match) {
        const val = parseInt(match[1]);
        const unit = match[2] || "h";
        if (unit === "s" || unit === "segundo") {
          durationMs = val * 1000;
          durationLabel = `${val} segundos`;
        } else if (unit === "min" || unit === "minuto") {
          durationMs = val * 60 * 1000;
          durationLabel = `${val} minutos`;
        } else if (unit === "h" || unit === "hora") {
          durationMs = val * 60 * 60 * 1000;
          durationLabel = `${val} horas`;
        } else {
          durationMs = val * 24 * 60 * 60 * 1000;
          durationLabel = `${val} días`;
        }
      }
    }

    const pushName = m.quoted?.pushName || m.pushName || "Unknown";
    const now = Date.now();

    let newExpired;

    if (existingIndex !== -1) {
      const currentData = db.data.premium[existingIndex];
      const currentExpired =
        typeof currentData === "string" ? now : currentData.expired || now;
      const baseTime = currentExpired > now ? currentExpired : now;
      newExpired = baseTime + durationMs;

      if (typeof currentData === "string") {
        db.data.premium[existingIndex] = {
          id: targetNumber,
          expired: newExpired,
          name: pushName,
          addedAt: now,
        };
      } else {
        db.data.premium[existingIndex].expired = newExpired;
        db.data.premium[existingIndex].name = pushName;
      }
    } else {
      newExpired = now + durationMs;
      db.data.premium.push({
        id: targetNumber,
        expired: newExpired,
        name: pushName,
        addedAt: now,
      });
    }

    const jid = targetNumber + "@s.whatsapp.net";
    const user = db.getUser(jid) || db.setUser(jid);

    if (user.carne !== -1) {
      user.carne = config.carne?.premium || 999999;
    }
    user.isPremium = true;

    db.setUser(jid, user);
    db.updateExp(jid, 200000);
    db.updateBerry(jid, 20000);

    db.save();

    await m.react("💎");
    return m.reply(
      `✅ Exitoso, se ${existingIndex !== -1 ? "renovó" : "añadió"} premium *${targetNumber}* por *${durationLabel}*\nCaduca: *${formatDate(newExpired)}*`,
    );
  } else if (isDel) {
    const index = db.data.premium.findIndex((p) =>
      typeof p === "string" ? p === targetNumber : p.id === targetNumber,
    );

    if (index === -1) {
      return m.reply(`❌ *${targetNumber}* no es premium`);
    }

    db.data.premium.splice(index, 1);

    const jid = targetNumber + "@s.whatsapp.net";
    const user = db.getUser(jid);
    if (user) {
      user.isPremium = false;
      db.setUser(jid, user);
    }

    db.save();
    await m.react("✅");
    return m.reply(`✅ Exitoso, se eliminó *${targetNumber}* de los premium`);
  }
}

export { pluginConfig as config, handler };
