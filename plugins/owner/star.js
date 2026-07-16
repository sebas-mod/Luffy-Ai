const pluginConfig = {
    name: ['star', 'bintang'],
    alias: [],
    category: 'owner',
    description: 'Añade o elimina una estrella de un mensaje',
    usage: '.star (reply mensaje) o .star hapus (reply mensaje)',
    example: '.star',
    isOwner: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (!m.quoted) {
        return m.reply(
            '⭐ *sᴛᴀʀ ᴍᴇssᴀɢᴇ*\n\n' +
            '> `.star` (reply mensaje) — Beri bintang\n' +
            '> `.star hapus` (reply mensaje) — Hapus bintang'
        )
    }

    const unstar = m.args[0]?.toLowerCase() === 'hapus' || m.args[0]?.toLowerCase() === 'unstar'
    const key = m.quoted.key

    try {
        await sock.chatModify({
            star: {
                messages: [{ id: key.id, fromMe: key.fromMe }],
                star: !unstar
            }
        }, m.chat)

        await m.react('⭐')
        return m.reply(
            unstar
                ? '❌ *Estrella eliminada del mensaje*'
                : '⭐ *Mensaje ditandai bintang*'
        )
    } catch (err) {
        return m.reply(`❌ Fallo: ${err.message}`)
    }
}

export { pluginConfig as config, handler }
