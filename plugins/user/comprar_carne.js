import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'comprar_carne',
    alias: ["purchasecarne"],
    category: 'user',
    description: 'Comprar carne con berry (1 carne = 100 berry)',
    usage: '.buycarne <cantidad>',
    example: '.buycarne 10',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

const PRICE_PER_CARNE = 100

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const amount = parseInt(m.args[0]) || 0
    
    if (amount <= 0) {
        const user = db.getUser(m.sender) || db.setUser(m.sender)
        
        return m.reply(
            `🛒 *ᴄᴏᴍᴘʀᴀʀ ᴄᴀʀɴᴇ*\n\n` +
            `╭┈┈⬡「 💰 *ɪɴꜰᴏ* 」\n` +
            `┃ 💵 ᴘʀᴇᴄɪᴏ: *${PRICE_PER_CARNE}* berry/carne\n` +
            `┃ 💰 ᴛᴜs ʙᴇʀʀʏ: *${formatNumber(user.berry || 0)}*\n` +
            `╰┈┈⬡\n\n` +
            `> Usa: \`.buycarne <cantidad>\`\n\n` +
            `\`Ejemplo: ${m.prefix}comprar_carne 10\``
        )
    }
    
    const totalPrice = amount * PRICE_PER_CARNE
    const user = db.getUser(m.sender) || db.setUser(m.sender)
    
    if ((user.berry || 0) < totalPrice) {
        return m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> ¡No tienes suficientes berry!\n` +
            `> Necesitas: *${formatNumber(totalPrice)}*\n` +
            `> Tienes: *${formatNumber(user.berry || 0)}*`
        )
    }
    
    db.updateBerry(m.sender, -totalPrice)
    
    if (user.carne === -1) {
        m.react('✅')
        return m.reply(
            `✅ *ᴄᴏᴍᴘʀᴀ ᴇxɪᴛᴏsᴀ*\n\n` +
            `> Pero ya tienes carne ilimitada!\n` +
            `> Berry devueltos.`
        )
    }
    
    const newCarne = db.updateCarne(m.sender, amount)
    const newBerry = db.getUser(m.sender).berry
    
    m.react('✅')
    
    await m.reply(
        `✅ *ᴄᴏᴍᴘʀᴀ ᴇxɪᴛᴏsᴀ*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇ* 」\n` +
        `┃ ⚡ ᴄᴀʀɴᴇ: *+${formatNumber(amount)}*\n` +
        `┃ 💵 ᴘʀᴇᴄɪᴏ: *-${formatNumber(totalPrice)}* berry\n` +
        `╰┈┈⬡\n\n` +
        `╭┈┈⬡「 💰 *sᴀʟᴅᴏ* 」\n` +
        `┃ ⚡ ᴄᴀʀɴᴇ: *${formatNumber(newCarne)}*\n` +
        `┃ 💰 ʙᴇʀʀʏ: *${formatNumber(newBerry)}*\n` +
        `╰┈┈⬡`
    )
}

export { pluginConfig as config, handler }