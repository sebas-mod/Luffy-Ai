import { stopSchedulerByName, getFullSchedulerStatus } from '../../src/lib/ourin-scheduler.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'stopschedule',
    alias: ['stopscheduler', 'schedstop', 'pauseschedule'],
    category: 'owner',
    description: 'Detiene uno o todos los planificadores',
    usage: '.stopschedule <nombre|all>',
    example: '.stopschedule limitreset',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock, args }) {
    try {
        const target = args[0]?.toLowerCase();
        
        if (!target) {
            const helpText = `🛑 *sᴛᴏᴘ sᴄʜᴇᴅᴜʟᴇʀ*

*Usage:*
\`.stopschedule <nombre>\`

*Available schedulers:*
• \`limitreset\` - Daily Limit Reset
• \`groupschedule\` - Group Schedule
• \`sewa\` - Sewa Checar
• \`messages\` - Scheduled Messages
• \`all\` - Todos scheduler

*Example:*
\`.stopschedule limitreset\`
\`.stopschedule all\``;
            
            await m.reply(helpText);
            return;
        }
        
        if (target === 'all') {
        
        const result = stopSchedulerByName(target);
        
        if (result.stopped) {
            await m.reply(`🛑 *sᴄʜᴇᴅᴜʟᴇʀ ᴅᴇᴛᴇɴɪᴅᴏ*

> Scheduler: *${result.name}*
> Status: ❌ Dihentikan

_Usa \`.startschedule ${target}\` para activando ambali_`);
        } else {
            await m.reply(`❌ Scheduler no encontrado o ya inactivo

Usa \`.stopschedule\` para viendo lista scheduler`);
        }
    } catch (error) {
        console.error('[StopSchedule Error]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler }
