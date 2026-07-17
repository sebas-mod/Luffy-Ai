import { startSchedulerByName, getFullSchedulerStatus } from '../../src/lib/ourin-scheduler.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'startschedule',
    alias: ['startscheduler', 'schedstart', 'resumeschedule'],
    category: 'owner',
    description: 'Reestocia uno o todos los planificadores',
    usage: '.startschedule <nombre|all>',
    example: '.startschedule limitreset',
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
            const helpText = `▶️ *sᴛᴀʀᴛ sᴄʜᴇᴅᴜʟᴇʀ*

*Usage:*
\`.startschedule <nombre>\`

*Available schedulers:*
• \`limitreset\` - Daily Limit Reset
• \`groupschedule\` - Group Schedule
• \`sewa\` - Sewa Checar
• \`messages\` - Scheduled Messages
• \`all\` - Todos scheduler

*Example:*
\`.startschedule limitreset\`
\`.startschedule all\``;
            
            await m.reply(helpText);
            return;
        }
        
        if (target === 'all') {
        
        const result = startSchedulerByName(target, sock);
        
        if (result.started) {
            await m.reply(`▶️ *sᴄʜᴇᴅᴜʟᴇʀ ᴅɪᴍᴜʟᴀɪ*

> Scheduler: *${result.name}*
> Status: ✅ Activo

_El scheduler ha sido iniciado de nuevo_`);
        } else {
            await m.reply(`❌ Scheduler no encontrado o ya activo

Usa \`.startschedule\` para ver la lista de planificadores`);
        }
    } catch (error) {
        console.error('[StartSchedule Error]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler }
