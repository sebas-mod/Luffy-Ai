const pluginConfig = {
    name: 'delete',
    alias: ["del", "quitar", "d"],
    category: 'group',
    description: 'Eliminar mensaje con reply',
    usage: '.delete (reply al mensaje)',
    example: '.delete',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (!m.quoted) {
        return m.reply("╰┈➤ "+'⚠️ *¡Responde al mensaje que quieres eliminar!*')
    }

    const quotedSender = m.quoted.sender || m.quoted.key?.participant
    const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
    const isOwnMessage = m.quoted.key?.fromMe || quotedSender === m.sender
    const isBotMessage = quotedSender === botJid || m.quoted.key?.fromMe

    if (!isOwnMessage && !isBotMessage) {
        if (!m.isBotAdmin) {
            return m.reply("╭━━━〔 ⚡ GRUPO 〕━━━╮\n┃ "+'⚠️ *¡El bot debe ser admin para eliminar mensajes de otras personas!*'+"\n╰━━━━━━━━━━━━╯")
        }
        if (!m.isAdmin && !m.isOwner) {
            return m.reply("╭━━━〔 ⚡ GRUPO 〕━━━╮\n┃ "+'⚠️ *¡Solo los admins pueden eliminar mensajes de otras personas!*'+"\n╰━━━━━━━━━━━━╯")
        }
    }

    try {
        const key = {
            remoteJid: m.chat,
            id: m.quoted.key.id,
            fromMe: m.quoted.key.fromMe,
            participant: quotedSender
        }

        await sock.sendMessage(m.chat, { delete: key })
        await m.react('✅')

    } catch (err) {
        if (err.message?.includes('not found') || err.message?.includes('forbidden')) {
            await m.reply("╭━━━〔 ⚡ GRUPO 〕━━━╮\n"+'❌ *¡No se pudo eliminar!*\n> Es posible que el mensaje ya haya sido eliminado o sea demasiado antiguo.'+"\n╰━━━━━━━━━━━━╯")
        } else {
            await m.react('❌')
        }
    }
}

export { pluginConfig as config, handler }