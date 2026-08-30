import config from '../../config.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'a_etiqueta',
    alias: ['tagall2', 'mentionall'],
    category: 'group',
    description: 'Etiquetar a todos los miembros respondiendo un mensaje',
    usage: '.a_etiqueta (responde un mensaje)',
    example: '.a_etiqueta',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 30,
    carne: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock }) {
    if (!m.quoted) {
        return m.reply(
            `📢 *ᴛᴏᴛᴀɢ*\n\n` +
            `> Responde el mensaje que quieres reenviar a todos los miembros\n\n` +
            `> Ejemplo: Responde un mensaje y escribe \`${m.prefix}a_etiqueta\``
        )
    }
    
    m.react('📢')
    
    try {
        const participants = m.groupMembers || []
        
        if (!participants || participants.length === 0) {
            return m.reply("☽◯☾ ╭━ ♰ ⚡ GRUPO ♰ ━╮ ☽◯☾\n┃ "+`❌ Error al obtener los datos de los miembros del grupo`+"\n╰━ ⊱༺༒༻⊰ ━╯")
        }
        
        const users = participants
            .map(u => u.id || u.jid || u)
            .filter(v => v && v !== sock.user?.jid && v !== sock.user?.id)
        
        await sock.sendMessage(m.chat, {
            forward: m.quoted.fakeObj || m.quoted,
            mentions: users
        })
        
        m.react('✅')
        
    } catch (err) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }