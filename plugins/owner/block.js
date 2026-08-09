import config from '../../config.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: ['block', 'blokir'],
    alias: [],
    category: 'owner',
    description: 'Blokir nomor WhatsApp',
    usage: '.block <nomor/reply/mention>',
    example: '.block 628xxx',
    isOwner: true,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let targetJid = null

    if (m.mentionedJid?.length > 0) {
        targetJid = m.mentionedJid[0]
    } else if (m.quoted) {
        targetJid = m.quoted.sender || m.quoted.participant
    } else if (m.args[0]) {
        let num = m.args[0].replace(/[^0-9]/g, '')
        if (!num) return m.reply('❌ Número no válido.')
        targetJid = num + '@s.whatsapp.net'
    } else if (!m.isGroup) {
        targetJid = m.chat
    }

    if (!targetJid) {
        return m.reply(
            '⚠️ *ᴄóᴍᴏ ᴜsᴀʀ*\n\n' +
            '> `.block 628xxx` — Bloquear por número\n' +
            '> `.block` (responde un mensaje) — Bloquear al remitente\n' +
            '> `.block @mention` — Bloquear al mencionado\n' +
            '> `.block` (en chat privado) — Bloquear a este usuario'
        )
    }

    const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
    if (targetJid === botJid) {
        return m.reply('❌ No puedes bloquear el número del propio bot.')
    }

    try {
        await sock.updateBlockStatus(targetJid, 'block')
        await m.react('🚫')
        return m.reply(
            `🚫 *ɴúᴍᴇʀᴏ ʙʟᴏǫᴜᴇᴀᴅᴏ*\n\n` +
            `> Target: @${targetJid.split('@')[0]}\n` +
            `> Usa \`.unblock\` para desbloquear`,
            { mentions: [targetJid] }
        )
    } catch (err) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }