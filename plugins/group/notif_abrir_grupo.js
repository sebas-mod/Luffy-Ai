const pluginConfig = {
    name: 'notif_abrir_grupo',
    alias: ['notifopen'],
    category: 'group',
    description: 'Alternar notificación cuando el grupo se abre',
    usage: '.notifopengroup on/off',
    example: '.notifopengroup on',
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
        const status = group.notifOpenGroup === true ? '✅ Activo' : '❌ Inactivo'
        return m.reply("☽◯☾ ╭━ ♰ ⚡ GRUPO ♰ ━╮ ☽◯☾\n"+`🔓 *ɴᴏᴛɪꜰ ᴏᴘᴇɴ ɢʀᴏᴜᴘ*\n\n> Estado: ${status}\n\n*Uso:*\n\`${m.prefix}notif_abrir_grupo on\` - Activar\n\`${m.prefix}notif_abrir_grupo off\` - Desactivar`+"\n╰━ ⊱༺༒༻⊰ ━╯")
    }
    
    if (args === 'on') {
        group.notifOpenGroup = true
        db.setGroup(m.chat, group)
        return m.reply(`✅ *ɴᴏᴛɪꜰ ᴏᴘᴇɴ ɢʀᴏᴜᴘ ᴀᴄᴛɪᴠᴀᴅᴏ*`)
    }
    
    if (args === 'off') {
        group.notifOpenGroup = false
        db.setGroup(m.chat, group)
        return m.reply(`❌ *ɴᴏᴛɪꜰ ᴏᴘᴇɴ ɢʀᴏᴜᴘ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ*`)
    }
}

export { pluginConfig as config, handler }