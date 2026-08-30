import { startSchedulerByName, getFullSchedulerStatus } from '../../src/lib/luffy-scheduler.js'
import { getDatabase } from '../../src/lib/luffy-database.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'iniciar_horario',
    alias: ['startscheduler', 'schedstart', 'resumeschedule'],
    category: 'owner',
    description: 'Reiniciar un programador específico o todos',
    usage: '.startschedule <nombre|all>',
    example: '.startschedule all',
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
            const helpText = `▶️ *ɪɴɪᴄɪᴀʀ ᴘʀᴏɢʀᴀᴍᴀᴅᴏʀ*
            
*Uso:*
\`.startschedule <nombre>\`

*Programadores disponibles:*
• \`limitreset\` - Reinicio diario del límite
• \`groupschedule\` - Programación de grupos
• \`sewa\` - Verificador de alquiler
• \`messages\` - Mensajes programados
• \`all\` - Todos los programadores

*Ejemplo:*
\`.startschedule all\``;
            
            await m.reply(helpText);
            return;
        }
        
        if (target === 'all') {
            const db = getDatabase();
        }
        
        const result = startSchedulerByName(target, sock);
        
        if (result.started) {
            await m.reply(`👑•─────•👑\n▶️ *ᴘʀᴏɢʀᴀᴍᴀᴅᴏʀ ɪɴɪᴄɪᴀᴅᴏ*

> Programador: *${result.name}*
> Estado: ✅ Activo

_El programador se ha reiniciado_\n♰ ──────── ♱✦`);
        } else {
            await m.reply(`👑•─────•👑\n❌ Programador no encontrado o ya está activo

Usa \`.startschedule\` para ver la lista de programadores\n♰ ──────── ♱✦`);
        }
    } catch (error) {
        console.error('[StartSchedule Error]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

export { pluginConfig as config, handler }
