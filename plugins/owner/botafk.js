import moment from 'moment-timezone'
import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'botafk',
    alias: ['afkbot', 'afkmode'],
    category: 'owner',
    description: 'Modo AFK del bot - el bot no responde comandos, solo responde mensaje AFK',
    usage: '.botafk <alasan>',
    example: '.botafk Lagi istirahat',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const currentAfk = db.setting('botAfk')
    
    if (currentAfk && currentAfk.active) {
        db.setting('botAfk', { active: false })
        await m.react('✅')
        
        const afkDuration = Date.now() - currentAfk.since
        const duration = formatDuration(afkDuration)
        
        return m.reply(
            `✅ *ʙᴏᴛ ᴠᴜᴇʟᴛᴇ ᴀ ᴇsᴛᴀʀ ᴇɴ ʟíɴᴇᴀ*\n\n` +
            `☽◯☾ ♰ 「 📊 *ᴇsᴛᴀᴅístɪᴄᴀs ᴅᴇʟ ᴀꜰᴋ* 」\n` +
            `┃ ⏱️ ᴅᴜʀᴀᴄɪóɴ: \`${duration}\`\n` +
            `┃ 📝 ᴍᴏᴛɪᴠᴏ: \`${currentAfk.reason || '-'}\`\n` +
            `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
            `> ¡El bot está listo para recibir comandos!`
        )
    } else {
        const reason = m.args.join(' ') || 'AFK'
        
        db.setting('botAfk', {
            active: true,
            reason: reason,
            since: Date.now()
        })
        
        await m.react('💤')
        return m.reply(
            `💤 *ʙᴏᴛ ᴀꜰᴋ ᴀᴄᴛɪᴠᴏ*\n\n` +
            `☽◯☾ ♰ 「 📋 *ɪɴꜰᴏ* 」\n` +
            `┃ 📝 ᴍᴏᴛɪᴠᴏ: \`${reason}\`\n` +
            `┃ ⏰ ᴅᴇsᴅᴇ: \`${moment().tz('America/Argentina/Buenos_Aires').format('HH:mm:ss')}\`\n` +
            `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
            `☽◯☾ ♰ 「 🔒 *ᴀᴄᴄᴇsᴏ* 」\n` +
            `┃ ✅ Owner del bot\n` +
            `┃ ✅ El propio bot (fromMe)\n` +
            `┃ ❌ Todos los demás usuarios\n` +
            `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
            `> Los demás usuarios recibirán el mensaje AFK\n` +
            `> Escribe \`${m.prefix}botafk\` para volver a estar en línea`
        )
    }
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} días ${hours % 24} horas`
    if (hours > 0) return `${hours} horas ${minutes % 60} minutos`
    if (minutes > 0) return `${minutes} minutos ${seconds % 60} segundos`
    return `${seconds} segundos`
}

export { pluginConfig as config, handler }