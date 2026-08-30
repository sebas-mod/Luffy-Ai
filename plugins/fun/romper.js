/**
 * Putus - End relationship
 */

import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'romper',
    alias: ['breakup', 'cerai'],
    category: 'fun',
    description: 'Termina la relación con tu pareja',
    usage: '.romper',
    example: '.romper',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 60,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    let senderData = db.getUser(m.sender) || {}
    if (!senderData.fun) senderData.fun = {}
    if (!senderData.fun.pasangan) {
        await m.react('❌')
        return m.reply(
            `❌ *No tienes pareja*\n\n` +
            `Busca una primero con \`${m.prefix}disparar @tag\``
        )
    }
    const exPartner = senderData.fun.pasangan
    let exData = db.getUser(exPartner) || {}
    delete senderData.fun.pasangan
    if (exData.fun?.pasangan === m.sender) {
        delete exData.fun.pasangan
        db.setUser(exPartner, exData)
    }
    db.setUser(m.sender, senderData)
    await m.react('💔')
    await m.reply(
        `☠︎━━━━━━☠︎\n💔 *¡ROMPIERON!* 💔\n\n` +
        `@${m.sender.split('@')[0]} y @${exPartner.split('@')[0]} oficialmente terminaron su relación !!\n\n` +
        `¡Espero que encuentren algo mejor! 🙏`,
        { mentions: [m.sender, exPartner] }
    )
}

export { pluginConfig as config, handler }