import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'agregar_berry',
    alias: ["giveberry"],
    category: 'owner',
    description: 'Añadir berry al usuario (máx 9 billones)',
    usage: '.addberry <cantidad> @user',
    example: '.addberry 100000 @user',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
}

const MAX_BERRY = 9000000000000
function formatBerry(num) {
    if (num === -1) return '∞ Ilimitado'
    if (num >= 1000000000000) return (num / 1000000000000).toFixed(2) + 'T'
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []

    const numArg = args.find(a => !isNaN(a) && !a.startsWith('@'))
    let amount = parseInt(numArg) || 0

    let targetJid = null
    if (m.quoted) {
        targetJid = m.quoted.sender
    } else if (m.mentionedJid?.length) {
        targetJid = m.mentionedJid[0]
    }

    if (!targetJid && amount > 0) {
        targetJid = m.sender
    }

    if (!targetJid || amount <= 0) {
        return m.reply(
            `💰 *ᴀɢʀᴇɢᴀʀ ʙᴇʀʀʏ*\n\n` +
            `> \`.addberry <cantidad>\` - a ti mismo\n` +
            `> \`.addberry <cantidad> @user\` - a otra persona\n` +
            `> Máx: 9.000.000.000.000 (9T)\n\n` +
            `\`Ejemplo: ${m.prefix}agregar_berry 100000\``
        )
    }

    if (amount > MAX_BERRY) amount = MAX_BERRY

    const user = db.getUser(targetJid) || db.setUser(targetJid)

    if (user.berry === -1) {
        return m.reply(
            `💰 *INFORMACIÓN*\n` +
            `@${targetJid.split('@')[0]} ya tiene berry *∞ Unlimited*\n` +
            `No es necesario añadir más berry`,
            { mentions: [targetJid] }
        )
    }

    const newBerry = db.updateBerry(targetJid, amount)

    await m.react('✅')
    await m.reply(
        `╭━━━〔 ✦ ÉXITO 〕━━━╮\n┃ ✅ Exitoso, se añadió *${formatBerry(amount)}* berry a *@${targetJid.split('@')[0]}*\n╰━━━━━━━━━━━━╯`,
        { mentions: [targetJid] }
    )
}

export { pluginConfig as config, handler }