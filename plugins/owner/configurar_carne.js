import { getDatabase } from '../../src/lib/luffy-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'configurar_carne',
    alias: ["configurar_carne_default", "carnedefault"],
    category: 'owner',
    description: 'Establecer la carne predeterminada para usuarios nuevos',
    usage: '.setcarnedefault <cantidad>',
    example: '.setcarnedefault 50',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.args || []
    const newCarne = parseInt(args[0])
    
    if (!args[0] || isNaN(newCarne)) {
        const db = getDatabase()
        const currentDefault = db.setting('defaultCarne') || config.carne?.default || 25
        
        return m.reply(
            `📊 *ᴇsᴛᴀʙʟᴇᴄᴇʀ ᴄᴀʀɴᴇ ᴘʀᴇᴅᴇᴛᴇʀᴍɪɴᴀᴅᴀ*\n\n` +
            `> Carne predeterminada actual: \`${currentDefault}\`\n\n` +
            `*Cómo usar:*\n` +
            `> \`${m.prefix}configurar_carne <cantidad>\`\n\n` +
            `*Ejemplo:*\n` +
            `> \`${m.prefix}configurar_carne 50\``
        )
    }
    
    if (newCarne < 1 || newCarne > 1000) {
        return m.reply(`❌ *ғᴀʟʟɪᴅᴏ*\n\n> La carne debe estar entre 1 - 1000`)
    }
    
    const db = getDatabase()
    db.setting('defaultCarne', newCarne)
    
    await m.reply(
        `✅ *ᴇxɪᴛᴏsᴏ*\n\n` +
        `> Carne predeterminada cambiada a: \`${newCarne}\`\n` +
        `> Los usuarios nuevos obtendrán esta carne`
    )
}

export { pluginConfig as config, handler }
