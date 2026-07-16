import { enableAutoBackup, disableAutoBackup, getBackupStatus, triggerManualBackup, formatInterval } from '../../src/lib/ourin-auto-backup.js'
import * as timeHelper from '../../src/lib/ourin-time.js'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
  name: "autobackup",
  alias: ["backup", "ab"],
  category: "owner",
  description: "Gestiona el sistema de copias de seguridad automáticas",
  usage: ".autobackup <on/off/status/now> [interval]",
  example: ".autobackup on 5h",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const args = m.text?.trim().split(/\s+/) || [];
  const action = args[0]?.toLowerCase();

  if (!action) {
    const status = getBackupStatus();
    const ownerNum = config.owner?.number?.[0] || "No diset";

    let txt = `🗂️ *ᴀᴜᴛᴏ ʙᴀᴄᴋᴜᴘ sʏsᴛᴇᴍ*\n\n`;
    txt += `╭┈┈⬡「 📊 *sᴛᴀᴛᴜs* 」\n`;
    txt += `┃ 🔘 Status: ${status.enabled ? "✅ *ON*" : "❌ *OFF*"}\n`;
    txt += `┃ ⏱️ Interval: ${status.interval}\n`;
    txt += `┃ 📅 Last Backup: ${status.lastBackup ? timeHelper.fromTimestamp(status.lastBackup, "DD MMMM YYYY HH:mm:ss") : "-"}\n`;
    txt += `┃ #️⃣ Total: ${status.backupCount} backup\n`;
    txt += `┃ 📤 Dienvía a: ${ownerNum}\n`;
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;

    txt += `*ᴄᴀʀᴀ ᴘᴀᴋᴀɪ:*\n`;
    txt += `> \`${m.prefix}autobackup on <interval>\`\n`;
    txt += `> \`${m.prefix}autobackup off\`\n`;
    txt += `> \`${m.prefix}autobackup status\`\n`;
    txt += `> \`${m.prefix}autobackup now\`\n\n`;

    txt += `*ꜰᴏʀᴍᴀᴛ ɪɴᴛᴇʀᴠᴀʟ:*\n`;
    txt += `> • \`5m\` = 5 minuto\n`;
    txt += `> • \`1h\` = 1 hora\n`;
    txt += `> • \`6h\` = 6 horas\n`;
    txt += `> • \`1d\` = 1 día\n\n`;

    txt += `*ᴄᴏɴᴛᴏʜ:*\n`;
    txt += `> \`${m.prefix}autobackup on 6h\` - backup cada 6 horas`;

    return m.reply(txt);
  }

  switch (action) {
    case "on":
    case "enable":
    case "start": {
      const interval = args[1];

      if (!interval) {
        return m.reply(
          `⚠️ *ɪɴᴛᴇʀᴠᴀʟ ᴅɪʙᴜᴛᴜʜᴋᴀɴ*\n\n` +
            `> \`${m.prefix}autobackup on <interval>\`\n\n` +
            `*ᴄᴏɴᴛᴏʜ:*\n` +
            `> \`${m.prefix}autobackup on 30m\` - cada 30 minutos\n` +
            `> \`${m.prefix}autobackup on 6h\` - cada 6 horas\n` +
            `> \`${m.prefix}autobackup on 1d\` - cada 1 día`,
        );
      }

      const result = enableAutoBackup(interval, sock);

      if (!result.success) {
        return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> ${result.error}`);
      }

      const ownerNum = config.owner?.number?.[0] || "Owner #1";

      await m.react("✅");
      return m.reply(
        `✅ *ᴀᴜᴛᴏ ʙᴀᴄᴋᴜᴘ ᴅɪᴀᴋᴛɪꜰᴋᴀɴ*\n\n` +
          `╭┈┈⬡「 ⚙️ *sᴇᴛᴛɪɴɢs* 」\n` +
          `┃ ⏱️ Interval: ${result.interval}\n` +
          `┃ 📤 Dienvía a: ${ownerNum}\n` +
          `┃ 📦 Exclude: node_modules, .git, storages, dll\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `> El primer backup se enviará en ${result.interval}`,
      );
    }

    case "off":
    case "disable":
    case "stop": {
      disableAutoBackup();

      await m.react("✅");
      return m.reply(
        `❌ *ᴀᴜᴛᴏ ʙᴀᴄᴋᴜᴘ ᴅɪɴᴏɴᴀᴋᴛɪꜰᴋᴀɴ*\n\n` +
          `> El backup automático ha sido detenido.\n` +
          `> Usa \`${m.prefix}autobackup on <interval>\` para activarlo de nuevo.`,
      );
    }

    case "status":
    case "info": {
      const status = getBackupStatus();
      const ownerNum = config.owner?.number?.[0] || "No diset";

      let txt = `🗂️ *sᴛᴀᴛᴜs ᴀᴜᴛᴏ ʙᴀᴄᴋᴜᴘ*\n\n`;
      txt += `╭┈┈⬡「 📊 *ɪɴꜰᴏ* 」\n`;
      txt += `┃ 🔘 Enabled: ${status.enabled ? "✅ Ya" : "❌ Tidak"}\n`;
      txt += `┃ ⏱️ Interval: ${status.interval}\n`;
      txt += `┃ 🔄 Running: ${status.isRunning ? "✅ Ya" : "❌ Tidak"}\n`;
      txt += `┃ 📅 Last: ${status.lastBackup ? timeHelper.fromTimestamp(status.lastBackup, "DD MMMM YYYY HH:mm:ss") : "-"}\n`;
      txt += `┃ #️⃣ Total: ${status.backupCount} backup\n`;
      txt += `┃ 📤 Target: ${ownerNum}\n`;
      txt += `╰┈┈┈┈┈┈┈┈⬡`;

      return m.reply(txt);
    }

    case "now":
    case "manual":
    case "trigger": {
      await m.react("🕕");
      await m.reply(
        `🕕 *ᴍᴇᴍʙᴜᴀᴛ ʙᴀᴄᴋᴜᴘ...*\n\n> Por favor espera, está creando la copia de seguridad...`,
      );

      try {
        await triggerManualBackup(sock);
        await m.react("✅");
        return m.reply(
          `✅ *ʙᴀᴄᴋᴜᴘ sᴇʟᴇsᴀɪ*\n\n> ¡La copia de seguridad ha sido enviada al dueño!`,
        );
      } catch (error) {
        await m.react('☢');
        await m.reply(te(m.prefix, m.command, m.pushName));
      }
    }

    default:
      return m.reply(
        `⚠️ *ᴀᴄᴛɪᴏɴ ᴛɪᴅᴀᴋ ᴠᴀʟɪᴅ*\n\n` +
          `> Selecciona: \`on\`, \`off\`, \`status\`, o \`now\`\n` +
          `> Ejemplo: \`${m.prefix}autobackup on 6h\``,
      );
  }
}

export { pluginConfig as config, handler }
