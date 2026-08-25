const pluginConfig = {
    name: 'anti_remocion',
    alias: ["antidelete", "anti_quitar"],
    category: 'group',
    description: 'Activar/desactivar anti-eliminación de mensajes en el grupo',
    usage: '.antiremove <on/off>',
    example: '.antiremove on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: false
}

async function handler(m, { sock, db }) {
    const action = (m.args || [])[0]?.toLowerCase()
    const group = db.getGroup(m.chat) || {}

    if (!action) {
        const status = group.antiremove || 'off'
        await m.reply(
            `🗑️ *AntiRemove*\n\n` +
            `> Estado: *${status === 'on' ? '✅ Activo' : '❌ Inactivo'}*\n\n` +
            `> \`.antiremove on/off\``
        )
        return
    }

    if (action === 'on') {
        db.setGroup(m.chat, { ...group, antiremove: 'on' })
        m.react('✅')
        await m.reply("╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n┃ "+`✅ *AntiRemove activado*\n> Los mensajes eliminados se reenviarán de nuevo.`+"\n╰━━━━━━━━━━━━╯")
        return
    }

    if (action === 'off') {
        db.setGroup(m.chat, { ...group, antiremove: 'off' })
        m.react('❌')
        await m.reply("╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n┃ "+`❌ *AntiRemove desactivado*`+"\n╰━━━━━━━━━━━━╯")
        return
    }

    await m.reply("╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n┃ "+`❌ Usa \`.antiremove on\` o \`.antiremove off\``+"\n╰━━━━━━━━━━━━╯")
}

export { pluginConfig as config, handler }