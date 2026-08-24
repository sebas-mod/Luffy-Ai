import fs from 'fs'
import path from 'path'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'cambiar_nombre_dev',
    alias: ["configurar_nombre_dev"],
    category: 'owner',
    description: 'Cambiar el nombre del developer en config.js',
    usage: '.cambiar_nombre_dev <nombre nuevo>',
    example: '.cambiar_nombre_dev Sebas-MD',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock, config }) {
    const newName = m.args.join(' ')
    
    if (!newName) {
        return m.reply(`👨‍💻 *ᴄᴀᴍʙɪᴀʀ ɴᴏᴍʙʀᴇ ᴅᴇʟ ᴅᴇᴠᴇʟᴏᴘᴇʀ*\n\n> Nombre actual: *${config.bot?.developer || '-'}*\n\n*Uso:*\n\`${m.prefix}cambiar_nombre_dev <nombre nuevo>\``)
    }
    
    try {
        const configPath = path.join(process.cwd(), 'config.js')
        let configContent = fs.readFileSync(configPath, 'utf8')
        
        configContent = configContent.replace(
            /developer:\s*['"]([^'"]*)['"]/,
            `developer: '${newName}'`
        )
        
        fs.writeFileSync(configPath, configContent)
        
        config.bot.developer = newName
        
        m.reply(`✅ *ᴇxɪᴛᴏsᴏ*\n\n> Nombre del developer cambiado a: *${newName}*`)
        
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }