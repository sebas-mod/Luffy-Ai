import { getDatabase } from '../../src/lib/luffy-database.js'

const pluginConfig = {
    name: 'antiswgc',
    alias: ['antiswgroup', 'antiswmentiongc', 'antiswtaggc'],
    category: 'group',
    description: 'Detectar menciones tipo SW group o menciones de estado que llegan al grupo',
    usage: '.antiswgc <on/off>',
    example: '.antiswgc on',
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

async function handler(m, { db }) {
    const action = (m.args || [])[0]?.toLowerCase()
    const group = db.getGroup(m.chat) || {}

    if (!action) {
        const status = group.antiswgc || 'off'
        await m.reply(
            `📡 *ᴀɴᴛɪsᴡɢᴄ*\n\n` +
            `> Estado: *${status === 'on' ? '✅ Activo' : '❌ Inactivo'}*\n\n` +
            `> Esta función detecta menciones tipo SW group como:\n` +
            `> • groupStatusMentionMessage\n` +
            `> • groupMentionedMessage\n` +
            `> • statusMentionMessage\n` +
            `> • contextInfo.groupMentions\n\n` +
            `> \`${m.prefix}antiswgc on\`\n` +
            `> \`${m.prefix}antiswgc off\``
        )
        return
    }

    if (action === 'on') {
        db.setGroup(m.chat, { ...group, antiswgc: 'on' })
        await m.reply("☽◯☾ ╭ ♰ 🛡️ PROTECCIÓN ♰ ━╮ ☽◯☾\n"+'✅ *AntiSWGC activo*\n\n> Las menciones tipo SW group se eliminarán automáticamente.'+"\n╰━ ⊱༺༒༻⊰ ━╯")
        return
    }

    if (action === 'off') {
        db.setGroup(m.chat, { ...group, antiswgc: 'off' })
        await m.reply("☽◯☾ ╭ ♰ 🛡️ PROTECCIÓN ♰ ━╮ ☽◯☾\n┃ "+'❌ *AntiSWGC inactivo*'+"\n╰━ ⊱༺༒༻⊰ ━╯")
        return
    }

    await m.reply("☽◯☾ ╭ ♰ 🛡️ PROTECCIÓN ♰ ━╮ ☽◯☾\n┃ "+'❌ Usa: on u off'+"\n╰━ ⊱༺༒༻⊰ ━╯")
}

export { pluginConfig as config, handler }
