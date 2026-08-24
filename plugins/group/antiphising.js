import { getDatabase } from '../../src/lib/luffy-database.js'

const pluginConfig = {
    name: 'antiphising',
    alias: ['antiphishing', 'antiscamlink', 'nophising'],
    category: 'group',
    description: 'Detectar contenido de phishing en el grupo',
    usage: '.antiphising <on/off/metode> [kick/remove]',
    example: '.antiphising on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 3,
    carne: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || {}
    const option = m.text?.toLowerCase()?.trim()

    if (!option) {
        const status = groupData.antiphising || 'off'
        const mode = groupData.antiphisingMode || 'remove'
        return m.reply(
            `🎣 *ᴀɴᴛɪᴘʜɪsɪɴɢ*\n\n` +
            `> Estado: *${status.toUpperCase()}*\n` +
            `> Modo: *${mode.toUpperCase()}*\n\n` +
            `> Detecta mensajes de phishing como clics en enlaces, verificación de cuenta, login falso, acortadores sospechosos, URL de IP, punycode y patrones similares.\n\n` +
            `> \`${m.prefix}antiphising on\`\n` +
            `> \`${m.prefix}antiphising off\`\n` +
            `> \`${m.prefix}antiphising metode kick\`\n` +
            `> \`${m.prefix}antiphising metode remove\``
        )
    }

    if (option === 'on') {
        db.setGroup(m.chat, { antiphising: 'on' })
        return m.reply("╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n┃ "+'✅ *AntiPhishing activado*'+"\n╰━━━━━━━━━━━━╯")
    }

    if (option === 'off') {
        db.setGroup(m.chat, { antiphising: 'off' })
        return m.reply("╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n┃ "+'❌ *AntiPhishing desactivado*'+"\n╰━━━━━━━━━━━━╯")
    }

    if (option.startsWith('metode')) {
        const method = m.args?.[1]?.toLowerCase()
        if (method === 'kick') {
            db.setGroup(m.chat, { antiphising: 'on', antiphisingMode: 'kick' })
            return m.reply("╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n┃ "+'✅ *Modo KICK de AntiPhishing activado*'+"\n╰━━━━━━━━━━━━╯")
        }
        if (method === 'remove' || method === 'delete') {
            db.setGroup(m.chat, { antiphising: 'on', antiphisingMode: 'remove' })
            return m.reply("╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n┃ "+'✅ *Modo DELETE de AntiPhishing activado*'+"\n╰━━━━━━━━━━━━╯")
        }
        return m.reply("╰┈➤ "+'❌ ¡Método no válido! Usa: `kick` o `remove`')
    }

    if (option === 'kick') {
        db.setGroup(m.chat, { antiphising: 'on', antiphisingMode: 'kick' })
        return m.reply("╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n┃ "+'✅ *Modo KICK de AntiPhishing activado*'+"\n╰━━━━━━━━━━━━╯")
    }

    if (option === 'remove' || option === 'delete') {
        db.setGroup(m.chat, { antiphising: 'on', antiphisingMode: 'remove' })
        return m.reply("╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n┃ "+'✅ *Modo DELETE de AntiPhishing activado*'+"\n╰━━━━━━━━━━━━╯")
    }

    return m.reply("╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n┃ "+'❌ ¡Opción no válida! Usa: `on`, `off`, `metode kick`, `metode remove`'+"\n╰━━━━━━━━━━━━╯")
}

export { pluginConfig as config, handler }
