import fs from "fs";
import path from "path";
import { getAllPlugins } from "../../src/lib/luffy-plugins.js";
import te from "../../src/lib/luffy-error.js";
const pluginConfig = {
  name: "searchplugin",
  alias: ["splugin", "findplugin", "infoplugin"],
  category: "owner",
  description: "Buscar y mostrar la info de un plugin",
  usage: ".splugin <nombre>",
  example: ".splugin sticker",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

function findPluginInfo(name) {
  const allPlugins = getAllPlugins();

  for (const plugin of allPlugins) {
    if (!plugin.config) continue;

    const rawName = plugin.config.name;
    const pName = (
      Array.isArray(rawName) ? rawName[0] : rawName
    )?.toLowerCase();
    const aliases = Array.isArray(plugin.config.alias)
      ? plugin.config.alias
      : plugin.config.alias
        ? [plugin.config.alias]
        : [];

    if (
      pName === name.toLowerCase() ||
      aliases.map((a) => a?.toLowerCase()).includes(name.toLowerCase())
    ) {
      return {
        ...plugin.config,
        filePath: plugin.filePath,
      };
    }
  }

  return null;
}

async function findPluginFromFile(pluginsDir, name) {
  const folders = fs
    .readdirSync(pluginsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const folder of folders) {
    const folderPath = path.join(pluginsDir, folder);
    const files = fs.readdirSync(folderPath).filter((f) => f.endsWith(".js"));

    for (const file of files) {
      const baseName = file.replace(".js", "");
      if (baseName.toLowerCase() === name.toLowerCase()) {
        const filePath = path.join(folderPath, file);
        try {
          const mod = await import(`file://${filePath.replace(/\\/g, "/")}`);
          return {
            ...mod.config,
            folder,
            file,
            filePath,
          };
        } catch (e) {
          return { folder, file, filePath, error: e.message };
        }
      }
    }
  }

  return null;
}

async function handler(m, { sock }) {
  const name = m.text?.trim();

  if (!name) {
    return m.reply(
      `☽◯☾ ╭━ ♰ 👑 OWNER ♰ ━╮ ☽◯☾\n` +
        `┃ 🔍 *ʙᴜsᴄᴀʀ ᴘʟᴜɢɪɴ*\n` +
        `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
        `☽◯☾ ♰ Busca y muestra la info de un plugin\n\n` +
        `*ᴇᴊᴇᴍᴘʟᴏ:*\n` +
        `› \`${m.prefix}splugin sticker\`\n` +
        `› \`${m.prefix}splugin menu\``,
    );
  }

  m.react("🔍");

  try {
    let info = findPluginInfo(name);

    if (!info) {
      const pluginsDir = path.join(process.cwd(), "plugins");
      info = await findPluginFromFile(pluginsDir, name);
    }

    if (!info) {
      await m.react("❌");
      return m.reply(
        `☽◯☾ ╭ ♰ ⚙️ SISTEMA ♰ ━╮ ☽◯☾\n┃ ❌ *ɴᴏ ᴇɴᴄᴏɴᴛʀᴀᴅᴏ*\n╰━━━━━━━━╯\n\n☽◯☾ ♰ El plugin \`${name}\` no fue encontrado`,
      );
    }

    if (info.error) {
      await m.react("⚠️");
      return m.reply(
        `⚠️ *ᴇʀʀᴏʀ ᴅᴇ ᴘʟᴜɢɪɴ*\n` +
          `──────────\n\n` +
          `› Archivo: \`${info.file}\`\n` +
          `› Carpeta: \`${info.folder}\`\n` +
          `› Error: \`${info.error}\``,
      );
    }

    const aliases = Array.isArray(info.alias)
      ? info.alias.join(", ")
      : info.alias || "-";
    const isEnabled = info.isEnabled !== false ? "✅ Sí" : "❌ No";
    const isOwner = info.isOwner ? "✅ Sí" : "❌ No";
    const isPremium = info.isPremium ? "✅ Sí" : "❌ No";
    const isGroup = info.isGroup ? "✅ Sí" : "❌ No";
    const isAdmin = info.isAdmin ? "✅ Sí" : "❌ No";

    await m.react("✅");
    return m.reply(
      `📋 *ɪɴꜰᴏ ᴅᴇʟ ᴘʟᴜɢɪɴ*\n\n` +
        `☽◯☾ ♰ 「 📝 *ᴅᴇᴛᴀʟʟᴇ* 」\n` +
        `┃ 📛 ɴᴏᴍʙʀᴇ: \`${info.name || "-"}\`\n` +
        `┃ 🏷️ ᴀʟɪᴀs: \`${aliases}\`\n` +
        `┃ 📁 ᴄᴀᴛᴇɢᴏʀíᴀ: \`${info.category || "-"}\`\n` +
        `┃ 📄 ᴅᴇsᴄ: ${info.description || "-"}\n` +
        `┃ 📝 ᴜsᴏ: \`${info.usage || "-"}\`\n` +
        `┃ 📌 ᴇᴊᴇᴍᴘʟᴏ: \`${info.example || "-"}\`\n` +
        `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
        `☽◯☾ ♰ 「 ⚙️ *ᴀᴊᴜsᴛᴇs* 」\n` +
        `┃ 🔓 ʜᴀʙɪʟɪᴛᴀᴅᴏ: ${isEnabled}\n` +
        `┃ 👑 sᴏʟᴏ ᴏᴡɴᴇʀ: ${isOwner}\n` +
        `┃ 💎 ᴘʀᴇᴍɪᴜᴍ: ${isPremium}\n` +
        `┃ 👥 sᴏʟᴏ ɢʀᴜᴘᴏs: ${isGroup}\n` +
        `┃ 🛡️ sᴏʟᴏ ᴀᴅᴍɪɴ: ${isAdmin}\n` +
        `┃ ⏱️ ᴄᴏᴏʟᴅᴏᴡɴ: \`${info.cooldown || 0}s\`\n` +
        `┃ 🎫 ʟɪᴍɪᴛᴇ: \`${info.limit || 0}\`\n` +
        `╰━ ⊱༺༒༻⊰ ━╯`,
    );
  } catch (error) {
    console.log(error);
    await m.react("☢");
    await m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
