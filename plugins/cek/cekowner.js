import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'cekowner',
    alias: ['ownerinfo'],
    category: 'cek',
    description: 'Mide si el usuario es owner del bot',
    usage: '.cekowner @usuario',
    example: '.cekowner',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
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
    if (isOwnerUser) roles.push('👑 Owner')
    if (isPartnerUser) roles.push('🤝 Partner')
    if (isPremiumUser) roles.push('💎 Premium')
    if (roles.length === 0) roles.push('👤 Usuario Free')

    const ownerList = db.data.owner || []
    const isInOwnerDb = ownerList.includes(targetNumber)

    let txt = `📋 *INFO DEL USUARIO*\n\n`
    txt += `👤 Usuario: @${targetNumber}\n`
    txt += `🏷️ Rol: *${roles.join(' • ')}*\n`
    txt += `📊 Owner DB: *${isInOwnerDb ? 'Sí' : 'No'}*\n`
    if (user) {
        txt += `⚡ Energía: *${user.energi === -1 ? '∞' : (user.energi ?? 0)}*\n`
        txt += `💰 Belly: *${user.belly === -1 ? '∞' : (user.belly ?? 0).toLocaleString('es-ES')}*\n`
        txt += `⭐ Nivel: *${user.level ?? 1}*\n`
    }

    await m.reply(txt, { mentions: [targetJid] })
}

export { pluginConfig as config, handler }