import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'addbelly',
    alias: ['tambahbelly', 'givebelly', 'addcoin', 'adddcoin'],
    category: 'owner',
    description: 'Añade monedas a un usuario (máx. 9 billones)',
    usage: '.addbelly <cantidad> @user',
    example: '.addbelly 100000 @user',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

const MAX_BELLY = 9000000000000
function formatBelly(num) {
    if (num === -1) return '∞ Unlimited'
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
            `💰 *ᴀᴅᴅ ʙᴇʟʟʏ*\n\n` +
            `> \`.addbelly <cantidad>\` - a uno mismo\n` +
            `> \`.addbelly <cantidad> @user\` - a persona más\n` +
            `> Max: 9.000.000.000.000 (9T)\n\n` +
            `\`Ejemplo: ${m.prefix}addbelly 100000\``
        )
    }

    if (amount > MAX_BELLY) amount = MAX_BELLY

    const user = db.getUser(targetJid) || db.setUser(targetJid)

    if (user.belly === -1) {
        return m.reply(
            `💰 *INFORMATION*\n` +
            `@${targetJid.split('@')[0]} ya tiene monedas *∞ Unlimited*\n` +
            `No es necesario agregando belly de nuevo`,
            { mentions: [targetJid] }
        )
    }

    const newBelly = db.updateBelly(targetJid, amount)

    await m.react('✅')
    await m.reply(
        `✅ Éxito agregando belly *@${targetJid.split('@')[0]}* por la cantidad de *${formatBelly(amount)}*`,
        { mentions: [targetJid] }
    )
}

export { pluginConfig as config, handler }
