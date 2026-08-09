import { stopSchedulerByName, getFullSchedulerStatus } from '../../src/lib/luffy-scheduler.js'
import { getDatabase } from '../../src/lib/luffy-database.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'stopschedule',
    alias: ['stopscheduler', 'schedstop', 'pauseschedule'],
    category: 'owner',
    description: 'Detener un programador específico o todos',
    usage: '.stopschedule <nombre|all>',
    example: '.stopschedule all',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
};

async function handler(m, { sock, args }) {
    try {
        const target = args[0]?.toLowerCase();
        
        if (!target) {
            const helpText = `🛑 *ᴅᴇᴛᴇɴᴇʀ ᴘʀᴏɢʀᴀᴍᴀᴅᴏʀ*

*Uso:*
\`.stopschedule <nombre>\`

*Programadores disponibles:*
• \`limitreset\` - Reinicio diario del límite
• \`groupschedule\` - Programación de grupos
• \`sewa\` - Verificador de sewa
• \`messages\` - Mensajes programados
• \`all\` - Todos los programadores

*Ejemplo:*
\`.stopschedule all\``;
            
            await m.reply(helpText);
            return;
        }
        
        const result = stopSchedulerByName(target);
        
        if (result.stopped) {
            await m.reply(`🛑 *ᴘʀᴏɢʀᴀᴍᴀᴅᴏʀ ᴅᴇᴛᴇɴɪᴅᴏ*

> Programador: *${result.name}*
> Estado: ❌ Detenido

_Usa \`.startschedule ${target}\` para activarlo de nuevo_`);
        } else {
            await m.reply(`❌ Programador no encontrado o ya está inactivo

Usa \`.stopschedule\` para ver la lista de programadores`);
        }
    } catch (error) {
        console.error('[StopSchedule Error]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler }
