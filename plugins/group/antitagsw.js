const pluginConfig = {
    name: 'antitagsw',
    alias: ['antitag', 'antistatustag'],
    category: 'group',
    description: 'Activa/desactiva anti etiquetas de estado en el grupo',
    usage: '.antitagsw <on/off>',
    example: '.antitagsw on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    const groupId = m.chat
    const group = db.getGroup(groupId) || {}

    if (!action) {
        const status = group.antitagsw || 'off'

        await m.reply(
            `📢 *ᴀɴᴛɪᴛᴀɢsᴡ ᴄᴏɴꜰɪɢ*\n\n` +
            `> Estado: *${status === 'on' ? '✅ Activo' : '❌ Inactivo'}*\n\n` +
            `> Esta función elimina mensajes de etiquetas de estado\n` +
            `> (groupStatusMentionMessage)\n\n` +
            `\`\`\`━━━ ᴏᴘᴄɪᴏɴᴇs ━━━\`\`\`\n` +
            `> \`${m.prefix}antitagsw on\` → Activar\n` +
            `> \`${m.prefix}antitagsw off\` → Desactivar`
        )
        return
    }

    if (action === 'on') {
        db.setGroup(groupId, { ...group, antitagsw: 'on' })
        await m.reply(
            `✅ *ᴀɴᴛɪᴛᴀɢsᴡ ᴀᴄᴛɪᴠᴏ*\n\n` +
            `> ¡Anti etiquetas de estado activado exitosamente!\n` +
            `> Los mensajes de etiquetas de estado serán eliminados automáticamente. 😊`
        )
        return
    }

    if (action === 'off') {
        db.setGroup(groupId, { ...group, antitagsw: 'off' })
        await m.reply(
            `❌ *ᴀɴᴛɪᴛᴀɢsᴡ ɪɴᴀᴄᴛɪᴠᴏ*\n\n` +
            `> Anti etiquetas de estado desactivado exitosamente.`
        )
        return
    }

    await m.reply(
        `❌ *ᴏᴘᴄɪóɴ ɴᴏ ᴠáʟɪᴅᴀ*\n\n` +
        `> Usa: on o off`
    )
}

export { pluginConfig as config, handler }