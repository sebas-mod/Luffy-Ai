import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { loadPlugin } from "../../src/lib/luffy-plugins.js";
import {
  getPluginRuntimeErrors,
  clearPluginRuntimeErrors,
} from "../../src/lib/luffy-plugin-errors.js";

const pluginConfig = {
  name: "revisar_plugins",
  alias: ["checkpl", "checkplugins", "pluginscheck", "revisarpl"],
  category: "owner",
  description:
    "Detecta plugins con errores de carga y errores en runtime, y estado del registro de juegos",
  usage: ".revisar_plugins [clean|help]",
  example: ".revisar_plugins",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  carne: 0,
  isEnabled: true,
};

function scanPluginFiles(pluginsDir) {
  const files = [];
  const categories = fs.readdirSync(pluginsDir, { withFileTypes: true });

  for (const cat of categories) {
    const catPath = path.join(pluginsDir, cat.name);
    if (cat.isDirectory()) {
      const items = fs.readdirSync(catPath, { withFileTypes: true });
      for (const item of items) {
        if (
          item.isFile() &&
          item.name.endsWith(".js") &&
          !item.name.startsWith("_")
        ) {
          files.push(path.join(catPath, item.name));
        }
      }
    } else if (
      cat.isFile() &&
      cat.name.endsWith(".js") &&
      cat.name !== "_index.js"
    ) {
      files.push(catPath);
    }
  }

  return files;
}

async function tryLoadRaw(filePath) {
  try {
    const fileUrl = pathToFileURL(path.resolve(filePath)).href;
    const mod = await import(fileUrl);
    return { ok: true, mod };
  } catch (error) {
    return { ok: false, error };
  }
}

async function buildRuntimeReport() {
  const errors = getPluginRuntimeErrors({ limit: 25 });
  if (!errors.length) {
    return { txt: "✔️ *Sin errores en runtime registrados.*", total: 0 };
  }

  const badGroups = new Map();
  for (const e of errors) {
    const key = e.pluginName || e.command || "unknown";
    if (!badGroups.has(key)) badGroups.set(key, []);
    badGroups.get(key).push(e);
  }

  const lines = [];
  for (const [name, list] of badGroups) {
    const countSuffix = list.length > 1 ? ` (x${list.length})` : "";
    lines.push(`🔴 *${name}*${countSuffix}`);
    const last = list[0];
    const at = new Date(last.at).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    lines.push(`   └ Comando: \`${last.command}\` · ${at}`);
    lines.push(`   └ ${truncate(last.error, 140)}`);
  }

  return { txt: lines.join("\n"), total: errors.length };
}

function isRegRequired(db) {
  try {
    return !!(db?.setting?.("registrationRequired") ?? false);
  } catch {
    return false;
  }
}

async function buildGameRegistrationReport(db, allPlugins) {
  const globalOn = isRegRequired(db);

  let txt = `> Registro obligatorio global (.sistema_registro): *${
    globalOn ? "✅ ACTIVADO" : "❌ DESACTIVADO"
  }*\n`;
  txt += `> Perfil de juego \`.registrogame\`: guarda tu nombre para los rankings (opcional)\n\n`;

  const gamePlugins = allPlugins.filter((p) =>
    /[\\/]game[\\/]/.test(p.filePath || ""),
  );

  const forced = [];
  const noCheck = [];

  for (const p of gamePlugins) {
    const code = p._rawCode || "";
    const checksJ2 = /j2Registered|j2Name|j2RegisteredAt/.test(code);
    const checksReg =
      /\bisRegistered\b|registrationRequired|sistema_registro/.test(code);
    const skip = p.config?.skipRegistration === true;

    if (skip) {
      forced.push(`• *${p.config.name}* → exento (\`skipRegistration\`)`);
    } else if (checksJ2) {
      forced.push(`• *${p.config.name}* → exige \`registrogame\``);
    } else if (checksReg) {
      forced.push(`• *${p.config.name}* → exige registro general`);
    } else {
      noCheck.push(p.config?.name || "?");
    }
  }

  if (forced.length) {
    txt += `🔒 *Juegos que SÍ fuerzan registro:*\n${forced.join("\n")}\n\n`;
  } else {
    txt += `🔒 *Ningún juego exige registro por su cuenta.*\n\n`;
  }

  if (globalOn) {
    txt += `⚠️ Con el registro global *ACTIVADO*, todos los comandos (incluidos los ${noCheck.length} juegos sin chequeo propio) piden registro general (.\`registrar\`), salvo los marcados con \`skipRegistration\`.\n`;
    txt += `> Entonces los juegos SOLO funcionan con registro.`;
  } else {
    txt += `💡 Con el registro global *DESACTIVADO*, los juegos (${noCheck.length}) funcionan *sin registro*.\n`;
    txt += `> Para que funcionen solo con registro: activa \`.sistema_registro on\` (afecta a todo el bot) o añade el chequeo de \`j2Registered\` en cada juego.`;
  }

  return txt;
}

async function handler(m, { db: contextDb }) {
  await m.react("🕕");

  const arg = String(m.args?.[0] || "").toLowerCase();

  if (arg === "clean" || arg === "limpiar" || arg === "clear") {
    clearPluginRuntimeErrors();
    await m.react("🧹");
    return m.reply(
      `☽◯☾ ♰ 🧹 *REGISTRO DE ERRORES LIMPIADO*\n\n` +
        `> El historial de errores de runtime se eliminó.\n` +
        `> Los errores se volverán a registrar cuando un comando falle.`,
    );
  }

  if (arg === "help" || arg === "ayuda") {
    return m.reply(
      `☽◯☾ ╭ ♰ ⚙️ REVISAR PLUGINS ♰ ━╮ ☽◯☾\n\n` +
        `> \`.revisar_plugins\` → Escaneo completo (carga + runtime + registro juegos)\n` +
        `> \`.revisar_plugins dups\` → Lista todos los nombres/alias duplicados\n` +
        `> \`.revisar_plugins clean\` → Vaciar historial de errores en runtime\n` +
        `> \`.revisar_plugins help\` → Esta ayuda\n\n` +
        `╰━ ⊱༺༒༻⊰ ━╯`,
    );
  }

  let db = null;
  if (contextDb) {
    db = contextDb;
  } else {
    try {
      db = (await import("../../src/lib/luffy-database.js")).getDatabase();
    } catch {}
  }

  const pluginsDir = path.join(process.cwd(), "plugins");
  const allFiles = scanPluginFiles(pluginsDir);
  const failed = [];
  const broken = [];
  const ok = [];

  for (const filePath of allFiles) {
    const fileName = path.basename(filePath);
    const folderName = path
      .relative(pluginsDir, filePath)
      .split(path.sep)
      .slice(0, -1)
      .join("/");

    const raw = await tryLoadRaw(filePath);
    if (!raw.ok) {
      failed.push({ filePath, fileName, folderName, error: raw.error });
      continue;
    }

    const plugin = await loadPlugin(filePath);
    if (!plugin) {
      broken.push({
        filePath,
        fileName,
        folderName,
        error: new Error("No exporta config/handler válido"),
      });
      continue;
    }

    if (!plugin.handler || typeof plugin.handler !== "function") {
      broken.push({
        filePath,
        fileName,
        folderName,
        error: new Error("handler no es función"),
      });
      continue;
    }

    plugin._rawCode = fs.readFileSync(filePath, "utf8");
    ok.push(plugin);
  }

  const dupByName = new Map();
  for (const p of ok) {
    const names = Array.isArray(p.config.name)
      ? p.config.name
      : [p.config.name];
    for (const n of names) {
      if (!dupByName.has(n)) dupByName.set(n, []);
      dupByName.get(n).push(p.filePath);
    }
    const alias = Array.isArray(p.config.alias)
      ? p.config.alias
      : p.config.alias
        ? [p.config.alias]
        : [];
    for (const a of alias) {
      if (!dupByName.has(a)) dupByName.set(a, []);
      dupByName.get(a).push(p.filePath);
    }
  }
  const duplicates = [];
  for (const [name, files] of dupByName.entries()) {
    if (files.length > 1) {
      duplicates.push(
        `🔁 nombre/alias *${name}* usado en:\n   ${files.join("\n   ")}`,
      );
    }
  }

  const reports = [];
  for (const f of failed) {
    reports.push(
      `❌ *FALLA AL CARGAR* → ${f.folderName}/${f.fileName}\n   ${truncate(f.error?.message || String(f.error), 160)}`,
    );
  }
  for (const b of broken) {
    reports.push(
      `🛑 *NO VÁLIDO* → ${b.folderName}/${b.fileName}\n   ${truncate(b.error?.message || String(b.error), 160)}`,
    );
  }

  const runtime = await buildRuntimeReport();
  const gameReg = await buildGameRegistrationReport(db, ok);

  if (arg === "dups" || arg === "duplicados") {
    if (!duplicates.length) {
      await m.react("✅");
      return m.reply(`☽◯☾ ♰ ✅ No hay nombres o alias duplicados entre los plugins.`);
    }
    let out =
      `☽◯☾ ╭ ♰ 📛 DUPLICADOS ♰ ━╮ ☽◯☾\n\n${duplicates.join("\n\n")}`;
    if (out.length > 4000) {
      out = out.slice(0, 3900) + "\n\n_...(truncado)_";
    }
    await m.react("⚠️");
    return m.reply(out);
  }

  let txt = `☽◯☾ ╭━ ♰ ⚙️ REVISIÓN DE PLUGINS ♰ ━╮ ☽◯☾\n\n`;

  const totalProblems = reports.length + runtime.total + duplicates.length;

  if (totalProblems === 0) {
    txt += `✅ *Todos los plugins funcionan correctamente!*\n`;
    txt += `┃ 📦 Escaneados: *${allFiles.length}*\n`;
    txt += `┃ ✔️ Cargados OK: *${ok.length}*\n`;
  } else {
    txt += `📦 Archivos escaneados: *${allFiles.length}*\n`;
    txt += `✔️ Cargados OK: *${ok.length}*\n`;
    if (runtime.total) txt += `🔴 Errores en runtime: *${runtime.total}*\n`;
    if (reports.length) txt += `☢️ Con errores de carga: *${reports.length}*\n`;
    if (duplicates.length) txt += `📛 Nombres duplicados: *${duplicates.length}*\n`;
  }
  txt += `╰━ ⊱༺༒༻⊰ ━╯\n`;

  const sections = [];

  if (reports.length) {
    sections.push(`▄▄▄ ☢️ ERRORES DE CARGA ☢️ ▄▄▄\n${reports.join("\n\n")}`);
  }

  if (runtime.total) {
    sections.push(
      `▄▄▄ 🔴 ERRORES EN RUNTIME (al usar el comando) 🔴 ▄▄▄\n${runtime.txt}\n\n> 🧹 Para vaciar: \`${m.prefix}revisar_plugins clean\``,
    );
  } else {
    sections.push(`▄▄▄ 🔴 ERRORES EN RUNTIME 🔴 ▄▄▄\n${runtime.txt}`);
  }

  sections.push(`▄▄▄ 🎮 REGISTRO EN JUEGOS ▄▄▄\n${gameReg}`);

  if (duplicates.length) {
    const shown = duplicates.slice(0, 5);
    const more = duplicates.length - shown.length;
    let dupTxt = `${shown.join("\n\n")}`;
    if (more > 0) dupTxt += `\n\n_...y ${more} más (usa \`.revisar_plugins dups\` para verlos)_`;
    sections.push(`▄▄▄ 📛 DUPLICADOS 📛 ▄▄▄\n${dupTxt}`);
  }

  for (const section of sections) {
    if (txt.length + section.length > 3950) {
      txt += `\n\n${section.slice(0, 3950 - txt.length)}`;
      txt += `\n\n_...(mensaje truncado por longitud)_`;
      break;
    }
    txt += `\n\n${section}`;
  }

  await m.react(reports.length || runtime.total ? "❌" : "✅");
  return m.reply(txt);
}

function truncate(str, max = 160) {
  return str && str.length > max ? str.slice(0, max) + "…" : str || "";
}

export { pluginConfig as config, handler };