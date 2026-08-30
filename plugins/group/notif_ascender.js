const pluginConfig = {
    name: 'notif_ascender',
    alias: [],
    category: 'group',
    description: 'Alternar notificación cuando alguien es ascendido a admin',
    usage: '.notif_ascender on/off',
    example: '.notif_ascender on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

function handler(m, { sock, db }) {
    if (!m.isAdmin && !m.isOwner) {
        return m.reply("☽◯☾ ╭━ ♰ ⚡ GRUPO ♰ ━╮ ☽◯☾\n┃ "+`❌ Solo los admins del grupo pueden usar esta función`+"\n╰━ ⊱༺༒༻⊰ ━╯")
    }
    
    const args = m.args[0]?.toLowerCase()
    const group = db.getGroup(m.chat) || {}
    
    if (!['on', 'off'].includes(args)) {
        const status = group.notifPromote === true ? '✅ Activo' : '❌ Inactivo'
        return m.reply("☽◯☾ ╭━ ♰ ⚡ GRUPO ♰ ━╮ ☽◯☾\n"+`👑 *ɴᴏᴛɪꜰ ᴘʀᴏᴍᴏᴛᴇ*\n\n> Estado: ${status}\n\n*Uso:*\n\`${m.prefix}notif_ascender on\` - Activar\n\`${m.prefix}notif_ascender off\` - Desactivar`+"\n╰━ ⊱༺༒༻⊰ ━╯")
    }
    
    if (args === 'on') {
        group.notifPromote = true
        db.setGroup(m.chat, group)
        return m.reply(`✅ *ɴᴏᴛɪꜰ ᴘʀᴏᴍᴏᴛᴇ ᴀᴄᴛɪᴠᴀᴅᴏ*`)
    }
    
    if (args === 'off') {
        group.notifPromote = false
        db.setGroup(m.chat, group)
        return m.reply(`❌ *ɴᴏᴛɪꜰ ᴘʀᴏᴍᴏᴛᴇ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ*`)
    }
}

export { pluginConfig as config, handler }