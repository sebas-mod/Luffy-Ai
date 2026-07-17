import fs from "fs";
import path from "path";
import { getAllPlugins } from "../../src/lib/ourin-plugins.js";
import te from "../../src/lib/ourin-error.js";
const pluginConfig = {
  name: "searchplugin",
  alias: ["splugin", "findplugin", "infoplugin"],
  category: "owner",
  description: "Busca y muestra información de plugins",
  usage: ".splugin <nombre>",
  example: ".splugin sticar",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
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
      `🔍 *BUSCAR PLUGIN*\n\n` +
        `> Busca y muestra información del plugin\n\n` +
        `*Ejemplo:*\n` +
        `> \`${m.prefix}splugin sticar\`\n` +
        `> \`${m.prefix}splugin menu\``,
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
        `❌ *NO ENCONTRADO*\n\n> Plugin \`${name}\` no encontrado`,
      );
    }

    if (info.error) {
      await m.react("⚠️");
      return m.reply(
        `⚠️ *ERROR DEL PLUGIN*\n\n` +
          `> Archivo: \`${info.file}\`\n` +
          `> Carpeta: \`${info.folder}\`\n` +
          `> Error: \`${info.error}\``,
      );
    }

    const aliases = Array.isArray(info.alias)
      ? info.alias.join(", ")
      : info.alias || "-";
    const isEnabled = info.isEnabled !== false ? "✅ Ya" : "❌ No";
    const isOwner = info.isOwner ? "✅ Ya" : "❌ No";
    const isPremium = info.isPremium ? "✅ Ya" : "❌ No";
    const isGroup = info.isGroup ? "✅ Ya" : "❌ No";
    const isAdmin = info.isAdmin ? "✅ Ya" : "❌ No";

    await m.react("✅");
    return m.reply(
      `📋 *INFORMACIÓN DEL PLUGIN*\n\n` +
        `╭┈┈⬡「 📝 *DETALLE* 」\n` +
        `┃ 📛 Nombre: \`${info.name || "-"}\`\n` +
        `┃ 🏷️ Alias: \`${aliases}\`\n` +
        `┃ 📁 Categoría: \`${info.category || "-"}\`\n` +
        `┃ 📄 Descripción: ${info.description || "-"}\n` +
        `┃ 📝 Uso: \`${info.usage || "-"}\`\n` +
        `┃ 📌 Ejemplo: \`${info.example || "-"}\`\n` +
        `╰┈┈⬡\n\n` +
        `╭┈┈⬡「 ⚙️ *CONFIGURACIÓN* 」\n` +
        `┃ 🔓 Activado: ${isEnabled}\n` +
        `┃ 👑 Solo Propietario: ${isOwner}\n` +
        `┃ 💎 Premium: ${isPremium}\n` +
        `┃ 👥 Solo Grupos: ${isGroup}\n` +
        `┃ 🛡️ Solo Admin: ${isAdmin}\n` +
        `┃ ⏱️ Tiempo de Espera: \`${info.cooldown || 0}s\`\n` +
        `┃ 🎫 Límite: \`${info.limit || 0}\`\n` +
        `╰┈┈⬡`,
    );
  } catch (error) {
    console.log(error);
    await m.react("☢");
    await m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
