import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'mute',
    alias: ['bisukan'],
    category: 'group',
    description: 'Silenciar todo el grupo (solo los admins pueden enviar mensajes)',
    usage: '.mute',
    example: '.mute',
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

    if (group.mute) return m.reply('❌ El grupo ya está en estado de silencio.')

    db.setGroup(m.chat, { ...group, mute: true })
    m.reply(`✅ El grupo *${groupName}* ha sido silenciado por @${m.sender.split('@')[0]}\n\nSolo los admins pueden enviar mensajes.\nEscribe *${m.prefix}unmute* para abrir de nuevo.`, { mentions: [m.sender] })
}

function isMuted(groupJid, db) {
    const group = db.getGroup(groupJid) || {}
    return !!group.mute
}

export { pluginConfig as config, handler, isMuted }