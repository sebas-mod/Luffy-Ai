import config from '../../config.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: ['unblock', 'unblocknomor'],
    alias: [],
    category: 'owner',
    description: 'Desbloquear un número de WhatsApp',
    usage: '.unblock <número/reply/mention>',
    example: '.unblock 628xxx',
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
            `☽◯☾ ╭ ♰ ⚙️ SISTEMA ♰ ━╮ ☽◯☾\n` +
            `┃ ⚠️ *ᴄóᴍᴏ ᴜsᴀʀ*\n` +
            `╰━━━━━━━━╯\n\n` +
            `› \`.unblock 628xxx\` — Desbloquear por número\n` +
            `› \`.unblock\` (reply a un mensaje) — Desbloquear al remitente\n` +
            `› \`.unblock @mention\` — Desbloquear al mencionado\n` +
            `› \`.unblock\` (en chat privado) — Desbloquear a este usuario`
        )
    }

    try {
        await sock.updateBlockStatus(targetJid, 'unblock')
        await m.react('✅')
        return m.reply(
            `☽◯☾ ╭━ ♰ ✦ ÉXITO ♰ ━╮ ☽◯☾\n` +
            `┃ ✅ *ɴúᴍᴇʀᴏ ᴅᴇsʙʟᴏǫᴜᴇᴀᴅᴏ*\n` +
            `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
            `🎯 Objetivo: @${targetJid.split('@')[0]}`,
            { mentions: [targetJid] }
        )
    } catch (err) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }