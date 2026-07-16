import { getAllPlugins } from '../../src/lib/ourin-plugins.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'benefitowner',
    alias: ['ownerbenefits', 'ownerfitur'],
    category: 'main',
    description: 'Ver explicación y lista de funciones especiales del Owner',
    usage: '.benefitowner',
    isOwner: false,
    isGroup: false,
    isEnabled: true
}

async function handler(m, { sock }) {
    const plugins = getAllPlugins()
    const ownerCommands = plugins.filter(p => p.config.isOwner && p.config.isEnabled)
    
    const seen = new Set()
    const commandList = []
    for (const p of ownerCommands) {
        const names = Array.isArray(p.config.name) ? p.config.name : [p.config.name]
        for (const name of names) {
            if (!name || seen.has(name)) continue
            seen.add(name)
            commandList.push(`• *${config.command?.prefix || '.'}${name}*`)
        }
    }
    commandList.sort()
    
    const totalCommands = commandList.length
    
    const message = 
        `👑 *ᴀᴘᴀ ᴇs ᴜɴ ᴏᴡɴᴇʀ?*\n\n` +
        `El Owner es el *propietario del bot* que tiene acceso completo a todas las funciones y control del sistema.\n\n` +
        `╭┈┈⬡「 🔐 *ᴘʀɪʟᴇɢɪᴏs ᴅᴇʟ ᴏᴡɴᴇʀ* 」\n` +
        `┃ ✦ \`\`\`Acceso a todos los comandos sin restricciones\`\`\`\n` +
        `┃ ✦ \`\`\`Límite ilimitado (-1)\`\`\`\n` +
        `┃ ✦ \`\`\`Ignorar todos los cooldowns\`\`\`\n` +
        `┃ ✦ \`\`\`Control total del sistema del bot\`\`\`\n` +
        `┃ ✦ \`\`\`Gestión de usuarios y grupos\`\`\`\n` +
        `┃ ✦ \`\`\`Acceso a panel y servidor\`\`\`\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `╭┈┈⬡「 ⚙️ *ᴄᴏᴍᴏ ꜰᴜɴᴄɪᴏɴᴀ* 」\n` +
        `┃ \`El Owner se agrega a través de:\`\n` +
        `┃ • \`\`\`${config.command?.prefix || '.'}addowner <número>\`\`\`\n` +
        `┃ • O directamente en config.js\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `╭┈┈⬡「 📋 *ʟɪsᴛᴀ ᴅᴇ ᴄᴏᴍᴀɴᴅᴏs ᴅᴇʟ ᴏᴡɴᴇʀ* 」\n` +
        `┃ \`Total: ${totalCommands} comandos\`\n` +
        `┃\n` +
        commandList.map(cmd => `┃ ${cmd}`).join('\n') +
        `\n╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `> ¡Contacta al owner para obtener acceso!`
    
    await m.reply(message)
}

export { pluginConfig as config, handler }