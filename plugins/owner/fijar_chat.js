const pluginConfig = {
    name: ['fijar_chat'],
    alias: [],
    category: 'owner',
    description: 'Fijar/quitar fijado del chat',
    usage: '.pinchat <número/reply> o .pinchat abrir <número>',
    example: '.pinchat 628xxx',
    isOwner: true,
    cooldown: 3,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const action = m.args[0]?.toLowerCase()
    let targetJid = null
    let pin = true

    if (action === 'abrir' || action === 'unpin') {
        pin = false
        const num = (m.args[1] || '').replace(/[^0-9]/g, '')
        if (num) targetJid = num + '@s.whatsapp.net'
        else if (m.quoted) targetJid = m.quoted.sender || m.quoted.participant
        else if (!m.isGroup) targetJid = m.chat
    } else {
        if (m.mentionedJid?.length > 0) {
            targetJid = m.mentionedJid[0]
        } else if (m.quoted) {
            targetJid = m.quoted.sender || m.quoted.participant
        } else if (m.args[0]) {
            const num = m.args[0].replace(/[^0-9]/g, '')
            if (num) targetJid = num + '@s.whatsapp.net'
        } else if (!m.isGroup) {
            targetJid = m.chat
        }
    }

    if (!targetJid) {
        return m.reply(
            '📌 *ꜰɪᴊᴀʀ ᴄʜᴀᴛ*\n\n' +
            '> `.pinchat 628xxx` — Fijar chat\n' +
            '> `.pinchat` (en chat privado) — Fijar este chat\n' +
            '> `.pinchat abrir 628xxx` — Quitar fijado'
        )
    }

    try {
        await sock.chatModify({ pin }, targetJid)
        await m.react('✅')
        const target = targetJid.split('@')[0]
        return m.reply(
            pin
                ? `📌 *ᴄʜᴀᴛ ꜰɪᴊᴀᴅᴏ*\n\n> Target: ${target}`
                : `📍 *ꜰɪᴊᴀᴅᴏ ᴇʟɪᴍɪɴᴀᴅᴏ*\n\n> Target: ${target}`
        )
    } catch (err) {
        return m.reply(`❌ Error: ${err.message}`)
    }
}

export { pluginConfig as config, handler }
