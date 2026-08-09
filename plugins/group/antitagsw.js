const pluginConfig = {
    name: 'antitagsw',
    alias: ['antitag', 'antistatustag'],
    category: 'group',
    description: 'Activar/desactivar el anti tag de estado en el grupo',
    usage: '.antitagsw <on/off>',
    example: '.antitagsw on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
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
            `📢 *ᴀɴᴛɪᴛᴀɢsᴡ ᴄᴏɴꜰɪɢᴜʀᴀᴄɪᴏ́ɴ*\n\n` +
            `> Estado: *${status === 'on' ? '✅ Activo' : '❌ Inactivo'}*\n\n` +
            `> Esta función elimina los mensajes de tag de estado\n` +
            `> (groupStatusMentionMessage)\n\n` +
            `\`\`\`━━━ ᴏᴘᴄɪᴏɴᴇꜱ ━━━\`\`\`\n` +
            `> \`${m.prefix}antitagsw on\` → Activar\n` +
            `> \`${m.prefix}antitagsw off\` → Desactivar`
        )
        return
    }

    if (action === 'on') {
        db.setGroup(groupId, { ...group, antitagsw: 'on' })
        await m.reply(
            `✅ *ᴀɴᴛɪᴛᴀɢsᴡ ᴀᴄᴛɪᴠᴏ*\n\n` +
            `> ¡El anti tag de estado se activó exitosamente!\n` +
            `> Los mensajes de tag de estado se eliminarán automáticamente.`
        )
        return
    }

    if (action === 'off') {
        db.setGroup(groupId, { ...group, antitagsw: 'off' })
        await m.reply(
            `❌ *ᴀɴᴛɪᴛᴀɢsᴡ ɪɴᴀᴄᴛɪᴠᴏ*\n\n` +
            `> El anti tag de estado se desactivó exitosamente.`
        )
        return
    }

    await m.reply(
        `❌ *ᴏᴘᴄɪᴏɴ ɪɴᴠᴀʟɪᴅᴀ*\n\n` +
        `> Usa: on u off`
    )
}

export { pluginConfig as config, handler }