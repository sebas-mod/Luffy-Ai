import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { hotReloadPlugin } from "../../src/lib/ourin-plugins.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "gantiscraper",
  alias: ["replacescraper", "updatescraper", "gantiscrape"],
  category: "owner",
  description: "Cambia el código de un scraper existente",
  usage: ".gantiscraper [nombrefile]",
  example: ".gantiscraper ig",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const SCRAPER_DIR = path.join(process.cwd(), "src", "scraper");
const PLUGINS_DIR = path.join(process.cwd(), "plugins");

function listScrapers() {
  if (!fs.existsSync(SCRAPER_DIR)) return [];
  return fs
    .readdirSync(SCRAPER_DIR)
    .filter((f) => f.endsWith(".js"))
    .map((f) => f.replace(".js", ""));
}

function findScraperFile(name) {
  const files = fs.readdirSync(SCRAPER_DIR).filter((f) => f.endsWith(".js"));

  for (const file of files) {
    if (file.replace(".js", "").toLowerCase() === name.toLowerCase()) {
      return { file, path: path.join(SCRAPER_DIR, file) };
    }
  }
  return null;
}

function walkJsFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkJsFiles(entryPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(entryPath);
    }
  }

  return files;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findDependentPluginFiles(scraperName) {
  const escapedName = escapeRegex(scraperName);
  const patterns = [
    new RegExp(`src[\\/]scraper[\\/]${escapedName}\\.js`, "i"),
    new RegExp(`scraper[\\/].*${escapedName}\\.js`, "i"),
  ];

  return walkJsFiles(PLUGINS_DIR).filter((filePath) => {
    const content = fs.readFileSync(filePath, "utf8");
    return patterns.some((pattern) => pattern.test(content));
  });
}

async function hotReloadScraperModule(filePath) {
  const fileUrl = pathToFileURL(path.resolve(filePath)).href;
  await import(`${fileUrl}?t=${Date.now()}`);
  return { success: true };
}

async function hotReloadDependentPlugins(scraperName) {
  const dependentFiles = findDependentPluginFiles(scraperName);
  const results = [];

  for (const dependentFile of dependentFiles) {
    const reloadResult = await hotReloadPlugin(dependentFile);
    results.push({
      file: path.relative(process.cwd(), dependentFile),
      success: !!reloadResult?.success,
      error: reloadResult?.error || null,
    });
  }

  return results;
}

async function handler(m, { sock }) {
  const quoted = m.quoted;
  const args = m.args;

  if (args[0]?.toLowerCase() === "list") {
    const scrapers = listScrapers();
    if (!scrapers.length) {
      return m.reply(`📂 La carpeta src/scraper está vacía`);
    }

    let text = `📂 *DAFTAR SCRAPER*\n\n` + `╭─〔 *src/scraper* 〕───⬣\n`;

    scrapers.forEach((s, i) => {
      const stat = fs.statSync(path.join(SCRAPER_DIR, `${s}.js`));
      text += `│ ${i + 1}. \`${s}.js\` (${(stat.size / 1024).toFixed(1)} KB)\n`;
    });

    text +=
      `╰───────⬡\n\n` +
      `Total: ${scrapers.length} scraper\n\n` +
      `> Usa \`${m.prefix}gantiscraper <nombre>\` con reply code`;

    return m.reply(text);
  }

  if (!quoted) {
    return m.reply(
      `🔄 *GANTI SCRAPER*\n\n` +
        `Reply code scraper nuevo con caption:\n` +
        `\`${m.prefix}gantiscraper\` - Auto detect de export\n` +
        `\`${m.prefix}gantiscraper nombrefile\` - Custom nombre file\n\n` +
        `📋 *Lihat lista scraper:*\n` +
        `\`${m.prefix}gantiscraper list\`\n\n` +
        `⚠️ *PERINGATAN:*\nEl código antiguo se hará backup antes de ser reemplazado`,
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
      return m.reply(`❌ *GAGAL*\n\nError al descargar el archivo`);
    }
  }

  if (!code || code.length < 30) {
    return m.reply(`❌ *GAGAL*\n\nEl código es demasiado corto o no válido`);
  }

  const hasExport =
    code.includes("module.exports") ||
    code.includes("export ") ||
    code.includes("export default") ||
    code.includes("export {");

  if (!hasExport) {
    return m.reply(
      `❌ *GAGAL*\n\nCode no es un formato de scraper válido\nDebe hay export`,
    );
  }

  let fileName = args[0];

  if (!fileName) {
    const defaultMatch = code.match(
      /export\s+default\s+(?:async\s+)?function\s+(\w+)|export\s+default\s+(\w+)/,
    );
    if (defaultMatch) {
      fileName = defaultMatch[1] || defaultMatch[2];
    } else {
      const namedExport = code.match(
        /export\s+(?:async\s+)?function\s+(\w+)|export\s+const\s+(\w+)\s*=/,
      );
      if (namedExport) {
        fileName = namedExport[1] || namedExport[2];
      }
    }
  }

  if (!fileName) {
    return m.reply(
      `❌ *GAGAL*\n\nNo se puede detectar el nombre del scraper\nUsa \`${m.prefix}gantiscraper <nombrefile>\``,
    );
  }

  fileName = fileName.toLowerCase().replace(/[^a-z0-9\-_]/g, "");

  if (!fileName) {
    return m.reply(`❌ *GAGAL*\n\nNombre de archivo no válido`);
  }

  await m.react("🕕");

  try {
    if (!fs.existsSync(SCRAPER_DIR)) {
      fs.mkdirSync(SCRAPER_DIR, { recursive: true });
    }

    const existing = findScraperFile(fileName);
    let filePath = path.join(SCRAPER_DIR, `${fileName}.js`);
    let isNewFile = !existing;
    let backupPath = null;
    let oldSize = 0;

    if (existing) {
      filePath = existing.path;
      oldSize = fs.statSync(filePath).size;

      const backupDir = path.join(process.cwd(), "backup", "scraper");
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, 19);
      backupPath = path.join(backupDir, `${fileName}_${timestamp}.js`);
      fs.copyFileSync(filePath, backupPath);
    }

    fs.writeFileSync(filePath, code);

    let scraperReload = { success: false };
    let pluginReloads = [];

    try {
      scraperReload = await hotReloadScraperModule(filePath);
      pluginReloads = await hotReloadDependentPlugins(fileName);
    } catch (reloadError) {
      if (backupPath && fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, filePath);
      } else if (isNewFile && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw reloadError;
    }

    await m.react("✅");

    let replyText =
      `✅ *SCRAPER ${isNewFile ? "DITAMBAH" : "DIGANTI"}*\n\n` +
      `╭─〔 *DETAIL* 〕───⬡\n` +
      `│ File: \`${fileName}.js\`\n` +
      `│ Folder: \`src/scraper\`\n` +
      `│ Size: \`${code.length} bytes\`\n`;

    if (!isNewFile) {
      replyText += `│ Old Size: \`${oldSize} bytes\`\n`;
    }

    replyText += `╰───────⬡\n\n`;

    if (backupPath) {
      const relBackup = path.relative(process.cwd(), backupPath);
      replyText += `💾 *Backup:*\n\`${relBackup}\`\n\n`;
    }

    const reloadSuccess = pluginReloads.filter((item) => item.success);
    const reloadFailed = pluginReloads.filter((item) => !item.success);

    replyText +=
      `🔄 *Hot Reload:*\n` +
      `- Scraper: ${scraperReload.success ? "✅ Sukses" : "⚠️ Pending"}\n` +
      `- Plugins Detectados: ${pluginReloads.length}\n` +
      `- Plugins Éxito Reload: ${reloadSuccess.length}\n` +
      `- Plugins Fallo Reload: ${reloadFailed.length}\n\n`;

    if (reloadSuccess.length) {
      replyText += `✅ *Plugin Reloaded:*\n`;
      replyText += reloadSuccess
        .slice(0, 10)
        .map((item) => `- \`${item.file}\``)
        .join("\n");
      replyText += `\n\n`;
    }

    if (reloadFailed.length) {
      replyText += `⚠️ *Plugin Fallo Reload:*\n`;
      replyText += reloadFailed
        .slice(0, 10)
        .map(
          (item) => `- \`${item.file}\`${item.error ? ` (${item.error})` : ""}`,
        )
        .join("\n");
      replyText += `\n\n`;
    }

    if (!pluginReloads.length) {
      replyText += `ℹ️ No hay plugins que importen directamente este scraper.\n\n`;
    }

    if (reloadFailed.length > 0) {
      replyText += `⚠️ La recarga separada falló, puede ser necesario reiniciar el bot`;
    } else {
      replyText += `Scraper ya activo y listo para usar!`;
    }

    return m.reply(replyText);
  } catch (error) {
    await m.react("☢");
    await m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
