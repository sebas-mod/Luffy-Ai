import { getDatabase } from '../../src/lib/luffy-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'carne',
    alias: ["ver_carne", "mycarne"],
    category: 'user',
    description: 'Ver carne del usuario',
    usage: '.carne [@user]',
    example: '.carne',
    isOwner: false,
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
    
    let targetJid = m.sender
    let targetName = m.pushName || 'Tú'
    
    if (m.quoted) {
        targetJid = m.quoted.sender
        targetName = m.quoted.pushName || targetJid.split('@')[0]
    } else if (m.mentionedJid?.length) {
        targetJid = m.mentionedJid[0]
        targetName = targetJid.split('@')[0]
    }
    
    const user = db.getUser(targetJid) || db.setUser(targetJid)
    const isOwner = config.owner?.number?.includes(targetJid.replace(/[^0-9]/g, '')) || config.isOwner?.(targetJid)

    const dbToggle = db.setting('carne')
    const carneEnabled = dbToggle !== undefined ? dbToggle : (config.carne?.enabled !== false)

    let finalCarne
    if (!carneEnabled || isOwner) {
        finalCarne = -1
    } else if (user.isPremium) {
        finalCarne = user.carne ?? config.carne?.premium ?? 100
    } else {
        finalCarne = user.carne ?? config.carne?.default ?? 25
    }

    const isUnlimited = finalCarne === -1
    const carneDisplay = formatNumber(finalCarne)
    
    const isSelf = targetJid === m.sender
    
    let userStatus = 'Free'
    if (isOwner) userStatus = 'Owner'
    else if (user.isPremium) userStatus = 'Premium'
    if (!carneEnabled) userStatus += ' (Carne OFF)'
    
    let text = `☽◯☾ ╭━ ♰ ⚡ CARNE ♰ ━╮ ☽◯☾\n\n`

text += `┃ 👤 Usuario: ${targetName}\n`
text += `┃ ⚡ Carne: ${carneDisplay}\n`
text += `┃ 💎 Estado: ${userStatus}\n`
text += `╰━ ⊱༺༒༻⊰ ━╯\n\n`
    
    if (!carneEnabled) {
        text += `🔌 Sistema de carne desactivado — todos los comandos son gratis`
    } else if (isSelf && !isUnlimited && finalCarne < 10) {
        text += `⚠️ ¡Tu carne casi se agota!\n`
        text += `Usa \`.buycarne\` para comprar`
    } else if (isUnlimited) {
        text += `✨ ¡Carne ilimitada activa!`
    }
    
    await m.reply(text)
}

export { pluginConfig as config, handler }