import { enableAutoBackup, disableAutoBackup, getBackupStatus, triggerManualBackup, formatInterval } from '../../src/lib/luffy-auto-backup.js'
import * as timeHelper from '../../src/lib/luffy-time.js'
import config from '../../config.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
  name: "autobackup",
  alias: ["ab"],
  category: "owner",
  description: "Gestionar el sistema de respaldo automático",
  usage: ".autobackup <on/off/status/now> [interval]",
  example: ".autobackup on 5h",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  carne: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const args = m.text?.trim().split(/\s+/) || [];
  const action = args[0]?.toLowerCase();

  if (!action) {
    const status = getBackupStatus();
    const ownerNum = config.owner?.number?.[0] || "No configurado";

    let txt = `🗂️ *sɪsᴛᴇᴍᴀ ᴅᴇ ʀᴇsᴘᴀʟᴅᴏ ᴀᴜᴛᴏ*\n\n`;
    txt += `☽◯☾ ♰ 「 📊 *ᴇsᴛᴀᴅᴏ* 」\n`;
    txt += `┃ 🔘 Estado: ${status.enabled ? "✅ *ON*" : "❌ *OFF*"}\n`;
    txt += `┃ ⏱️ Intervalo: ${status.interval}\n`;
    txt += `┃ 📅 Último respaldo: ${status.lastBackup ? timeHelper.fromTimestamp(status.lastBackup, "DD MMMM YYYY HH:mm:ss") : "-"}\n`;
    txt += `┃ #️⃣ Total: ${status.backupCount} respaldos\n`;
    txt += `┃ 📤 Enviado a: ${ownerNum}\n`;
    txt += `╰━ ⊱༺༒༻⊰ ━╯\n\n`;

    txt += `*ᴄóᴍᴏ ᴜsᴀʀ:*\n`;
    txt += `> \`${m.prefix}autobackup on <intervalo>\`\n`;
    txt += `> \`${m.prefix}autobackup off\`\n`;
    txt += `> \`${m.prefix}autobackup status\`\n`;
    txt += `> \`${m.prefix}autobackup now\`\n\n`;

    txt += `*ꜰᴏʀᴍᴀᴛᴏ ᴅᴇʟ ɪɴᴛᴇʀᴠᴀʟᴏ:*\n`;
    txt += `> • \`5m\` = 5 minutos\n`;
    txt += `> • \`1h\` = 1 hora\n`;
    txt += `> • \`6h\` = 6 horas\n`;
    txt += `> • \`1d\` = 1 día\n\n`;

    txt += `*ᴇᴊᴇᴍᴘʟᴏ:*\n`;
    txt += `> \`${m.prefix}autobackup on 6h\` - respaldo cada 6 horas`;

    return m.reply(txt);
  }

  switch (action) {
    case "on":
    case "enable":
    case "start": {
      const interval = args[1];

      if (!interval) {
        return m.reply(
          `⚠️ *ꜱᴇ ɴᴇᴄᴇsɪᴛᴀ ᴜɴ ɪɴᴛᴇʀᴠᴀʟᴏ*\n\n` +
            `> \`${m.prefix}autobackup on <intervalo>\`\n\n` +
            `*ᴇᴊᴇᴍᴘʟᴏ:*\n` +
            `> \`${m.prefix}autobackup on 30m\` - cada 30 minutos\n` +
            `> \`${m.prefix}autobackup on 6h\` - cada 6 horas\n` +
            `> \`${m.prefix}autobackup on 1d\` - cada 1 día`,
        );
      }

      const result = enableAutoBackup(interval, sock);

      if (!result.success) {
        return m.reply(`👑•─────•👑\n❌ *ᴇʀʀᴏʀ*\n\n> ${result.error}\n♰ ──────── ♱`);
      }

      const ownerNum = config.owner?.number?.[0] || "Owner #1";

      await m.react("✅");
      return m.reply(
        `✅ *ʀᴇsᴘᴀʟᴅᴏ ᴀᴜᴛᴏ ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n` +
          `☽◯☾ ♰ 「 ⚙️ *ᴄᴏɴꜰɪɢᴜʀᴀᴄɪóɴ* 」\n` +
          `┃ ⏱️ Intervalo: ${result.interval}\n` +
          `┃ 📤 Enviado a: ${ownerNum}\n` +
          `┃ 📦 Excluidos: node_modules, .git, storages, etc\n` +
          `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
          `> El primer respaldo se enviará en ${result.interval}`,
      );
    }

    case "off":
    case "disable":
    case "stop": {
      disableAutoBackup();

      await m.react("✅");
      return m.reply(
        `❌ *ʀᴇsᴘᴀʟᴅᴏ ᴀᴜᴛᴏ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ*\n\n` +
          `> El respaldo automático se ha detenido.\n` +
          `> Usa \`${m.prefix}autobackup on <intervalo>\` para reactivarlo.`,
      );
    }

    case "status":
    case "info": {
      const status = getBackupStatus();
      const ownerNum = config.owner?.number?.[0] || "No configurado";

      let txt = `🗂️ *ᴇsᴛᴀᴅᴏ ᴅᴇʟ ʀᴇsᴘᴀʟᴅᴏ ᴀᴜᴛᴏ*\n\n`;
      txt += `☽◯☾ ♰ 「 📊 *ɪɴꜰᴏ* 」\n`;
      txt += `┃ 🔘 Habilitado: ${status.enabled ? "✅ Sí" : "❌ No"}\n`;
      txt += `┃ ⏱️ Intervalo: ${status.interval}\n`;
      txt += `┃ 🔄 Ejecutándose: ${status.isRunning ? "✅ Sí" : "❌ No"}\n`;
      txt += `┃ 📅 Último: ${status.lastBackup ? timeHelper.fromTimestamp(status.lastBackup, "DD MMMM YYYY HH:mm:ss") : "-"}\n`;
      txt += `┃ #️⃣ Total: ${status.backupCount} respaldos\n`;
      txt += `┃ 📤 Destino: ${ownerNum}\n`;
      txt += `╰━ ⊱༺༒༻⊰ ━╯`;

      return m.reply(txt);
    }

    case "now":
    case "manual":
    case "trigger": {
      await m.react("🕕");
      await m.reply(
        `👑•─────•👑\n🕕 *ᴄʀᴇᴀɴᴅᴏ ʀᴇsᴘᴀʟᴅᴏ...*\n\n> Por favor espera, estoy creando el respaldo...\n♰ ──────── ♱`,
      );

      try {
        await triggerManualBackup(sock);
        await m.react("✅");
        return m.reply(
          `👑•─────•👑\n✅ *ʀᴇsᴘᴀʟᴅᴏ ᴄᴏᴍᴘʟᴇᴛᴀᴅᴏ*\n\n> El respaldo se ha enviado al owner!\n♰ ──────── ♱`,
        );
      } catch (error) {
        await m.react('☢');
        await m.reply(te(m.prefix, m.command, m.pushName));
      }
    }

    default:
      return m.reply(
        `⚠️ *ᴀᴄᴄɪóɴ ɴᴏ ᴠáʟɪᴅᴀ*\n\n` +
          `> Elige: \`on\`, \`off\`, \`status\` o \`now\`\n` +
          `> Ejemplo: \`${m.prefix}autobackup on 6h\``,
      );
  }
}

export { pluginConfig as config, handler }