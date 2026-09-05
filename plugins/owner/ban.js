import config from '../../config.js'
import { getDatabase } from '../../src/lib/luffy-database.js'
import { isLid, lidToJid, resolveAnyLidToJid } from '../../src/lib/luffy-lid.js'

const pluginConfig = {
    name: 'ban',
    alias: ['addban'],
    category: 'owner',
    description: 'Bloquear al usuario para que no use el bot',
    usage: '.ban <numero/@tag>',
    example: '.ban 6281234567890',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
}

function resolveTarget(m) {
    let raw = ''

    if (m.quoted) {
        raw = m.quoted.sender || ''
    } else if (m.mentionedJid?.length) {
        raw = m.mentionedJid[0] || ''
    } else if (m.args[0]) {
        raw = m.args[0]
    }

    if (!raw) return ''

    if (isLid(raw)) raw = lidToJid(raw)
    let num = raw.replace(/[^0-9]/g, '')
    if (num.startsWith('08')) num = '62' + num.slice(1)
    if (num.startsWith('0')) num = '62' + num.slice(1)

    return num
}

async function handler(m, { sock }) {
    const targetNumber = resolveTarget(m)

    if (!targetNumber || targetNumber.length < 10 || targetNumber.length > 15) {
        return m.reply(
            `🚫 *ʙᴀɴ ᴅᴇ ᴜsᴜᴀʀɪᴏ*\n\n` +
            `> Introduce el número o etiqueta al usuario\n\n` +
            `\`Ejemplo: ${m.prefix}ban 6281234567890\``
        )
    }

    if (config.isOwner(targetNumber)) {
        return m.reply(`👑•─────•👑\n❌ *ᴇʀʀᴏʀ*\n\n> No se puede banear al owner\n♰ ──────── ♱`)
    }

    const db = getDatabase()
    const bannedList = db.setting('bannedUsers') || []

    const alreadyBanned = bannedList.some(b => {
        const c = String(b).replace(/[^0-9]/g, '')
        return c === targetNumber || c.endsWith(targetNumber) || targetNumber.endsWith(c)
    })

    if (alreadyBanned) {
        return m.reply(`👑•─────•👑\n❌ *ᴇʀʀᴏʀ*\n\n> El número \`${targetNumber}\` ya está baneado\n♰ ──────── ♱`)
    }

    bannedList.push(targetNumber)
    db.setting('bannedUsers', bannedList)
    config.bannedUsers = bannedList

    await m.react('🚫')

    await m.reply(
        `🚫 *ᴜsᴜᴀʀɪᴏ ʙᴀɴᴇᴀᴅᴏ*\n\n` +
        `☽◯☾ ♰ 「 📋 *ᴅᴇᴛᴀʟʟᴇ* 」\n` +
        `┃ 📱 ɴúᴍᴇʀᴏ: \`${targetNumber}\`\n` +
        `┃ 🚫 ᴇsᴛᴀᴅᴏ: \`Baneado\`\n` +
        `┃ 📊 ᴛᴏᴛᴀʟ: \`${bannedList.length}\` ᴜsᴜᴀʀɪᴏs\n` +
        `╰━ ⊱༺༒༻⊰ ━╯`
    )
}

export { pluginConfig as config, handler }