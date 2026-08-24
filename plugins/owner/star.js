const pluginConfig = {
    name: ['star', 'bintang'],
    alias: [],
    category: 'owner',
    description: 'Agregar/eliminar estrella a un mensaje',
    usage: '.star (responder mensaje) o .star eliminar (responder mensaje)',
    example: '.star',
    isOwner: true,
    cooldown: 3,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (!m.quoted) {
        return m.reply(
            '╭━━━〔 👑 OWNER 〕━━━╮\n' +
            '┃ ⭐ *ᴇsᴛʀᴇʟʟᴀ ᴇɴ ᴇʟ ᴍᴇɴsᴀᴊᴇ*\n' +
            '╰━━━━━━━━━━━━╯\n\n' +
            '› `.star` (responder mensaje) — Agregar estrella\n' +
            '› `.star eliminar` (responder mensaje) — Quitar estrella'
        )
    }

    const unstar = m.args[0]?.toLowerCase() === 'eliminar' || m.args[0]?.toLowerCase() === 'unstar'
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
                ? '╭━〔 ⚙️ SISTEMA 〕━╮\n┃ ❌ Estrella eliminada del mensaje\n╰━━━━━━━━╯'
                : '╭━〔 ⚙️ SISTEMA 〕━╮\n┃ ⭐ Mensaje marcado con estrella\n╰━━━━━━━━╯'
        )
    } catch (err) {
        return m.reply(`❌ Fallo: ${err.message}`)
    }
}

export { pluginConfig as config, handler }
