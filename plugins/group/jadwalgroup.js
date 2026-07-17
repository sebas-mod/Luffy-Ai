import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'jadwalgroup',
    alias: ['schedulegroup', 'jdwlgrup', 'autoopenclose'],
    category: 'group',
    description: 'Horario automático de apertura/cierre del grupo',
    usage: '.jadwalgroup <open/close> <HH:MM>',
    example: '.jadwalgroup open 06:00',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
};

function parseTime(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return null;
    
    const cleaned = timeStr.trim().replace(/\s+/g, '');
    const match = cleaned.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    
    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    
    return { hours, minutes };
}

function formatTime(hours, minutes) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const action = args[0]?.toLowerCase();
    
    let time = args[1];
    if (args.length >= 4 && args[2] === ':') {
        time = `${args[1]}:${args[3]}`;
    } else if (args.length >= 2) {
        time = args.slice(1).join('').replace(/\s+/g, '');
    }
    
    if (!action) {
        const group = db.getGroup(m.chat) || {};
        const openTime = group.scheduleOpen || null;
        const closeTime = group.scheduleClose || null;
        
        let scheduleInfo = `⏰ *ʜᴏʀᴀʀɪᴏ ᴅᴇʟ ɢʀᴜᴘᴏ*

「 📋 *ᴇsᴛᴀᴅᴏ* 」
🔓 ᴀʙɪᴇʀᴛᴏ: *${openTime || 'Inactivo'}*
🔒 ᴄᴇʀʀᴀᴅᴏ: *${closeTime || 'Inactivo'}*

*_Forma de usarlo:_
\`.jadwalgroup open 06:00\`
\`.jadwalgroup close 22:00\`
\`.jadwalgroup hapus open\`
\`.jadwalgroup hapus close\``;
        
        await m.reply(scheduleInfo);
        return;
    }
    
    if (action === 'hapus' || action === 'delete' || action === 'remove') {
        const type = args[1]?.toLowerCase();
        
        if (type !== 'open' && type !== 'close') {
            await m.reply(
                `⚠️ *ᴠᴀʟɪᴅᴀᴄɪóɴ ғᴀᴄᴇʟ*\n\n` +
                `> Usa: \`.jadwalgroup hapus open\`\n` +
                `> o: \`.jadwalgroup hapus close\`\n\n` +
                `_¡No tenemos miedo, pero hay que saber usarlo!_`
            );
            return;
        }
        
        const group = db.getGroup(m.chat) || {};
        
        if (type === 'open') {
            delete group.scheduleOpen;
            db.setGroup(m.chat, group);
            
            await m.reply(
                `✅ *ᴇxɪᴛᴏ*\n\n` +
                `> Horario de *apertura automática* eliminado.\n\n` +
                `_¡Shishishi! Luffy limpia todo._`
            );
        } else {
            delete group.scheduleClose;
            db.setGroup(m.chat, group);
            
            await m.reply(
                `✅ *ᴇxɪᴛᴏ*\n\n` +
                `> Horario de *cierre automático* eliminado.\n\n` +
                `_¡Shishishi! Nada se escapa de Luffy._`
            );
        }
        return;
    }
    
    if (action !== 'open' && action !== 'close') {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪóɴ ғᴀᴄᴇʟ*\n\n` +
            `> La acción debe ser \`open\` o \`close\`!\n\n` +
            `> *Ejemplo:*\n` +
            `> \`.jadwalgroup open 06:00\`\n` +
            `> \`.jadwalgroup close 22:00\`\n\n` +
            `_¡Soy Luffy, y seré el Rey de los Piratas! Pero primero... ¡Lee las instrucciones!_`
        );
        return;
    }
    
    if (!time) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪóɴ ғᴀᴄᴇʟ*\n\n` +
            `> ¡Debes ingresar la hora!\n\n` +
            `> *Formato:* \`HH:MM\` (24 horas)\n` +
            `> *Ejemplo:* \`.jadwalgroup ${action} 08:00\``
        );
        return;
    }
    
    const parsed = parseTime(time);
    if (!parsed) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪóɴ ғᴀᴄᴇʟ*\n\n` +
            `> ¡Formato de hora no válido!\n\n` +
            `> *Formato:* \`HH:MM\` (24 horas)\n` +
            `> *Ejemplo:* \`06:00\`, \`22:30\`, \`08:15\``
        );
        return;
    }
    
    const group = db.getGroup(m.chat) || {};
    const formattedTime = formatTime(parsed.hours, parsed.minutes);
    
    if (action === 'open') {
        group.scheduleOpen = formattedTime;
    } else {
        group.scheduleClose = formattedTime;
    }
    
    db.setGroup(m.chat, group);
    
    const actionText = action === 'open' ? 'BUKA' : 'TUTUP';
    const emoji = action === 'open' ? '🔓' : '🔒';
    
    const successMsg = `✅ *ʜᴏʀᴀʀɪᴏ ɢᴜᴀʀᴅᴀᴅᴏ*

╭┈┈⬡「 ⏰ *ᴄᴏɴꜰɪɢ* 」
┃ ㊗ ${emoji} ᴀᴄᴄɪóɴ: *${actionText}*
┃ ㊗ ⏱️ ʜᴏʀᴀ: *${formattedTime} ART*
┃ ㊗ 📡 ᴇsᴛᴀᴅᴏ: *🟢 Activo*
╰┈┈⬡

> _El grupo se ${action === 'open' ? 'abrirá' : 'cerrará'}_
> _automáticamente a las *${formattedTime}* ART._
> _¡Shishishi! ¡A la aventura, uno a uno!_`;
    
    await m.reply(successMsg);
}

export { pluginConfig as config, handler }