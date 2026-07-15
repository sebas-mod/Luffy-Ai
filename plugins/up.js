import { exec } from "child_process";
import { promisify } from "util";
import config from "../config.js";

const execAsync = promisify(exec);

const pluginConfig = {
  name: "up",
  alias: ["update", "actualizar", "gitpull"],
  category: "owner",
  description: "Actualiza el bot haciendo git pull del repositorio",
  usage: ".up",
  example: ".up",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  await m.react("🔄");

  try {
    const { stdout, stderr } = await execAsync("git pull origin main", {
      timeout: 60000,
    });

    const output = stdout.trim();

    if (output.includes("Already up to date") || output.includes("Ya está actualizado")) {
      await m.react("✅");
      return m.reply(
        `✅ *ACTUALIZACIÓN*\n\n> El bot ya está actualizado.`
      );
    }

    const lines = output.split("\n").filter((l) => l.trim());
    const commitMatch = output.match(/(\d+)\s+files? changed/);

    await m.react("✅");
    let reply = `✅ *ACTUALIZACIÓN COMPLETADA*\n\n`;
    reply += `📥 *Cambios descargados:*\n`;
    lines.forEach((line) => {
      reply += `> ${line}\n`;
    });

    if (commitMatch) {
      reply += `\n⚙️ Se detectaron cambios en archivos.`;
    }

    reply += `\n\n🔄 *Reiniciando bot...*`;

    await m.reply(reply);

    setTimeout(() => {
      process.exit(0);
    }, 2000);
  } catch (error) {
    await m.react("❌");
    return m.reply(
      `❌ *ERROR*\n\n> No se pudo actualizar:\n> ${error.message}`
    );
  }
}

export { pluginConfig as config, handler };
