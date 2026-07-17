import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'buyenergi',
    alias: ['belienergi', 'purchaseenergi', 'buyenergy'],
    category: 'user',
    description: 'Comprar energía con monedas (1 energía = 100 monedas)',
    usage: '.buyenergi <cantidad>',
    example: '.buyenergi 10',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const PRICE_PER_ENERGI = 100

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const amount = parseInt(m.args[0]) || 0
    
    if (amount <= 0) {
        const user = db.getUser(m.sender) || db.setUser(m.sender)
        
        return m.reply(
            `🛒 *ʙᴜʏ ᴇɴᴇʀɢɪ*\n\n` +
            `╭┈┈⬡「 💰 *ɪɴꜰᴏ* 」\n` +
            `┃ 💵 ᴘʀᴇᴄɪᴏ: *${PRICE_PER_ENERGI}* belly/energi\n` +
            `┃ 💰 ᴛᴜs ʙᴇʟʟʏ: *${formatNumber(user.belly || 0)}*\n` +
            `╰┈┈⬡\n\n` +
            `> Usa: \`.buyenergi <cantidad>\`\n\n` +
            `\`Ejemplo: ${m.prefix}buyenergi 10\``
        )
    }
    
    const totalPrice = amount * PRICE_PER_ENERGI
    const user = db.getUser(m.sender) || db.setUser(m.sender)
    
    if ((user.belly || 0) < totalPrice) {
        return m.reply(
            `❌ *ꜰᴀʟʟó*\n\n` +
            `> ¡No tienes suficientes Belly!\n` +
            `> Necesitas: *${formatNumber(totalPrice)}*\n` +
            `> Tienes: *${formatNumber(user.belly || 0)}*`
        )
    }
    
    db.updateBelly(m.sender, -totalPrice)
    
    if (user.energi === -1) {
        db.updateBelly(m.sender, totalPrice)
        m.react('✅')
        return m.reply(
            `✅ *ᴄᴏᴍᴘʀᴀ ᴇxɪᴛᴏꜱᴀ*\n\n` +
            `> ¡Pero ya tienes energía ilimitada!\n` +
            `> Belly devueltas.`
        )
    }
    
    const newEnergi = db.updateEnergi(m.sender, amount)
    const newBelly = db.getUser(m.sender).belly
    
    m.react('✅')
    
    await m.reply(
        `✅ *ᴄᴏᴍᴘʀᴀ ᴇxɪᴛᴏꜱᴀ*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ ⚡ ᴇɴᴇʀɢíᴀ: *+${formatNumber(amount)}*\n` +
        `┃ 💵 ᴘʀᴇᴄɪᴏ: *-${formatNumber(totalPrice)}* Belly\n` +
        `╰┈┈⬡\n\n` +
        `╭┈┈⬡「 💰 *sᴀʟᴅᴏ* 」\n` +
        `┃ ⚡ ᴇɴᴇʀɢíᴀ: *${formatNumber(newEnergi)}*\n` +
        `┃ 💰 ʙᴇʟʟʏ: *${formatNumber(newBelly)}*\n` +
        `╰┈┈⬡`
    )
}

export { pluginConfig as config, handler }