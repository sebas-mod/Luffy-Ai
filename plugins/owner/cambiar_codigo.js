import fs from "fs";
import path from "path";
import { hotReloadPlugin } from "../../src/lib/luffy-plugins.js";
import te from "../../src/lib/luffy-error.js";

const pluginConfig = {
  name: "cambiar_codigo",
  alias: ["replaceplugin", "updateplugin", "gantiplugin"],
  category: "owner",
  description: "Cambiar el código de un plugin ya existente",
  usage: ".ganticode [nombrearchivo] [carpeta]",
  example: ".ganticode ping main",
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
  const nameMatch = code.match(/name:\s*['"`]([^'"`]+)['"`]/i);
  if (nameMatch) info.name = nameMatch[1];
  const categoryMatch = code.match(/category:\s*['"`]([^'"`]+)['"`]/i);
  if (categoryMatch) info.category = categoryMatch[1];
  return info;
}

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
  const quoted = m.quoted;

  if (!quoted) {
    return m.reply(
      `Hola *${m.pushName}*, parece que aún no has respondido al nuevo código del plugin.\n\n` +
      `Responde al nuevo código del plugin con el comando:\n` +
      `- .ganticode (detección automática)\n` +
      `- .ganticode <nombre de archivo> (nombre personalizado)\n` +
      `- .ganticode <nombre de archivo> <carpeta> (nombre y carpeta personalizados)\n\n` +
      `Tranquilo, el código antiguo se respaldará automáticamente antes de ser reemplazado.`
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
    return m.reply(`Lo siento *${m.pushName}*, el proceso falló porque el código es demasiado corto o no es válido.`);
  }

  const hasExport = code.includes("module.exports") || code.includes("export ");
  const hasConfig = code.includes("pluginConfig") || code.includes("config");
  if (!hasExport || !hasConfig) {
    return m.reply(
      `Lo siento *${m.pushName}*, el proceso falló porque el código no es un formato de plugin válido. Asegúrate de que tenga export y config.`
    );
  }

  const extracted = extractPluginInfo(code);
  const args = m.args;

  let fileName = args[0] || extracted.name;
  let folderName = args[1] || extracted.category;

  if (!fileName) {
    return m.reply(
      `Lo siento *${m.pushName}*, no pude detectar el nombre del plugin. Por favor usa el comando con el formato .ganticode <nombre de archivo>.`
    );
  }

  fileName = fileName.toLowerCase().replace(/[^a-z0-9\-_]/g, "");

  if (!fileName) {
    return m.reply(`Lo siento *${m.pushName}*, el proceso falló porque el nombre del archivo no es válido.`);
  }

  await m.react("🕕");

  try {
    const pluginsDir = path.join(process.cwd(), "plugins");
    const existing = findPluginFile(pluginsDir, fileName);

    let filePath;
    let targetFolder;
    let isNewFile = false;
    let backupPath = null;
    let oldSize = 0;

    if (existing) {
      filePath = existing.path;
      targetFolder = existing.folder;
      oldSize = fs.statSync(filePath).size;

      const backupDir = path.join(process.cwd(), "backup", "plugins");
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, 19);
      backupPath = path.join(backupDir, `${fileName}_${timestamp}.js`);
      fs.copyFileSync(filePath, backupPath);
    } else {
      if (!folderName) folderName = "other";
      folderName = folderName.toLowerCase().replace(/[^a-z0-9\-_]/g, "");

      targetFolder = folderName;
      const folderPath = path.join(pluginsDir, targetFolder);

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      filePath = path.join(folderPath, `${fileName}.js`);
      isNewFile = true;
    }

    fs.writeFileSync(filePath, code);

    let reloadResult = { success: false };
    try {
      reloadResult = (await hotReloadPlugin(filePath)) || { success: true };
    } catch {}

    await m.react("✅");

    let replyText =
      `¡Proceso completado! El código del plugin se ${isNewFile ? "agregó" : "actualizó"} correctamente.\n\n` +
      `- Archivo: ${fileName}.js\n` +
      `- Carpeta: ${targetFolder}\n` +
      `- Tamaño: ${code.length} bytes\n`;

    if (!isNewFile) {
      replyText += `- Tamaño anterior: ${oldSize} bytes\n`;
    }

    replyText +=
      `- Estado de recarga: ${reloadResult.success ? "Exitoso" : "Pendiente"}\n\n`;

    if (backupPath) {
      const relBackup = path.relative(process.cwd(), backupPath);
      replyText += `El archivo anterior se respaldó de forma segura en la siguiente ubicación:\n${relBackup}\n\n`;
    }

    replyText += `¡El plugin ya está activo y listo para usarse, pruébalo!`;

    return m.reply(replyText);
  } catch (error) {
    await m.react("☢");
    await m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
