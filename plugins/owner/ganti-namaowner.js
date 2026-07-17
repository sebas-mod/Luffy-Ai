import fs from "fs";
import path from "path";
import { getDatabase } from "../../src/lib/ourin-database.js";
import { getOwnerName } from "../../config.js";
import te from "../../src/lib/ourin-error.js";
const pluginConfig = {
  name: "ganti-nombreowner",
  alias: ["setnombreowner", "setnameowner", "setownername"],
  category: "owner",
  description: "Cambia el nombre del dueño (principal o adicional)",
  usage: ".ganti-nombreowner <número> <nombre nuevo>",
  example: ".ganti-nombreowner 628xxx Fauzan",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config }) {
  const db = getDatabase();
  const input = m.args;

  if (!input[0]) {
    const nameMap = db.setting("ownerNames") || {};
    const mainOwnerNum = config.owner?.number?.[0] || "";
    const mainName = config.owner?.name || "Owner";
    let list = `👤 *ᴏᴡɴᴇʀ ɴᴀᴍᴇ ʟɪsᴛ*\n\n`;
    list += `👑 Main: *${mainName}* (${mainOwnerNum})\n`;
    const entries = Object.entries(nameMap);
    if (entries.length > 0) {
      entries.forEach(([num, name]) => {
        list += `👤 ${num}: *${name}*\n`;
      });
    } else {
      list += `\n> Aún no hay nombre custom para owner adicional`;
    }
    list += `\n\n*Uso:*\n`;
    list += `\`${m.prefix}ganti-nombreowner <número> <nombre>\`\n`;
    list += `\`${m.prefix}ganti-nombreowner main <nombre>\` — ganti nombre owner utama`;
    return m.reply(list);
  }

  if (input[0].toLowerCase() === "main") {
    const newName = input.slice(1).join(" ").trim();
    if (!newName) {
      return m.reply(
        `👤 *ɢᴀɴᴛɪ ɴᴀᴍᴀ ᴏᴡɴᴇʀ ᴜᴛᴀᴍᴀ*\n\n> Nombre actualmente: *${config.owner?.name || "-"}*\n\n\`${m.prefix}ganti-nombreowner main <nombre nuevo>\``,
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
        `✅ *ᴇxɪᴛᴏ*\n\n> Nombre del owner principal cambiado a: *${newName}*`,
      );
    } catch (error) {
      return m.reply(te(m.prefix, m.command, m.pushName));
    }
  }

  const targetNumber = input[0].replace(/[^0-9]/g, "");
  const newName = input.slice(1).join(" ").trim();

  if (!targetNumber || targetNumber.length < 10) {
    return m.reply(
      `❌ *ғᴀʟʟᴏ*\n\n> Número no válido\n\n\`${m.prefix}ganti-nombreowner 628xxx NombreOwner\``,
    );
  }

  if (!newName) {
    const currentName = getOwnerName(targetNumber);
    return m.reply(
      `👤 *ɴᴀᴍᴀ ᴏᴡɴᴇʀ*\n\n> ${targetNumber}: *${currentName}*\n\n\`${m.prefix}ganti-nombreowner ${targetNumber} <nombre nuevo>\``,
    );
  }

  const nameMap = db.setting("ownerNames") || {};
  nameMap[targetNumber] = newName;
  db.setting("ownerNames", nameMap);

  return m.reply(
    `✅ *ᴇxɪᴛᴏ*\n\n> Nombre del owner *${targetNumber}* cambiado a: *${newName}*`,
  );
}

export { pluginConfig as config, handler };
