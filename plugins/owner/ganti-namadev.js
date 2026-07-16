import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'ganti-nombredev',
    alias: ['setnombredev', 'setnamedev', 'gantideveloper'],
    category: 'owner',
    description: 'Cambia el nombre del desarrollador en config.js',
    usage: '.ganti-nombredev <nombre nuevo>',
    example: '.ganti-nombredev Lucky Archz',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock, config }) {
    const newName = m.args.join(' ')
    
    if (!newName) {
        return m.reply(`👨‍💻 *ɢᴀɴᴛɪ ɴᴀᴍᴀ ᴅᴇᴠᴇʟᴏᴘᴇʀ*\n\n> Nombre actualmente: *${config.bot?.developer || '-'}*\n\n*Uso:*\n\`${m.prefix}ganti-nombredev <nombre nuevo>\``)
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
        
        m.reply(`✅ *ʙᴇʀʜᴀsɪʟ*\n\n> Nombre del desarrollador cambiado a: *${newName}*`)
        
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
