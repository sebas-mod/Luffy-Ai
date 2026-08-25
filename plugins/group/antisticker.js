import { getDatabase } from '../../src/lib/luffy-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'antisticker',
    alias: ['nosticker'],
    category: 'group',
    description: 'Configurar el antisticker en el grupo',
    usage: '.antisticker <on/off>',
    example: '.antisticker on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

function gpMsg(key, replacements = {}) {
    const defaults = {
        antisticker: '⚠ *AntiSticker* — El sticker de @%user% fue eliminado.',
    }
    let text = config.groupProtection?.[key] || defaults[key] || ''
    for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(new RegExp(`%${k}%`, 'g'), v)
    }
    return text
}

async function checkAntisticker(m, sock, db) {
    if (!m.isGroup) return false
    if (m.isAdmin || m.isOwner || m.fromMe) return false

    const groupData = db.getGroup(m.chat) || {}
    if (!groupData.antisticker) return false

    const isSticker = m.isSticker || m.type === 'stickerMessage'
    if (!isSticker) return false

    try {
        await sock.sendMessage(m.chat, { delete: m.key })
    } catch {}

    await sock.sendMessage(m.chat, {
        text: gpMsg('antisticker', { user: m.sender.split('@')[0] }),
        mentions: [m.sender],
    })

    return true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const action = (m.args || [])[0]?.toLowerCase()
    const groupData = db.getGroup(m.chat) || {}

    if (!action) {
        const status = groupData.antisticker ? '✅ ON' : '❌ OFF'
        await m.reply("╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n"+`🎭 *AntiSticker*\n\n> Estado: *${status}*\n\n> \`.antisticker on/off\``+"\n╰━━━━━━━━━━━━╯")
        return
    }

    if (action === 'on') {
        db.setGroup(m.chat, { antisticker: true })
        m.react('✅')
        await m.reply("╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n┃ "+`✅ *AntiSticker activado*`+"\n╰━━━━━━━━━━━━╯")
        return
    }

    if (action === 'off') {
        db.setGroup(m.chat, { antisticker: false })
        m.react('❌')
        await m.reply("╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n┃ "+`❌ *AntiSticker desactivado*`+"\n╰━━━━━━━━━━━━╯")
        return
    }

    await m.reply("╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n┃ "+`❌ Usa \`.antisticker on\` o \`.antisticker off\``+"\n╰━━━━━━━━━━━━╯")
}

export { pluginConfig as config, handler, checkAntisticker }