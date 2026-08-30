import fs from "fs";
import path from "path";
import { unloadPlugin } from "../../src/lib/luffy-plugins.js";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "quitar_plugin",
  alias: ["delpl", "removeplugin"],
  category: "owner",
  description: "Eliminar un plugin por su nombre",
  usage: ".quitar_plugin <nombre>",
  example: ".quitar_plugin bliblidl",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

function findPluginFile(pluginsDir, name) {
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
        return { folder, file, path: path.join(folderPath, file) };
      }
    }
  }

  return null;
}

async function handler(m, { sock }) {
  const name = m.fullArgs?.trim() || m.args?.[0];

  if (!name) {
    return m.reply(
      `☽◯☾ ╭ ♰ ⚙️ SISTEMA ♰ ━╮ ☽◯☾\n` +
      `┃ Hola *${m.pushName}*, parece que olvidaste\n` +
      `┃ poner el nombre del plugin a eliminar 📝\n` +
      `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
      `Por favor usa el siguiente formato de comando:\n` +
      `- .delplugin <nombre del plugin>\n\n` +
      `Ejemplo de uso:\n` +
      `- .delplugin bliblidl`
    );
  }

  await m.react("🕕");

  try {
    const pluginsDir = path.join(process.cwd(), "plugins");
    const found = findPluginFile(pluginsDir, name);

    if (!found) {
      await m.react("❌");
      return m.reply(`☽◯☾ ♰ ❌ Lo siento *${m.pushName}*, no se encontró el plugin con el nombre *${name}*.`);
    }

    let unloadResult = { success: false };
    try {
      unloadResult = unloadPlugin(found.path) || { success: true };
    } catch {}

    fs.unlinkSync(found.path);

    await m.react("✅");
    let replyText =
      `☽◯☾ ╭━ ♰ ✦ ÉXITO ♰ ━╮ ☽◯☾\n` +
      `┃ ¡Proceso completado! El plugin\n` +
      `┃ se eliminó correctamente 🗑️\n` +
      `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
      `- Archivo: ${found.file}\n` +
      `- Carpeta: ${found.folder}\n` +
      `- Estado de descarga: ${unloadResult.success ? "Exitoso" : "Pendiente"}\n\n` +
      `✦ El plugin ya fue eliminado y ya no está activo.`;

    return m.reply(replyText);
  } catch (error) {
    await m.react("☢");
    await m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
