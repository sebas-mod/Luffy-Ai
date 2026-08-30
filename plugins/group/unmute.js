import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'unmute',
    alias: ['unbisukan'],
    category: 'group',
    description: 'Abrir el silencio del grupo',
    usage: '.unmute',
    example: '.unmute',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const db = getDatabase()
    const group = db.getGroup(m.chat) || {}
    const groupName = m.groupMetadata.subject

    if (!group.mute) return m.reply("☽◯☾ ♰ "+'❌ El grupo no está silenciado.')

    db.setGroup(m.chat, { ...group, mute: false })
    m.reply("☽◯☾ ╭━ ♰ ⚡ GRUPO ♰ ━╮ ☽◯☾\n"+`✅ El grupo *${groupName}* fue desilenciado por @${m.sender.split('@')[0]}\n\nTodos los miembros ahora pueden enviar mensajes.`+"\n╰━ ⊱༺༒༻⊰ ━╯", { mentions: [m.sender] })
}

export { pluginConfig as config, handler }