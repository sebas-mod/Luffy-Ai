const pluginConfig = {
    name: 'notif_degradar',
    alias: [],
    category: 'group',
    description: 'Alternar notificación cuando alguien es destituido de admin',
    usage: '.notifdemote on/off',
    example: '.notifdemote on',
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
        return m.reply("╭━━━〔 ⚡ GRUPO 〕━━━╮\n┃ "+`❌ Solo los admins del grupo pueden usar esta función`+"\n╰━━━━━━━━━━━━╯")
    }
    
    const args = m.args[0]?.toLowerCase()
    const group = db.getGroup(m.chat) || {}
    
    if (!['on', 'off'].includes(args)) {
        const status = group.notifDemote === true ? '✅ Activo' : '❌ Inactivo'
        return m.reply("╭━━━〔 ⚡ GRUPO 〕━━━╮\n"+`👤 *ɴᴏᴛɪꜰ ᴅᴇᴍᴏᴛᴇ*\n\n> Estado: ${status}\n\n*Uso:*\n\`${m.prefix}notif_degradar on\` - Activar\n\`${m.prefix}notif_degradar off\` - Desactivar`+"\n╰━━━━━━━━━━━━╯")
    }
    
    if (args === 'on') {
        group.notifDemote = true
        db.setGroup(m.chat, group)
        return m.reply(`✅ *ɴᴏᴛɪꜰ ᴅᴇᴍᴏᴛᴇ ᴀᴄᴛɪᴠᴀᴅᴏ*`)
    }
    
    if (args === 'off') {
        group.notifDemote = false
        db.setGroup(m.chat, group)
        return m.reply(`❌ *ɴᴏᴛɪꜰ ᴅᴇᴍᴏᴛᴇ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ*`)
    }
}

export { pluginConfig as config, handler }