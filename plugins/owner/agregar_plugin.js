import fs from "fs";
import path from "path";
import { hotReloadPlugin } from "../../src/lib/luffy-plugins.js";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "agregar_plugin",
  alias: ["addpl"],
  category: "owner",
  description: "Añadir un plugin nuevo desde el código respondido",
  usage: ".addplugin [nombre_archivo] [carpeta]",
  example: ".addplugin bliblidl downloader",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

function extractPluginInfo(code) {
  const info = { name: null, category: null };
  const nameMatch = code.match(/name:\s*['"`]([^'"`]+)['"]/i);
  if (nameMatch) info.name = nameMatch[1];
  const categoryMatch = code.match(/category:\s*['"`]([^'"`]+)['"]/i);
  if (categoryMatch) info.category = categoryMatch[1];
  return info;
}

async function handler(m, { sock }) {
  const quoted = m.quoted;

  if (!quoted) {
    return m.reply(
      `Hola *${m.pushName}*, parece que aún no respondiste al código del plugin.\n\n` +
      `Por favor, responde al código del plugin que quieres añadir con el comando:\n` +
      `- .addplugin (para detección automática)\n` +
      `- .addplugin <nombre de archivo> (para nombre personalizado)\n` +
      `- .addplugin <nombre de archivo> <carpeta> (para nombre y carpeta personalizados)`
    );
  }

  let code = quoted.text || quoted.body || "";

  if (
    quoted.mimetype === "application/javascript" ||
    quoted.filename?.endsWith(".js")
  ) {
    try {
      code = (await quoted.download()).toString();
    } catch (e) {
      return m.reply(`Lo siento *${m.pushName}*, el proceso falló porque el archivo no se pudo descargar.`);
    }
  }

  if (!code || code.length < 50) {
    return m.reply(`Lo siento *${m.pushName}*, el proceso falló porque el código es demasiado corto o no válido.`);
  }

  const hasExport = code.includes("module.exports") || code.includes("export ");
  const hasConfig = code.includes("pluginConfig") || code.includes("config");
  if (!hasExport || !hasConfig) {
    return m.reply(
      `Lo siento *${m.pushName}*, el proceso falló porque el código no tiene un formato de plugin válido. Asegúrate de que tenga export y config.`
    );
  }

  const extracted = extractPluginInfo(code);
  const args = m.args;

  let fileName = args[0] || extracted.name;
  let folderName = args[1] || extracted.category;

  if (!fileName) {
    return m.reply(
      `Lo siento *${m.pushName}*, no pude detectar el nombre del plugin. Por favor, usa el comando con el formato .addplugin <nombre de archivo>.`
    );
  }

  if (!folderName) folderName = "other";

  fileName = fileName.toLowerCase().replace(/[^a-z0-9\-_]/g, "");
  folderName = folderName.toLowerCase().replace(/[^a-z0-9\-_]/g, "");

  if (!fileName) {
    return m.reply(`Lo siento *${m.pushName}*, el proceso falló porque el nombre del archivo no es válido.`);
  }

  await m.react("🕕");

  try {
    const pluginsDir = path.join(process.cwd(), "plugins");
    const folderPath = path.join(pluginsDir, folderName);
    const filePath = path.join(folderPath, `${fileName}.js`);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    if (fs.existsSync(filePath)) {
      await m.react("❌");
      return m.reply(
        `Lo siento *${m.pushName}*, el archivo ${fileName}.js ya existe en la carpeta ${folderName}.\n\n` +
        `💡 Consejo: Usa el comando .ganticode ${fileName} ${folderName} si quieres reemplazar el código del plugin existente.`
      );
    }

    fs.writeFileSync(filePath, code);

    let reloadResult = { success: false };
    try {
      reloadResult = (await hotReloadPlugin(filePath)) || { success: true };
    } catch {}

    await m.react("✅");
    let replyText =
      `¡Proceso completado! El plugin se añadió correctamente al sistema.\n\n` +
      `- Archivo: ${fileName}.js\n` +
      `- Carpeta: ${folderName}\n` +
      `- Tamaño: ${code.length} bytes\n` +
      `- Estado del Reload: ${reloadResult.success ? "Exitoso" : "Pendiente"}\n\n` +
      `El plugin ya está activo y listo para usarse, ¡pruébalo!`;

    return m.reply(replyText);
  } catch (error) {
    await m.react("☢");
    await m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
