import { getAllPlugins } from '../../src/lib/luffy-plugins.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'benefitpremium',
    alias: ['beneficiospremium', 'funcionespremium', 'beneficioprem'],
    category: 'main',
    description: 'Ver la explicación y lista de funciones exclusivas de Premium',
    usage: '.benefitpremium',
    isOwner: false,
    isGroup: false,
    isEnabled: true
}

async function handler(m, { sock }) {
    const plugins = getAllPlugins()
    const premiumCommands = plugins.filter(p => p.config.isPremium && p.config.isEnabled)
    
    const seen = new Set()
    const commandList = []
    for (const p of premiumCommands) {
        const names = Array.isArray(p.config.name) ? p.config.name : [p.config.name]
        for (const name of names) {
            if (!name || seen.has(name)) continue
            seen.add(name)
            commandList.push(`• *${config.command?.prefix || '.'}${name}*`)
        }
    }
    commandList.sort()
    
    const totalCommands = commandList.length
    const defaultCarne = config.carne?.default || 25
    const premiumCarne = config.carne?.premium || 100
    
    const message = 
        `⭐ *¿QUÉ ES PREMIUM?*\n\n` +
        `Premium es un *usuario de pago* que obtiene acceso a funciones exclusivas y mayores ventajas.\n\n` +
        `☽◯☾ ♰ 「 💎 *VENTAJAS PREMIUM* 」\n` +
        `┃ ✦ \`\`\`Carne diaria: ${premiumCarne}x (vs ${defaultCarne}x usuario normal)\`\`\`\n` +
        `┃ ✦ \`\`\`Cooldown más bajo\`\`\`\n` +
        `┃ ✦ \`\`\`Acceso a funciones exclusivas\`\`\`\n` +
        `┃ ✦ \`\`\`Prioridad de respuesta\`\`\`\n` +
        `┃ ✦ \`\`\`Sin marca de agua en algunas funciones\`\`\`\n` +
        `┃ ✦ \`\`\`Soporte prioritario\`\`\`\n` +
        `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
        `☽◯☾ ♰ 「 ⚙️ *CÓMO OBTENERLO* 」\n` +
        `┃ \`Premium se obtiene mediante:\`\n` +
        `┃ • Contacta al owner del bot\n` +
        `┃ • \`\`\`${config.command?.prefix || '.'}addprem <número> <duración>\`\`\`\n` +
        `┃ • Ejemplo: .addprem 628xxx 30d\n` +
        `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
        `☽◯☾ ♰ 「 📋 *LISTA DE COMANDOS PREMIUM* 」\n` +
        `┃ \`Total: ${totalCommands} comandos\`\n` +
        `┃\n` +
        (totalCommands > 0 
            ? commandList.map(cmd => `┃ ${cmd}`).join('\n')
            : `┃ Todos los comandos están disponibles para usuarios normales`) +
        `\n╰━ ⊱༺༒༻⊰ ━╯\n\n` +
        `¿Quieres actualizar? Contacta al capitán del bot\n${config.owner.number.map(num => `- wa.me/${num}`).join('\n') }`
    
    await m.reply(message)
}

export { pluginConfig as config, handler }
