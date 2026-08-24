import config from '../../config.js'
import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'agregar_carne',
    alias: ["givecarne"],
    category: 'owner',
    description: 'Añadir carne al usuario',
    usage: '.addcarne <cantidad> @user',
    example: '.addcarne 100 @user',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
}

function formatNumber(num) {
    if (num === -1) return '∞ Ilimitado'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []

    let amount = 0
    let isUnlimited = false
    let targetJid = null

    if (m.text?.toLowerCase().includes('--unlimited') || m.text?.toLowerCase().includes('--unli')) {
        isUnlimited = true
    }

    const numArg = args.find(a => !isNaN(a) && !a.includes('@') && !a.startsWith('-'))
    if (numArg) amount = parseInt(numArg)

    if (m.quoted) {
        targetJid = m.quoted.sender
    } else if (m.mentionedJid?.length) {
        targetJid = m.mentionedJid[0]
    } else {
        const phoneArg = args.find(a => a !== numArg && a.length > 5 && /^\d+$/.test(a.replace(/[^0-9]/g, '')))
        if (phoneArg) {
            targetJid = phoneArg.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        }
    }

    if (!targetJid && (amount > 0 || isUnlimited)) {
        targetJid = m.sender
    }

    if (!targetJid || (!isUnlimited && amount <= 0)) {
        return m.reply(
            `⚡ *ᴀɢʀᴇɢᴀʀ ᴇɴᴇʀɢíᴀ*\n\n` +
            `> \`.addcarne <cantidad>\` - a ti mismo\n` +
            `> \`.addcarne <cantidad> @user\` - a un usuario\n` +
            `> \`.addcarne --unlimited\` - ilimitado\n\n` +
            `\`Ejemplo: ${m.prefix}agregar_carne 100\``
        )
    }

    const user = db.getUser(targetJid) || db.setUser(targetJid)

    const effectiveUnlimited = user.carne === -1 ||
        (config.isOwner(targetJid) && (config.carne?.owner ?? -1) === -1) ||
        (config.isPremium(targetJid) && (config.carne?.premium ?? -1) === -1)

    if (!isUnlimited && effectiveUnlimited) {
        return m.reply(
            `⚡ *INFORMACIÓN*\n` +
            `@${targetJid.split('@')[0]} ya tiene energía *∞ Unlimited*\n` +
            `No es necesario añadir más energía`,
            { mentions: [targetJid] }
        )
    }

    if (isUnlimited) {
        db.setUser(targetJid, { carne: -1 })

        await m.react('✅')
        await m.reply(
            `╭━━━〔 ✦ ÉXITO 〕━━━╮\n┃ ✅ *Energía de @${targetJid.split('@')[0]} ahora ilimitada / sin límite*\n╰━━━━━━━━━━━━╯`,
            { mentions: [targetJid] }
        )
    } else {
        const newCarne = db.updateCarne(targetJid, amount)

        await m.react('✅')
        await m.reply(
            `👑•─────•👑\n✅ Energía de *@${targetJid.split('@')[0]}* añadida con éxito por *${formatNumber(amount)}*!\nAhora tiene *${formatNumber(newCarne)}* de energía\n✦────────✦`,
            { mentions: [targetJid] }
        )
    }
}

export { pluginConfig as config, handler }