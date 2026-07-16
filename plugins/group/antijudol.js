import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'antijudol',
    alias: ['antijudi', 'nojudi', 'antislot'],
    category: 'group',
    description: 'Detecta contenido de apuestas en el grupo',
    usage: '.antijudol <on/off/metode> [kick/remove]',
    example: '.antijudol on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || {}
    const option = m.text?.toLowerCase()?.trim()

    if (!option) {
        const status = groupData.antijudol || 'off'
        const mode = groupData.antijudolMode || 'remove'
        return m.reply(
            `🎰 *ᴀɴᴛɪᴊᴜᴅᴏʟ*\n\n` +
            `> Estado: *${status.toUpperCase()}*\n` +
            `> Modo: *${mode.toUpperCase()}*\n\n` +
            `> Detecta contenido de apuestas como gambling, slots, gacor, maxwin, lotería, bonos de miembros, links alternativos y patrones similares.\n\n` +
            `> \`${m.prefix}antijudol on\`\n` +
            `> \`${m.prefix}antijudol off\`\n` +
            `> \`${m.prefix}antijudol metode kick\`\n` +
            `> \`${m.prefix}antijudol metode remove\``
        )
    }

    if (option === 'on') {
        db.setGroup(m.chat, { antijudol: 'on' })
        return m.reply('✅ *AntiJudol activado*')
    }

    if (option === 'off') {
        db.setGroup(m.chat, { antijudol: 'off' })
        return m.reply('❌ *AntiJudol desactivado*')
    }

    if (option.startsWith('metode')) {
        const method = m.args?.[1]?.toLowerCase()
        if (method === 'kick') {
            db.setGroup(m.chat, { antijudol: 'on', antijudolMode: 'kick' })
            return m.reply('✅ *AntiJudol modo KICK activado*')
        }
        if (method === 'remove' || method === 'delete') {
            db.setGroup(m.chat, { antijudol: 'on', antijudolMode: 'remove' })
            return m.reply('✅ *AntiJudol modo DELETE activado*')
        }
        return m.reply(`❌ ¡Método no válido! Usa: \`kick\` o \`remove\``)
    }

    if (option === 'kick') {
        db.setGroup(m.chat, { antijudol: 'on', antijudolMode: 'kick' })
        return m.reply('✅ *AntiJudol modo KICK activado*')
    }

    if (option === 'remove' || option === 'delete') {
        db.setGroup(m.chat, { antijudol: 'on', antijudolMode: 'remove' })
        return m.reply('✅ *AntiJudol modo DELETE activado*')
    }

    return m.reply('❌ ¡Opción no válida! Usa: `on`, `off`, `metode kick`, `metode remove`')
}

export { pluginConfig as config, handler }
