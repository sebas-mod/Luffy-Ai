const pluginConfig = {
    name: ['eliminar_canal', 'deletesaluran', 'deletenewsletter'],
    alias: [],
    category: 'owner',
    description: 'Eliminar un canal/newsletter',
    usage: '.hapussaluran <id_del_canal>',
    example: '.hapussaluran 120363xxx@newsletter',
    isOwner: true,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.text?.trim() || ''
    let targetJid = text

    if (!targetJid) {
        return m.reply(
            '🗑️ *ʙᴏʀʀᴀʀ sᴀʟᴜʀᴀɴ*\n\n' +
            '> `.hapussaluran <id_del_canal>` — Eliminar canal\n\n' +
            '📝 Ejemplo:\n' +
            '> `.hapussaluran 120363xxx@newsletter`\n\n' +
            '⚠️ El canal se eliminará permanentemente'
        )
    }

    if (!targetJid.endsWith('@newsletter')) {
        targetJid += '@newsletter'
    }

    try {
        await sock.newsletterDelete(targetJid)
        await m.react('✅')
        return m.reply(`👑•─────•👑\n🗑️ *Canal eliminado*\n\n> ID: ${targetJid}\n♰ ──────── ♱✦`)
    } catch (err) {
        return m.reply(`☽◯☾ ♰ ❌ Error al eliminar el canal: ${err.message}`)
    }
}

export { pluginConfig as config, handler }
