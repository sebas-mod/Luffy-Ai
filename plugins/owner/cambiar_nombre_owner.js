import fs from "fs";
import path from "path";
import { getDatabase } from "../../src/lib/luffy-database.js";
import { getOwnerName } from "../../config.js";
import te from "../../src/lib/luffy-error.js";
const pluginConfig = {
  name: "cambiar_nombre_owner",
  alias: ["configurar_nombre_owner"],
  category: "owner",
  description: "Cambiar el nombre del owner (principal o adicional)",
  usage: ".cambiar_nombre_owner <número> <nombre nuevo>",
  example: ".cambiar_nombre_owner 549xxx Sebas",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock, config }) {
  const db = getDatabase();
  const input = m.args;

  if (!input[0]) {
    const nameMap = db.setting("ownerNames") || {};
    const mainOwnerNum = config.owner?.number?.[0] || "";
    const mainName = config.owner?.name || "Owner";
    let list = `👤 *ʟɪsᴛᴀ ᴅᴇ ɴᴏᴍʙʀᴇs ᴅᴇʟ ᴏᴡɴᴇʀ*\n\n`;
    list += `👑 Principal: *${mainName}* (${mainOwnerNum})\n`;
    const entries = Object.entries(nameMap);
    if (entries.length > 0) {
      entries.forEach(([num, name]) => {
        list += `👤 ${num}: *${name}*\n`;
      });
    } else {
      list += `\n> Aún no hay nombres personalizados para owners adicionales`;
    }
    list += `\n\n*Uso:*\n`;
    list += `\`${m.prefix}cambiar_nombre_owner <número> <nombre>\`\n`;
    list += `\`${m.prefix}cambiar_nombre_owner main <nombre>\` — cambia el nombre del owner principal`;
    return m.reply(list);
  }

  if (input[0].toLowerCase() === "main") {
    const newName = input.slice(1).join(" ").trim();
    if (!newName) {
      return m.reply(
        `👑•─────•👑\n👤 *ᴄᴀᴍʙɪᴀʀ ɴᴏᴍʙʀᴇ ᴅᴇʟ ᴏᴡɴᴇʀ ᴘʀɪɴᴄɪᴘᴀʟ*\n\n> Nombre actual: *${config.owner?.name || "-"}*\n\n\`${m.prefix}cambiar_nombre_owner main <nombre nuevo>\`\n✦────────✦`,
      );
    }
    try {
      const configPath = path.join(process.cwd(), "config.js");
      let configContent = fs.readFileSync(configPath, "utf8");
      configContent = configContent.replace(
        /owner:\s*\{[\s\S]*?name:\s*['"]([^'"]*)['"]/,
        (match, oldName) =>
          match
            .replace(`'${oldName}'`, `'${newName}'`)
            .replace(`"${oldName}"`, `'${newName}'`),
      );
      fs.writeFileSync(configPath, configContent);
      config.owner.name = newName;
      return m.reply(
        `👑•─────•👑\n✅ *ᴇxɪᴛᴏsᴏ*\n\n> Nombre del owner principal cambiado a: *${newName}*\n✦────────✦`,
      );
    } catch (error) {
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

  const targetNumber = input[0].replace(/[^0-9]/g, "");
  const newName = input.slice(1).join(" ").trim();

  if (!targetNumber || targetNumber.length < 10) {
    return m.reply(
      `👑•─────•👑\n❌ *ꜰᴀʟʟɪᴅᴏ*\n\n> Número no válido\n\n\`${m.prefix}cambiar_nombre_owner 628xxx NombreOwner\`\n✦────────✦`,
    );
  }

  if (!newName) {
    const currentName = getOwnerName(targetNumber);
    return m.reply(
      `👑•─────•👑\n👤 *ɴᴏᴍʙʀᴇ ᴅᴇʟ ᴏᴡɴᴇʀ*\n\n> ${targetNumber}: *${currentName}*\n\n\`${m.prefix}cambiar_nombre_owner ${targetNumber} <nombre nuevo>\`\n✦────────✦`,
    );
  }

  const nameMap = db.setting("ownerNames") || {};
  nameMap[targetNumber] = newName;
  db.setting("ownerNames", nameMap);

  return m.reply(
    `👑•─────•👑\n✅ *ᴇxɪᴛᴏsᴏ*\n\n> Nombre del owner *${targetNumber}* cambiado a: *${newName}*\n✦────────✦`,
  );
}

export { pluginConfig as config, handler };
