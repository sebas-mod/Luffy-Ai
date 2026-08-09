import { getQuotedStickerHash, addStickerCommand, listStickerCommands } from '../../src/lib/luffy-sticker-command.js'
import { getPlugin } from '../../src/lib/luffy-plugins.js'
const pluginConfig = {
    name: 'addcmdsticker',
    alias: ['addstickercmd', 'setsticker', 'stickeradd'],
    category: 'group',
    description: 'Convertir un sticker en un acceso directo de comando',
    usage: '.addcmdsticker <comando> (responde un sticker)',
    example: '.addcmdsticker menu',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    cooldown: 10,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.args || []
    const commandName = args[0]
    
    // Validasi command name
    if (!commandName) {
        const existingCmds = listStickerCommands()
        
        let txt = `🖼️ *sᴛɪᴄᴋᴇʀ ᴘᴀʀᴀ ᴄᴏᴍᴀɴᴅᴏ*\n\n`
        txt += `> Responde un sticker y escribe el comando que quieres como acceso directo.\n\n`
        txt += `*Ejemplo:*\n`
        txt += `> Responde un sticker y escribe:\n`
        txt += `> \`.addcmdsticker menu\`\n\n`
        
        if (existingCmds.length > 0) {
            txt += `╭┈┈⬡「 📋 *ᴀᴄᴛɪᴠᴏs* 」\n`
            for (const cmd of existingCmds.slice(0, 10)) {
                txt += `┃ 🖼️ → \`${cmd.command}\`\n`
            }
            if (existingCmds.length > 10) {
                txt += `┃ ... y ${existingCmds.length - 10} más\n`
            }
            txt += `╰┈┈┈┈┈┈┈┈⬡`
        }
        
        return m.reply(txt)
    }
    
    // Validasi reply sticker
    if (!m.quoted) {
        return m.reply('⚠️ *Responde un sticker* que quieras convertir en comando!')
    }
    
    const stickerHash = getQuotedStickerHash(m)
    if (!stickerHash) {
        return m.reply('⚠️ El mensaje respondido no es un *sticker*!')
    }
    
    // Validasi command exists
    const cleanCmd = commandName.toLowerCase().replace(/^\./, '')
    const plugin = getPlugin(cleanCmd)
    
    if (!plugin) {
        return m.reply(
            `❌ El comando \`${cleanCmd}\` no se encontró!\n\n` +
            `> Asegúrate de que el comando que quieres como acceso directo sea válido.`
        )
    }
    
    // Add sticker command
    const success = addStickerCommand(stickerHash, cleanCmd, m.sender)
    
    if (success) {
        await m.react('✅')
        await m.reply(
            `✅ *ᴄᴏᴍᴀɴᴅᴏ ᴅᴇ sᴛɪᴄᴋᴇʀ ᴀɢʀᴇɢᴀᴅᴏ*\n\n` +
            `> 🖼️ Sticker → \`.${cleanCmd}\`\n\n` +
            `_¡Envía ese sticker para ejecutar el comando!_`
        )
    } else {
        await m.reply('❌ No se pudo guardar el comando de sticker!')
    }
}

export { pluginConfig as config, handler }