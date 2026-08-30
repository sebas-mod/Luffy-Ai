import fs from 'fs'
import path from 'path'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'cambiar_nombre_bot',
    alias: ["configurar_nombre_bot"],
    category: 'owner',
    description: 'Cambiar el nombre del bot en config.js',
    usage: '.cambiar_nombre_bot <nombre nuevo>',
    example: '.cambiar_nombre_bot Luffy MD',
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
        return m.reply(`👑•─────•👑\n🤖 *ᴄᴀᴍʙɪᴀʀ ɴᴏᴍʙʀᴇ ᴅᴇʟ ʙᴏᴛ*\n\n> Nombre actual: *${config.bot?.name || '-'}*\n\n*Uso:*\n\`${m.prefix}cambiar_nombre_bot <nombre nuevo>\`\n♰ ──────── ♱✦`)
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
        
        m.reply(`👑•─────•👑\n✅ *ᴇxɪᴛᴏsᴏ*\n\n> Nombre del bot cambiado a: *${newName}*\n♰ ──────── ♱✦`)
        
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }