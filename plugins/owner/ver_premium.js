import config from '../../config.js'
import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'ver_premium',
    alias: ["preminfo"],
    category: 'owner',
    description: 'Comprueba los detalles del estado premium del usuario',
    usage: '.ver_premium @usuario',
    example: '.ver_premium',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

function formatDate(ts) {
    return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function handler(m) {
    const db = getDatabase()
    let targetNumber = ''

    if (m.quoted) {
        targetNumber = m.quoted.sender?.replace(/[^0-9]/g, '') || ''
    } else if (m.mentionedJid?.length) {
        targetNumber = m.mentionedJid[0]?.replace(/[^0-9]/g, '') || ''
    } else if (m.args?.length) {
        targetNumber = m.args[0].replace(/[^0-9]/g, '')
    } else {
        targetNumber = m.sender?.replace(/[^0-9]/g, '') || ''
    }

    if (targetNumber.startsWith('0')) targetNumber = '62' + targetNumber.slice(1)
    if (!db.data.premium) db.data.premium = []

    const premData = db.data.premium.find(p =>
        typeof p === 'string' ? p === targetNumber : p.id === targetNumber
    )
    const jid = targetNumber + '@s.whatsapp.net'
    const isConfigPrem = config.isPremium(targetNumber)
    const isConfigOwner = config.isOwner(targetNumber)

    if (!premData && !isConfigPrem && !isConfigOwner) {
        return m.reply(`╰┈➤ ❌ @${targetNumber} no es premium`, { mentions: [jid] })
    }

    const user = db.getUser(jid)
    const now = Date.now()

    let txt = `╭━━━〔 💎 DETALLES DEL PREMIUM 〕━━━╮\n\n`
    txt += `👤 Usuario: @${targetNumber}\n`

    if (isConfigOwner) {
        txt += `🏷️ Rol: *👑 Capitán (Permanente)*\n`
    } else if (typeof premData === 'string' || !premData?.expired) {
        txt += `🏷️ Rol: *💎 Premium (Permanente)*\n`
    } else {
        const remaining = Math.ceil((premData.expired - now) / (1000 * 60 * 60 * 24))
        const totalDays = premData.addedAt ? Math.ceil((premData.expired - premData.addedAt) / (1000 * 60 * 60 * 24)) : '?'
        txt += `📛 Nombre: *${premData.name || 'Desconocido'}*\n`
        txt += `📅 Inicio: *${premData.addedAt ? formatDate(premData.addedAt) : 'Desconocido'}*\n`
        txt += `⏳ Expira: *${formatDate(premData.expired)}*\n`
        txt += `🗓️ Duración: *${totalDays} días*\n`
        txt += `📊 Restante: *${remaining > 0 ? remaining + ' días' : '⚠️ Expirado'}*\n`
    }

    if (user) {
        txt += `⚡ Carne: *${user.carne === -1 ? '∞' : (user.carne ?? 0)}*\n`
        txt += `💰 Berry: *${user.berry === -1 ? '∞' : (user.berry ?? 0).toLocaleString('id-ID')}*\n`
        txt += `⭐ Exp: *${(user.exp ?? 0).toLocaleString('id-ID')}*\n`
        txt += `📊 Level: *${user.level ?? 1}*\n`
    }
    txt += `\n💎•─────•💎\n`

    await m.reply(txt, { mentions: [jid] })
}

export { pluginConfig as config, handler }
