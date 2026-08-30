const pluginConfig = {
    name: ['mutechat'],
    alias: [],
    category: 'owner',
    description: 'Silenciar/activar chat',
    usage: '.mutechat <número/reply> o .mutechat abrir <número>',
    example: '.mutechat 628xxx',
    isOwner: true,
    cooldown: 3,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const action = m.args[0]?.toLowerCase()
    let targetJid = null
    let mute = true

    if (action === 'abrir' || action === 'unmute') {
        mute = false
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
            '🔇 *sɪʟᴇɴᴄɪᴀʀ ᴄʜᴀᴛ*\n\n' +
            '> `.mutechat 628xxx` — Silenciar chat\n' +
            '> `.mutechat` (en chat privado) — Silenciar este chat\n' +
            '> `.mutechat abrir 628xxx` — Quitar silencio'
        )
    }

    try {
        await sock.chatModify({ mute: mute ? 1 : null }, targetJid)
        await m.react('✅')
        const target = targetJid.split('@')[0]
        return m.reply(
            mute
                ? `🔇 *ᴄʜᴀᴛ sɪʟᴇɴᴄɪᴀᴅᴏ*\n\n> Target: ${target}`
                : `🔊 *ᴄʜᴀᴛ ᴄᴏɴ sᴏɴɪᴅᴏ*\n\n> Target: ${target}`
        )
    } catch (err) {
        return m.reply(`☽◯☾ ♰ ❌ Error: ${err.message}`)
    }
}

export { pluginConfig as config, handler }
