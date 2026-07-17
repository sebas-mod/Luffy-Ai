import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'ganti-nombrebot',
    alias: ['setnombrebot', 'setnamebot', 'gantibot'],
    category: 'owner',
    description: 'Cambia el nombre del bot en config.js',
    usage: '.ganti-nombrebot <nombre nuevo>',
    example: '.ganti-nombrebot Ourin MD',
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
        return m.reply(`🤖 *ᴄᴀᴍʙɪᴀʀ ɴᴏᴍʙʀᴇ ᴅᴇʟ ʙᴏᴛ*\n\n> Nombre actualmente: *${config.bot?.name || '-'}*\n\n*Uso:*\n\`${m.prefix}ganti-nombrebot <nombre nuevo>\``)
    }
    
    try {
        const configPath = path.join(process.cwd(), 'config.js')
        let configContent = fs.readFileSync(configPath, 'utf8')
        
        configContent = configContent.replace(
            /bot:\s*\{[\s\S]*?name:\s*['"]([^'"]*)['"]/,
            (match, oldName) => match.replace(`'${oldName}'`, `'${newName}'`).replace(`"${oldName}"`, `'${newName}'`)
        )
        
        fs.writeFileSync(configPath, configContent)
        
        config.bot.name = newName
        
        m.reply(`✅ *ᴇxɪᴛᴏ*\n\n> Nombre del bot cambiado a: *${newName}*`)
        
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
