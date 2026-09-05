import config from '../../config.js'
import { getDatabase } from '../../src/lib/luffy-database.js'
import { isLid, lidToJid } from '../../src/lib/luffy-lid.js'

const pluginConfig = {
    name: 'unban',
    alias: ['delban'],
    category: 'owner',
    description: 'Eliminar un usuario de la lista de baneados',
    usage: '.unban <número/@tag>',
    example: '.unban 6281234567890',
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
            `☽◯☾ ╭━ ♰ 👑 OWNER ♰ ━╮ ☽◯☾\n` +
            `┃ ✅ *ᴜɴʙᴀɴ ᴅᴇ ᴜsᴜᴀʀɪᴏ*\n` +
            `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
            `☽◯☾ ♰ Introduce el número o etiqueta al usuario\n\n` +
            `\`Ejemplo: ${m.prefix}unban 6281234567890\``
        )
    }

    const db = getDatabase()
    const bannedList = db.setting('bannedUsers') || []

    const index = bannedList.findIndex(b => {
        const c = String(b).replace(/[^0-9]/g, '')
        return c === targetNumber || c.endsWith(targetNumber) || targetNumber.endsWith(c)
    })

    if (index === -1) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n☽◯☾ ♰ El número \`${targetNumber}\` no está en la lista de baneados`)
    }

    bannedList.splice(index, 1)
    db.setting('bannedUsers', bannedList)
    config.bannedUsers = bannedList

    await m.react('✅')

    await m.reply(
        `✅ *ᴜsᴜᴀʀɪᴏ ᴅᴇsʙᴀɴᴇᴀᴅᴏ*\n\n` +
        `☽◯☾ ♰ 「 📋 *ᴅᴇᴛᴀʟʟᴇ* 」\n` +
        `┃ 📱 ɴúᴍᴇʀᴏ: \`${targetNumber}\`\n` +
        `┃ ✅ ᴇsᴛᴀᴅᴏ: \`Desbaneado\`\n` +
        `┃ 📊 ᴛᴏᴛᴀʟ: \`${bannedList.length}\` ᴜsᴜᴀʀɪᴏs\n` +
        `╰━ ⊱༺༒༻⊰ ━╯`
    )
}

export { pluginConfig as config, handler }