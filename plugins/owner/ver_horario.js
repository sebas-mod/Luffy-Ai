import { getFullSchedulerStatus, formatTimeRemaining, getMsUntilTime } from '../../src/lib/luffy-scheduler.js'
import { getDatabase } from '../../src/lib/luffy-database.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'ver_horario',
    alias: ["schedulerstatus", "schedstatus"],
    category: 'owner',
    description: 'Ver el estado de todos los programadores del bot',
    usage: '.cekschedule',
    example: '.cekschedule',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
};

async function handler(m, { sock }) {
    try {
        const status = getFullSchedulerStatus();
        const db = getDatabase();

        let text = `📊 *ᴇsᴛᴀᴅᴏ ᴅᴇʟ ᴘʀᴏɢʀᴀᴍᴀᴅᴏʀ*\n\n`;

        for (const sched of status.schedulers) {
            const statusIcon = sched.running ? '✅' : '❌';
            text += `${statusIcon} *${sched.name}*\n`;
            text += `   └ Key: \`${sched.key}\`\n`;
            text += `   └ ${sched.description}\n`;

            if (sched.lastRun && sched.lastRun !== '-' && sched.lastRun !== 'Never') {
                text += `   └ Última ejecución: ${sched.lastRun}\n`;
            }

            if (sched.stats) {
                if (sched.stats.totalResets) {
                    text += `   └ Reinicios: ${sched.stats.totalResets}\n`;
                }
                if (sched.stats.activeMessages !== undefined) {
                    text += `   └ Activos: ${sched.stats.activeMessages} | Enviados: ${sched.stats.totalSent}\n`;
                }
            }
            text += `\n`;
        }

        text += `\n`;
        text += `━━━━━━━━━━━━━━━━━━━\n`;
        text += `✅ Activos: ${status.summary.totalActive}\n`;
        text += `❌ Inactivos: ${status.summary.totalInactive}\n\n`;

        text += `> Usa \`.stopschedule <key>\` para detener\n`;
        text += `> Usa \`.startschedule <key>\` para iniciar`;

        await m.reply(text);
    } catch (error) {
        console.error('[CekSchedule Error]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler }
