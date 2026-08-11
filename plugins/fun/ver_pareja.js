import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'ver_pareja',
    alias: ['pareja', 'estado_pareja'],
    category: 'fun',
    description: 'Consulta el estado de la relación de alguien',
    usage: '.ver_pareja o .ver_pareja @tag',
    example: '.ver_pareja',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    let targetJid = m.sender
    let isOther = false
    if (m.quoted) {
        targetJid = m.quoted.sender
        isOther = true
    } else if (m.mentionedJid?.[0]) {
        targetJid = m.mentionedJid[0]
        isOther = true
    } else if (args[0]) {
        let num = args[0].replace(/[^0-9]/g, '')
        if (num.length > 5 && num.length < 20) {
            targetJid = num + '@s.whatsapp.net'
            isOther = true
        }
    }
    
    const userData = db.getUser(targetJid) || {}
    
    if (!userData.fun?.pasangan) {
        const nombre = isOther ? `@${targetJid.split('@')[0]}` : 'Tú'
        await m.react('💔')
        return m.reply(
            `💔 *ᴇsᴛᴀᴅᴏ ᴅᴇ ʟᴀ ʀᴇʟᴀᴄɪᴏ́ɴ*\n\n` +
            `*${nombre}* no tiene pareja.\n` +
            `TIP: Busca pareja primero con \`${m.prefix}disparar @tag\``,
            { mentions: isOther ? [targetJid] : [] }
        )
    }
    
    const partnerJid = userData.fun.pasangan
    const partnerData = db.getUser(partnerJid) || {}
    const isMutual = partnerData.fun?.pasangan === targetJid
    const nombre = isOther ? `@${targetJid.split('@')[0]}` : 'Tú'
    if (isMutual) {
        await m.react('💕')
        await m.reply(
            `💕 *ᴇsᴛᴀᴅᴏ ᴅᴇ ʟᴀ ʀᴇʟᴀᴄɪᴏ́ɴ*\n\n` +
            `*${nombre}* está de novio/a con @${partnerJid.split('@')[0]}! 🥳`,
            { mentions: [targetJid, partnerJid] }
        )
    } else {
        await m.react('💭')
        await m.reply(
            `💭 *ᴇsᴛᴀᴅᴏ ᴅᴇ ʟᴀ ʀᴇʟᴀᴄɪᴏ́ɴ*\n\n` +
            `*${nombre}* está coqueteando con @${partnerJid.split('@')[0]}\n` +
            `Estado: *En el aire* 😅\n\n` +
            `Esperando respuesta...`,
            { mentions: [targetJid, partnerJid] }
        )
    }
}

export { pluginConfig as config, handler }