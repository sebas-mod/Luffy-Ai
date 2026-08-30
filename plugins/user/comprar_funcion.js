import { getDatabase } from '../../src/lib/luffy-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'comprar_funcion',
    alias: ["purchasefeature", "buyfeature"],
    category: 'user',
    description: 'Comprar función premium (1 función = 3000 berry)',
    usage: '.comprar_funcion [nombre_funcion]',
    example: '.comprar_funcion',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

const PRICE_PER_FEATURE = 3000

const PREMIUM_FEATURES = [
    { id: 'sticker', name: 'Sticker Unlimited', desc: 'Unlimited sticker commands' },
    { id: 'downloader', name: 'Downloader Pro', desc: 'Descarga sin límite' },
    { id: 'ai', name: 'AI Access', desc: 'Acceso a funciones AI premium' },
    { id: 'tools', name: 'Advanced Tools', desc: 'Herramientas exclusivas' },
    { id: 'game', name: 'Game Bonus', desc: '2x recompensas de juego' }
]

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender) || db.setUser(m.sender)
    const featureName = m.args[0]?.toLowerCase()
    
    if (user.isPremium || config.isPremium(m.sender)) {
        return m.reply(
            `✨ *ᴘʀᴇᴍɪᴜᴍ ᴜsᴇʀ*\n\n` +
            `> ¡Ya eres premium!\n` +
            `> ¡Todas las funciones ya están desbloqueadas!`
        )
    }
    
    if (!featureName) {
        const unlockedFeatures = user.unlockedFeatures || []
        
        let text = `╭━━━━━━━━━━━━━━━━━╮\n`
        text += `┃  🛒 *ʙᴜʏ ꜰɪᴛᴜʀ*\n`
        text += `╰━━━━━━━━━━━━━━━━━╯\n\n`
        
        text += `> Precio: *${formatNumber(PRICE_PER_FEATURE)}* bal/función\n`
        text += `> Berry: *${formatNumber(user.berry || 0)}*\n\n`
        
        text += `☽◯☾ ♰ 「 📋 *ꜰɪᴛᴜʀ* 」\n`
        
        for (const feature of PREMIUM_FEATURES) {
            const isUnlocked = unlockedFeatures.includes(feature.id)
            const status = isUnlocked ? '✅' : '🔒'
            text += `┃ ${status} *${feature.name}*\n`
            text += `┃    _${feature.desc}_\n`
            text += `┃    ID: \`${feature.id}\`\n`
            text += `┃\n`
        }
        
        text += `╰━ ⊱༺༒༻⊰ ━╯\n\n`
        text += `> Usa: \`.comprar_funcion <id>\`\n`
        text += `> O hazte *Premium* y desbloquea todo!`
        
        await m.reply(text)
        return
    }
    
    const feature = PREMIUM_FEATURES.find(f => f.id === featureName)
    
    if (!feature) {
        return m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> La función \`${featureName}\` no fue encontrada\n` +
            `> Escribe \`.comprar_funcion\` para ver la lista`
        )
    }
    
    const unlockedFeatures = user.unlockedFeatures || []
    
    if (unlockedFeatures.includes(feature.id)) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> La función \`${feature.name}\` ya está desbloqueada!`)
    }
    
    if ((user.berry || 0) < PRICE_PER_FEATURE) {
        return m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> ¡No tienes suficientes berry!\n` +
            `> Necesitas: *${formatNumber(PRICE_PER_FEATURE)}*\n` +
            `> Tienes: *${formatNumber(user.berry || 0)}*`
        )
    }
    
    db.updateBerry(m.sender, -PRICE_PER_FEATURE)
    unlockedFeatures.push(feature.id)
    db.setUser(m.sender, { unlockedFeatures })
    
    const newBerry = db.getUser(m.sender).berry
    
    m.react('✅')
    
    await m.reply(
        `✅ *ꜰᴜɴᴄɪᴏɴ ᴅᴇsʙʟᴏǫᴜᴇᴀᴅᴀ*\n\n` +
        `☽◯☾ ♰ 「 📋 *ᴅᴇᴛᴀʟʟᴇ* 」\n` +
        `┃ 🎁 ꜰᴜɴᴄɪᴏɴ: *${feature.name}*\n` +
        `┃ 💵 ᴘʀᴇᴄɪᴏ: *-${formatNumber(PRICE_PER_FEATURE)}* bal\n` +
        `┃ 💰 ʀᴇsᴛᴀɴᴛᴇ: *${formatNumber(newBerry)}*\n` +
        `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
        `> _${feature.desc}_\n\n` +
        `> 💡 Tip: Hazte *Premium* para desbloquear TODO!`
    )
}

export { pluginConfig as config, handler, PREMIUM_FEATURES }