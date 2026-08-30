import config from '../../config.js'
import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'ver_dueno',
    alias: ['ownerinfo'],
    category: 'owner',
    description: 'Comprueba si el usuario es el capitán del bot',
    usage: '.ver_dueno @usuario',
    example: '.ver_dueno',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    let targetNumber = ''
    let targetJid = ''

    if (m.quoted) {
        targetNumber = m.quoted.sender?.replace(/[^0-9]/g, '') || ''
        targetJid = m.quoted.sender
    } else if (m.mentionedJid?.length) {
        targetNumber = m.mentionedJid[0]?.replace(/[^0-9]/g, '') || ''
        targetJid = m.mentionedJid[0]
    } else if (m.args?.length) {
        targetNumber = m.args[0].replace(/[^0-9]/g, '')
        targetJid = targetNumber + '@s.whatsapp.net'
    } else {
        targetNumber = m.sender?.replace(/[^0-9]/g, '') || ''
        targetJid = m.sender
    }

    if (targetNumber.startsWith('0')) targetNumber = '62' + targetNumber.slice(1)

    const isOwnerUser = config.isOwner(targetNumber)
    const isPartnerUser = config.isPartner(targetNumber)
    const isPremiumUser = config.isPremium(targetNumber)
    const user = db.getUser(targetJid)

    const roles = []
    if (isOwnerUser) roles.push('👑 Capitán')
    if (isPartnerUser) roles.push('🤝 Partner')
    if (isPremiumUser) roles.push('💎 Premium')
    if (roles.length === 0) roles.push('👤 Usuario Gratis')

    const ownerList = db.data.owner || []
    const isInOwnerDb = ownerList.includes(targetNumber)

    let txt = `☽◯☾ ╭━ ♰ 👑 INFO DEL USUARIO ♰ ━╮ ☽◯☾\n\n`
    txt += `👤 Usuario: @${targetNumber}\n`
    txt += `🏷️ Rol: *${roles.join(' • ')}*\n`
    txt += `📊 BD Capitán: *${isInOwnerDb ? 'Sí' : 'No'}*\n`
    if (user) {
        txt += `⚡ Carne: *${user.carne === -1 ? '∞' : (user.carne ?? 0)}*\n`
        txt += `💰 Berry: *${user.berry === -1 ? '∞' : (user.berry ?? 0).toLocaleString('id-ID')}*\n`
        txt += `⭐ Level: *${user.level ?? 1}*\n`
    }
    txt += `\n👑•─────•👑\n`

    await m.reply(txt, { mentions: [targetJid] })
}

export { pluginConfig as config, handler }
