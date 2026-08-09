import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'delberry',
    alias: ['kurangberry', 'removeberry'],
    category: 'owner',
    description: 'Quitar berry al usuario',
    usage: '.delberry <cantidad> @user',
    example: '.delberry 50000 @user',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
}

function formatBerry(num) {
    if (num >= 1000000000000) return (num / 1000000000000).toFixed(2) + 'T'
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function extractTarget(m) {
    if (m.quoted) return m.quoted.sender
    if (m.mentionedJid?.length) return m.mentionedJid[0]
    return null
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args
    
    const numArg = args.find(a => !isNaN(a) && !a.startsWith('@'))
    const amount = parseInt(numArg) || 0
    
    let targetJid = await extractTarget(m)
    
    if (!targetJid && amount > 0) {
        targetJid = m.sender
    }
    
    if (!targetJid || amount <= 0) {
        return m.reply(
            `💰 *ʀᴇsᴛᴀʀ ʙᴇʀʀʏ*\n\n` +
            `> \`.delberry <cantidad>\` - de ti mismo\n` +
            `> \`.delberry <cantidad> @user\` - de un usuario\n\n` +
            `\`Ejemplo: ${m.prefix}delberry 50000\``
        )
    }
    
    if (amount <= 0) {
        return m.reply(`❌ *ꜰᴀʟʟɪᴅᴏ*\n\n> La cantidad debe ser mayor que 0`)
    }
    
    const user = db.getUser(targetJid)
    
    if (!user) {
        return m.reply(`❌ *ꜰᴀʟʟɪᴅᴏ*\n\n> El usuario no existe en la base de datos`)
    }
    
    const newBerry = db.updateBerry(targetJid, -amount)
    
    await m.react('✅')
    
    await m.reply(
        `✅ *ʙᴇʀʀʏ ʀᴇsᴛᴀᴅᴏ*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇ* 」\n` +
        `┃ 👤 ᴜsᴜᴀʀɪᴏ: @${targetJid.split('@')[0]}\n` +
        `┃ ➖ ʀᴇsᴛᴀᴅᴏ: *-${formatBerry(amount)}*\n` +
        `┃ 💰 ʀᴇsᴛᴀɴᴛᴇ: *${formatBerry(newBerry)}*\n` +
        `╰┈┈⬡`,
        { mentions: [targetJid] }
    )
}

export { pluginConfig as config, handler }