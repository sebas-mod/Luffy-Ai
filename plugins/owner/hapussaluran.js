const pluginConfig = {
    name: ['hapussaluran', 'deletesaluran', 'deletenewsletter'],
    alias: [],
    category: 'owner',
    description: 'Elimina un canal o boletín',
    usage: '.hapussaluran <id_saluran>',
    example: '.hapussaluran 120363xxx@newsletter',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.text?.trim() || ''
    let targetJid = text

    if (!targetJid) {
        return m.reply(
            '🗑️ *ʜᴀᴘᴜs sᴀʟᴜʀᴀɴ*\n\n' +
            '> `.hapussaluran <id_saluran>` — Hapus saluran\n\n' +
            '📝 Ejemplo:\n' +
            '> `.hapussaluran 120363xxx@newsletter`\n\n' +
            '⚠️ El canal será eliminado de forma permanente'
        )
    }

    if (!targetJid.endsWith('@newsletter')) {
        targetJid += '@newsletter'
    }

    try {
        await sock.newsletterDelete(targetJid)
        await m.react('✅')
        return m.reply(`🗑️ *Canal eliminado*\n\n> ID: ${targetJid}`)
    } catch (err) {
        return m.reply(`❌ Error al eliminar saluran: ${err.message}`)
    }
}

export { pluginConfig as config, handler }
