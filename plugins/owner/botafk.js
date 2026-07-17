import moment from 'moment-timezone'
import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'botafk',
    alias: ['afkbot', 'afkmode'],
    category: 'owner',
    description: 'Mode AFK para bot - bot no merespon command, solo reply mensaje AFK',
    usage: '.botafk <alasan>',
    example: '.botafk De nuevo istirahat',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
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
            `✅ *ʙᴏᴛ ᴋᴇᴍʙᴀʟɪ ᴏɴʟɪɴᴇ*\n\n` +
            `╭┈┈⬡「 📊 *sᴛᴀᴛɪsᴛɪᴋ ᴀꜰᴋ* 」\n` +
            `┃ ⏱️ ᴅᴜʀᴀsɪ: \`${duration}\`\n` +
            `┃ 📝 ᴀʟᴀsᴀɴ: \`${currentAfk.reason || '-'}\`\n` +
            `╰┈┈⬡\n\n` +
            `> ¡Bot listo para recibir comandos!`
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
            `💤 *ʙᴏᴛ ᴀꜰᴋ ᴀᴋᴛɪꜰ*\n\n` +
            `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n` +
            `┃ 📝 ᴀʟᴀsᴀɴ: \`${reason}\`\n` +
            `┃ ⏰ sᴇᴊᴀᴋ: \`${moment().tz('America/Argentina/Buenos_Aires').format('HH:mm:ss')}\`\n` +
            `╰┈┈⬡\n\n` +
            `╭┈┈⬡「 🔒 *ᴀᴋsᴇs* 」\n` +
            `┃ ✅ Owner bot\n` +
            `┃ ✅ Bot sendiri (fromMe)\n` +
            `┃ ❌ Todos user otro\n` +
            `╰┈┈⬡\n\n` +
            `> User otro va a puede mensaje AFK\n` +
            `> Escribe \`${m.prefix}botafk\` para ambali online`
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