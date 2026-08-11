import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'quitar_carne',
    alias: ["kurangcarne", "removecarne"],
    category: 'owner',
    description: 'Quitar carne al usuario',
    usage: '.delcarne <cantidad> @user',
    example: '.delcarne 50 @user',
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
            `⚡ *ʀᴇsᴛᴀʀ ᴇɴᴇʀɢɪ́ᴀ*\n\n` +
            `> \`.delcarne <cantidad>\` - de ti mismo\n` +
            `> \`.delcarne <cantidad> @user\` - de un usuario\n\n` +
            `\`Ejemplo: ${m.prefix}quitar_carne 50\``
        )
    }
    
    if (amount <= 0) {
        return m.reply(`❌ *ꜰᴀʟʟɪᴅᴏ*\n\n> La cantidad debe ser mayor que 0`)
    }
    
    const user = db.getUser(targetJid)
    
    if (!user) {
        return m.reply(`❌ *ꜰᴀʟʟɪᴅᴏ*\n\n> El usuario no existe en la base de datos`)
    }
    
    if (user.carne === -1) {
        db.setUser(targetJid, { carne: 25 })
    }
    
    const newCarne = db.updateCarne(targetJid, -amount)
    
    await m.react('✅')
    
    await m.reply(
        `✅ *ᴇɴᴇʀɢɪ́ᴀ ʀᴇsᴛᴀᴅᴀ*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇ* 」\n` +
        `┃ 👤 ᴜsᴜᴀʀɪᴏ: @${targetJid.split('@')[0]}\n` +
        `┃ ➖ ʀᴇsᴛᴀᴅᴀ: *-${formatNumber(amount)}*\n` +
        `┃ ⚡ ʀᴇsᴛᴀɴᴛᴇ: *${formatNumber(newCarne)}*\n` +
        `╰┈┈⬡`,
        { mentions: [targetJid] }
    )
}

export { pluginConfig as config, handler }