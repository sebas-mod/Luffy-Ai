import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'buyfitur',
    alias: ['belifitur', 'purchasefeature', 'buyfeature'],
    category: 'user',
    description: 'Comprar función premium (1 función = 3000 monedas)',
    usage: '.buyfitur [nombre_función]',
    example: '.buyfitur',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
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
        text += `┃  🛒 *ᴄᴏᴍᴘʀᴀʀ ꜰᴜɴᴄɪóɴ*\n`
        text += `╰━━━━━━━━━━━━━━━━━╯\n\n`
        
        text += `> Precio: *${formatNumber(PRICE_PER_FEATURE)}* Belly/función\n`
        text += `> Belly: *${formatNumber(user.belly || 0)}*\n\n`
        
        text += `╭┈┈⬡「 📋 *ꜰᴜɴᴄɪóɴ* 」\n`
        
        for (const feature of PREMIUM_FEATURES) {
            const isUnlocked = unlockedFeatures.includes(feature.id)
            const status = isUnlocked ? '✅' : '🔒'
            text += `┃ ${status} *${feature.name}*\n`
            text += `┃    _${feature.desc}_\n`
            text += `┃    ID: \`${feature.id}\`\n`
            text += `┃\n`
        }
        
        text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        text += `> Usa: \`.buyfitur <id>\`\n`
        text += `> ¡O conviértete en *Premium* para desbloquear todo!`
        
        await m.reply(text)
        return
    }
    
    const feature = PREMIUM_FEATURES.find(f => f.id === featureName)
    
    if (!feature) {
        return m.reply(
            `❌ *ꜰᴀʟʟó*\n\n` +
            `> La función \`${featureName}\` no fue encontrada\n` +
            `> Escribe \`.buyfitur\` para ver la lista`
        )
    }
    
    const unlockedFeatures = user.unlockedFeatures || []
    
    if (unlockedFeatures.includes(feature.id)) {
        return m.reply(`❌ *ꜰᴀʟʟó*\n\n> ¡La función \`${feature.name}\` ya está desbloqueada!`)
    }
    
    if ((user.belly || 0) < PRICE_PER_FEATURE) {
        return m.reply(
            `❌ *ꜰᴀʟʟó*\n\n` +
            `> ¡No tienes suficientes Belly!\n` +
            `> Necesitas: *${formatNumber(PRICE_PER_FEATURE)}*\n` +
            `> Tienes: *${formatNumber(user.belly || 0)}*`
        )
    }
    
    db.updateBelly(m.sender, -PRICE_PER_FEATURE)
    unlockedFeatures.push(feature.id)
    db.setUser(m.sender, { unlockedFeatures })
    
    const newBelly = db.getUser(m.sender).belly
    
    m.react('✅')
    
    await m.reply(
        `✅ *ꜰᴜɴᴄɪóɴ ᴅᴇꜱʙʟᴏǫᴜᴇᴀᴅᴀ*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ 🎁 ꜰᴜɴᴄɪóɴ: *${feature.name}*\n` +
        `┃ 💵 ᴘʀᴇᴄɪᴏ: *-${formatNumber(PRICE_PER_FEATURE)}* Belly\n` +
        `┃ 💰 sᴀʟᴅᴏ: *${formatNumber(newBelly)}*\n` +
        `╰┈┈⬡\n\n` +
        `> _${feature.desc}_\n\n` +
        `> 💡 Consejo: ¡Sé *Premium* para desbloquear TODO!`
    )
}

export { pluginConfig as config, handler, PREMIUM_FEATURES }