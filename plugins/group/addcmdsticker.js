import { getQuotedStickerHash, addStickerCommand, listStickerCommands } from '../../src/lib/ourin-sticker-command.js'
import { getPlugin } from '../../src/lib/ourin-plugins.js'
const pluginConfig = {
    name: 'addcmdsticker',
    alias: ['addstickercmd', 'setsticker', 'stickeradd'],
    category: 'group',
    description: 'Convierte un sticker en un atajo de comando',
    usage: '.addcmdsticker <command> (reply sticker)',
    example: '.addcmdsticker menu',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.args || []
    const commandName = args[0]
    
    // Validasi command name
    if (!commandName) {
        const existingCmds = listStickerCommands()
        
        let txt = `🖼️ *sᴛɪᴄᴋᴇʀ ᴀ ᴄᴏᴍᴀɴᴅᴏ*\n\n`
        txt += `> Responde a un sticker + escribe el comando que quieres como atajo.\n\n`
        txt += `*Ejemplo:*\n`
        txt += `> Responde a un sticker, luego escribe:\n`
        txt += `> \`.addcmdsticker menu\`\n\n`
        
        if (existingCmds.length > 0) {
            txt += `╭┈┈⬡「 📋 *ᴀᴋᴛɪꜰ* 」\n`
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
        return m.reply('⚠️ *¡Responde a un sticker* que quieras como comando!')
    }
    
    const stickerHash = getQuotedStickerHash(m)
    if (!stickerHash) {
        return m.reply('⚠️ El mensaje que respondiste no es un *sticker*!')
    }
    
    // Validasi command exists
    const cleanCmd = commandName.toLowerCase().replace(/^\./, '')
    const plugin = getPlugin(cleanCmd)
    
    if (!plugin) {
        return m.reply(
            `❌ ¡El comando \`${cleanCmd}\` no fue encontrado!\n\n` +
            `> Asegúrate de que el comando que quieres como atajo sea válido.`
        )
    }
    
    // Add sticker command
    const success = addStickerCommand(stickerHash, cleanCmd, m.sender)
    
    if (success) {
        await m.react('✅')
        await m.reply(
            `✅ *sᴛɪᴄᴋᴇʀ ᴄᴏᴍᴀɴᴅᴏ ᴀɢʀᴇɢᴀᴅᴏ*\n\n` +
            `> 🖼️ Sticker → \`.${cleanCmd}\`\n\n` +
            `_¡Envía ese sticker para ejecutar el comando!_`
        )
    } else {
        await m.reply('❌ ¡Error al guardar el sticker comando!')
    }
}

export { pluginConfig as config, handler }