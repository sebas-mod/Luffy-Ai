const pluginConfig = {
    name: ['hapusgrup', 'deletegrup', 'delgrup'],
    alias: [],
    category: 'owner',
    description: 'Sale de un grupo o lo elimina',
    usage: '.hapusgrup (dentro de grup) o .hapusgrup <jid>',
    example: '.hapusgrup',
    isOwner: true,
    cooldown: 5,
    energi: 0,
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
            '🗑️ *ʜᴀᴘᴜs ɢʀᴜᴘ*\n\n' +
            '> `.hapusgrup` (dentro de grup) — Aluar del grupo esto\n' +
            '> `.hapusgrup <id_grup>` — Aluar del grupo tertentu\n\n' +
            '⚠️ Bot va a aluar del grupo, no eliminará el grupo de forma permanente'
        )
    }

    try {
        const metadata = await sock.groupMetadata(targetJid).catch(() => null)
        const groupName = metadata?.subject || targetJid

        await sock.groupLeave(targetJid)
        await m.react('✅')
        return m.reply(
            `🗑️ *ʙᴏᴛ ᴋᴇʟᴜᴀʀ ᴅᴀʀɪ ɢʀᴜᴘ*\n\n` +
            `> Grup: ${groupName}\n` +
            `> ID: ${targetJid}`
        )
    } catch (err) {
        return m.reply(`❌ Fallo aluar del grupo: ${err.message}`)
    }
}

export { pluginConfig as config, handler }
