const pluginConfig = {
    name: ['eliminar_grupo', 'deletegrup', 'delgrup'],
    alias: [],
    category: 'owner',
    description: 'Salir del grupo / eliminar el grupo',
    usage: '.hapusgrup (dentro del grupo) o .hapusgrup <jid>',
    example: '.hapusgrup',
    isOwner: true,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let targetJid = null

    if (m.args[0]) {
        targetJid = m.args[0].replace(/[^0-9@.]/g, '')
        if (!targetJid.endsWith('@g.us')) targetJid += '@g.us'
    } else if (m.isGroup) {
        targetJid = m.chat
    }

    if (!targetJid || !targetJid.endsWith('@g.us')) {
        return m.reply(
            '🗑️ *ʙᴏʀʀᴀʀ ɢʀᴜᴘᴏ*\n\n' +
            '> `.hapusgrup` (dentro del grupo) — Salir de este grupo\n' +
            '> `.hapusgrup <id_grupo>` — Salir de un grupo específico\n\n' +
            '⚠️ El bot saldrá del grupo, no elimina el grupo permanentemente'
        )
    }

    try {
        const metadata = await sock.groupMetadata(targetJid).catch(() => null)
        const groupName = metadata?.subject || targetJid

        await sock.groupLeave(targetJid)
        await m.react('✅')
        return m.reply(
            `🗑️ *ʙᴏᴛ sᴀʟɪó ᴅᴇʟ ɢʀᴜᴘᴏ*\n\n` +
            `> Grupo: ${groupName}\n` +
            `> ID: ${targetJid}`
        )
    } catch (err) {
        return m.reply(`❌ Error al salir del grupo: ${err.message}`)
    }
}

export { pluginConfig as config, handler }
