import fs from "fs";
import path from "path";
import config from "../../config.js";
import { AIRich } from "../../src/lib/ourin-builder.js";
const pluginConfig = {
  name: "getplugin",
  alias: ["gp", "getcode", "plugincode", "sourcecode"],
  category: "owner",
  description: "Obtiene el código fuente de un plugin",
  usage: ".getplugin <nombre plugin>",
  example: ".getplugin menu",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function searchPlugin(name, pluginsDir) {
  const categories = fs.readdirSync(pluginsDir).filter((f) => {
    return fs.statSync(path.join(pluginsDir, f)).isDirectory();
  });

  for (const category of categories) {
    const categoryPath = path.join(pluginsDir, category);
    const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith(".js"));

    for (const file of files) {
      const baseName = file.replace(".js", "").toLowerCase();
      if (baseName === name.toLowerCase()) {
        return {
          path: path.join(categoryPath, file),
          category,
          file,
        };
      }
    }
  }

  for (const category of categories) {
    const categoryPath = path.join(pluginsDir, category);
    const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith(".js"));

    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        const aliasMatch = content.match(/alias:\s*\[([^\]]+)\]/);
        if (aliasMatch) {
          const aliases = aliasMatch[1].match(/['"`]([^'"`]+)['"`]/g);
          if (aliases) {
            const cleanAliases = aliases.map((a) =>
              a.replace(/['"`]/g, "").toLowerCase(),
            );
            if (cleanAliases.includes(name.toLowerCase())) {
              return {
                path: filePath,
                category,
                file,
              };
            }
          }
        }
      } catch { }
    }
  }

  return null;
}

function getSimilarPlugins(name, pluginsDir) {
  const results = [];
  const categories = fs.readdirSync(pluginsDir).filter((f) => {
    return fs.statSync(path.join(pluginsDir, f)).isDirectory();
  });

  for (const category of categories) {
    const categoryPath = path.join(pluginsDir, category);
    const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith(".js"));

    for (const file of files) {
      const baseName = file.replace(".js", "").toLowerCase();
      if (
        baseName.includes(name.toLowerCase()) ||
        name.toLowerCase().includes(baseName)
      ) {
        results.push(`${category}/${file}`);
      }
    }
  }

  return results.slice(0, 5);
}

async function handler(m, { sock }) {
  if (!config.isOwner(m.sender)) {
    return m.reply("❌ *¡Solo Propietario!*");
  }

  const pluginName = m.args?.[0]?.trim();

  if (!pluginName) {
    return m.reply(
      `📦 *OBTENER PLUGIN*\n\n` +
      `> Obtener el código fuente del plugin\n\n` +
      `╭┈┈⬡「 📋 *FORMATO* 」\n` +
      `┃ .getplugin <nombre>\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `*Ejemplo:*\n` +
      `> .getplugin menu\n` +
      `> .getplugin sticar\n` +
      `> .getplugin game/tebakimagen`,
    );
  }

  const pluginsDir = path.join(process.cwd(), "plugins");

  let pluginInfo = null;

  if (pluginName.includes("/")) {
    const [category, file] = pluginName.split("/");
    const filePath = path.join(
      pluginsDir,
      category,
      file.endsWith(".js") ? file : `${file}.js`,
    );
    if (fs.existsSync(filePath)) {
      pluginInfo = {
        path: filePath,
        category,
        file: file.endsWith(".js") ? file : `${file}.js`,
      };
    }
  } else {
    pluginInfo = await searchPlugin(pluginName, pluginsDir);
  }

  if (!pluginInfo) {
    const similar = getSimilarPlugins(pluginName, pluginsDir);
    let text = `❌ *PLUGIN NO ENCONTRADO*\n\n`;
    text += `> El plugin \`${pluginName}\` no fue encontrado\n\n`;

    if (similar.length > 0) {
      text += `*¿Quizás buscas?:*\n`;
      similar.forEach((s) => {
        text += `> - \`${s}\`\n`;
      });
    }

    return m.reply(text);
  }

  const code = fs.readFileSync(pluginInfo.path);

  if (code.length > 10000) {
    return await sock.sendMessage(m.chat, {
      document: code.toString("utf-8"),
      fileName: pluginInfo.file,
      fileLength: 999999999,
      caption: `🦪 Hola Propietario ${m.pushName}, lo siguiente es el código fuente del plugin que solicitaste
       
Puedes guardar el documento de arriba, o también puedes copiar el código mediante el botón de abajo

❓ *¿Por qué por documento?*
Porque las líneas de código son muy largas, y usar un bloque de código podría causar fallo :(`,
      footer: "🍙 Puedes copiar el código abajo",
      interactiveButtons: [
        {
          name: 'cta_copy',
          buttonParamsJson: JSON.stringify({
            display_text: '🥠 Copiar código',
            copy_code: code
          })
        }
      ]
    }, { quoted: m });
  }

  await new AIRich(sock)
    .addText(
      `🍿 Hola Propietario ${m.pushName}, lo siguiente es el código fuente del plugin que solicitaste\n- 🥗 Nombre Plugin: ${pluginInfo.file}\n- ☘ Categoría: ${pluginInfo.category}\n\n`,
    )
    .addCode("javascript", code.toString("utf-8"))
    .addText("\n\nNota: copia primero el código de arriba")
    .send(m.chat);
}

export { pluginConfig as config, handler };
