import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'unmute',
    alias: ['unbisukan'],
    category: 'group',
    description: 'Membuka mute grup',
    usage: '.unmute',
    example: '.unmute',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const db = getDatabase()
    const group = db.getGroup(m.chat) || {}
    const groupName = m.groupMetadata.subject

    if (!group.mute) return m.reply('❌ El grupo no está silenciado.')

    db.setGroup(m.chat, { ...group, mute: false })
    m.reply(`✅ ¡El grupo *${groupName}* fue desilenciado por @${m.sender.split('@')[0]}! 🔊\n\nAhora todos los miembros pueden enviar mensajes.`, { mentions: [m.sender] })
}

export { pluginConfig as config, handler }
