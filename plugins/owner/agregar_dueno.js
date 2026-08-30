import config, { getOwnerName } from "../../config.js";
import { getDatabase } from "../../src/lib/luffy-database.js";
import {
  addJadibotOwner,
  removeJadibotOwner,
  getJadibotOwners,
} from "../../src/lib/luffy-jadibot-database.js";
import {
  isLid,
  lidToJid,
  resolveAnyLidToJid,
  isLidConverted,
} from "../../src/lib/luffy-lid.js";
const pluginConfig = {
  name: "agregar_dueno",
  alias: ["addown", "setowner", "delowner", "dedown", "ownerlist", "listowner"],
  category: "owner",
  description: "Gestionar los owners del bot (según el modo)",
  usage: ".agregar_dueno <numero/@tag/reply>",
  example: ".agregar_dueno 6281234567890",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  carne: 0,
  isEnabled: true,
};

function cleanJid(jid) {
  if (!jid) return null;
  if (isLid(jid)) jid = lidToJid(jid);
  return jid.includes("@") ? jid : jid + "@s.whatsapp.net";
}

function extractNumber(m) {
  let targetNumber = "";

  if (m.quoted) {
    let sender = m.quoted.sender || "";
    if (isLid(sender) || isLidConverted(sender)) {
      sender = resolveAnyLidToJid(sender, m.groupMembers || []);
    }
    targetNumber = sender?.replace(/[^0-9]/g, "") || "";
  } else if (m.mentionedJid?.length) {
    let jid = cleanJid(m.mentionedJid[0]);
    if (isLid(jid) || isLidConverted(jid)) {
      jid = resolveAnyLidToJid(jid, m.groupMembers || []);
    }
    targetNumber = jid?.replace(/[^0-9]/g, "") || "";
  } else if (m.args[0]) {
    targetNumber = m.args[0].replace(/[^0-9]/g, "");
    if (targetNumber.startsWith("08")) {
      targetNumber = "62" + targetNumber.slice(1);
    }
  }

  if (targetNumber.startsWith("0")) {
    targetNumber = "62" + targetNumber.slice(1);
  }

  if (targetNumber.length > 15) {
    return "";
  }

  return targetNumber;
}

function toMentionJid(value) {
  const number = String(value || "").replace(/[^0-9]/g, "");
  return number ? `${number}@s.whatsapp.net` : null;
}

async function handler(m, { sock, jadibotId, isJadibot }) {
  const db = getDatabase();
  const cmd = m.command.toLowerCase();

  const isAdd = ["agregar_dueno", "addown", "setowner"].includes(cmd);
  const isDel = ["delowner", "dedown"].includes(cmd);
  const isList = ["ownerlist", "listowner"].includes(cmd);

  if (!db.data.owner) db.data.owner = [];

  if (isList) {
    if (isJadibot && jadibotId) {
      const jbOwners = getJadibotOwners(jadibotId);
      if (jbOwners.length === 0) {
        return m.reply(
          `👑•─────•👑\n📋 *ʟɪꜱᴛᴀ ᴅᴇ ᴏᴡɴᴇʀ ᴊᴀᴅɪʙᴏᴛ*\n\n> Aún no hay owners registrados.\n> Usa \`${m.prefix}agregar_dueno\` para agregar.\n♰ ──────── ♱`,
        );
      }
      let txt = `📋 *LISTA DE OWNERS JADIBOT* — ${jadibotId}\n\n`;
      const mentions = jbOwners.map(toMentionJid).filter(Boolean);
      jbOwners.forEach((s, i) => {
        const number = String(s || "").replace(/[^0-9]/g, "");
        const name = getOwnerName(number);
        txt += `${i + 1}. 👑 @${number}${name !== "Owner" ? ` — *${name}*` : ""}\n`;
      });
      txt += `\nTotal: *${jbOwners.length}* owners`;
      return m.reply(txt, { mentions });
    } else {
      const configOwners = (config.owner?.number || []).map(String);
      const dbOwners = db.data.owner || [];
      const allOwners = [...new Set([...configOwners, ...dbOwners])];

      if (allOwners.length === 0) {
        return m.reply(`👑•─────•👑\n📋 *ʟɪꜱᴛᴀ ᴅᴇ ᴏᴡɴᴇʀ*\n\n> Aún no hay owners registrados.\n♰ ──────── ♱`);
      }
      let txt = `📋 *LISTA DE OWNERS*\n\n`;
      const mentions = allOwners.map(toMentionJid).filter(Boolean);
      allOwners.forEach((s, i) => {
        const number = String(s || "").replace(/[^0-9]/g, "");
        const isMain = configOwners.some(
          (o) => o.replace(/[^0-9]/g, "") === number,
        );
        const isDb = dbOwners.some(
          (o) => String(o).replace(/[^0-9]/g, "") === number,
        );
        const label = isMain && isDb ? "👑⭐" : isMain ? "⭐" : "👑";
        const name = getOwnerName(number);
        txt += `${i + 1}. ${label} @${number}${name !== "Owner" ? ` — *${name}*` : ""}\n`;
      });
      txt += `\nTotal: *${allOwners.length}* owners | ⭐ Principal, 👑 Añadido`;
      return m.reply(txt, { mentions });
    }
  }

  const targetNumber = await extractNumber(m);
  const numberFromArgs = !m.quoted && !m.mentionedJid?.length && m.args[0];
  const customName = isAdd
    ? (numberFromArgs ? m.args.slice(1) : m.args).join(" ").trim()
    : "";

  if (!targetNumber) {
    return m.reply(
      `👑 *${isAdd ? "AGREGAR" : "ELIMINAR"} OWNER*\n\n` +
        `Responde/etiqueta o escribe el número del usuario\n` +
        `\`Ejemplo: ${m.prefix}${cmd} 6281234567890\`\n` +
        `\`Con nombre: ${m.prefix}${cmd} 6281234567890 NombreOwner\``,
    );
  }

  if (targetNumber.length < 10 || targetNumber.length > 15) {
    return m.reply(`👑•─────•👑\n❌ *ᴇʀʀᴏʀ*\n\n> Formato de número no válido\n♰ ──────── ♱`);
  }

  if (isJadibot && jadibotId) {
    if (isAdd) {
      if (addJadibotOwner(jadibotId, targetNumber)) {
        await m.react("👑");
        return m.reply(
          `☽◯☾ ╭━ ♰ ✦ ÉXITO ♰ ━╮ ☽◯☾\n┃ ✅ Exitoso, se añadió *${targetNumber}* como owner jadibot\n╰━ ⊱༺༒༻⊰ ━╯`,
        );
      } else {
        return m.reply(
          `☽◯☾ ♰ ❌ \`${targetNumber}\` ya es owner de este Jadibot.`,
        );
      }
    } else if (isDel) {
      if (removeJadibotOwner(jadibotId, targetNumber)) {
        await m.react("✅");
        return m.reply(
          `☽◯☾ ╭━ ♰ ✦ ÉXITO ♰ ━╮ ☽◯☾\n┃ ✅ Exitoso, se eliminó *${targetNumber}* de los owners jadibot\n╰━ ⊱༺༒༻⊰ ━╯`,
        );
      } else {
        return m.reply(`☽◯☾ ♰ ❌ \`${targetNumber}\` no es owner de este Jadibot.`);
      }
    }
    return;
  }

  if (isAdd) {
    if (db.data.owner.includes(targetNumber)) {
      return m.reply(`☽◯☾ ♰ ❌ \`${targetNumber}\` ya es full owner.`);
    }

    db.data.owner.push(targetNumber);
    if (customName) {
      const nameMap = db.setting("ownerNames") || {};
      nameMap[targetNumber] = customName;
      db.setting("ownerNames", nameMap);
    }
    db.save();

    const displayName = customName || getOwnerName(targetNumber);
    await m.react("👑");
    return m.reply(
      `☽◯☾ ╭━ ♰ ✦ ÉXITO ♰ ━╮ ☽◯☾\n┃ ✅ Exitoso, se añadió *${targetNumber}* como full owner${customName ? ` (${customName})` : ""}\n╰━ ⊱༺༒༻⊰ ━╯`,
    );
  } else if (isDel) {
    const index = db.data.owner.indexOf(targetNumber);
    if (index === -1) {
      return m.reply(`☽◯☾ ♰ ❌ \`${targetNumber}\` no es full owner.`);
    }

    db.data.owner.splice(index, 1);
    const nameMap = db.setting("ownerNames") || {};
    delete nameMap[targetNumber];
    db.setting("ownerNames", nameMap);
    db.save();

    await m.react("✅");
    return m.reply(`☽◯☾ ╭━ ♰ ✦ ÉXITO ♰ ━╮ ☽◯☾\n┃ ✅ Exitoso, se eliminó *${targetNumber}* de los full owners\n╰━ ⊱༺༒༻⊰ ━╯`);
  }
}

export {
  pluginConfig as config,
  handler,
};
