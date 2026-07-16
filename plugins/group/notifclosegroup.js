const pluginConfig = {
    name: 'notifclosegroup',
    alias: ['notifclose'],
    category: 'group',
    description: 'Alternar notificación cuando el grupo se cierra',
    usage: '.notifclosegroup on/off',
    example: '.notifclosegroup on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock, db }) {
    if (!m.isAdmin && !m.isOwner) {
        return m.reply(`❌ Solo los admins del grupo pueden usar esta función`)
    }
    
    const args = m.args[0]?.toLowerCase()
    const group = db.getGroup(m.chat) || {}
    
    if (!['on', 'off'].includes(args)) {
        const status = group.notifCloseGroup === true ? '✅ Activo' : '❌ Inactivo'
        return m.reply(`🔒 *ɴᴏᴛɪꜰ ᴄʟᴏsᴇ ɢʀᴏᴜᴘ*\n\n> Estado: ${status}\n\n*Uso:*\n\`${m.prefix}notifclosegroup on\` - Activar\n\`${m.prefix}notifclosegroup off\` - Desactivar`)
    }
    
    if (args === 'on') {
        group.notifCloseGroup = true
        db.setGroup(m.chat, group)
        return m.reply(`✅ *ɴᴏᴛɪꜰ ᴄʟᴏsᴇ ɢʀᴏᴜᴘ ᴀᴄᴛɪᴠᴀᴅᴏ*`)
    }
    
    if (args === 'off') {
        group.notifCloseGroup = false
        db.setGroup(m.chat, group)
        return m.reply(`❌ *ɴᴏᴛɪꜰ ᴄʟᴏsᴇ ɢʀᴏᴜᴘ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ*`)
    }
}

export { pluginConfig as config, handler }