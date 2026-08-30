import { getDatabase } from '../../src/lib/luffy-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'antienlace_grupo',
    alias: ['algc', 'antilinkgrup'],
    category: 'group',
    description: 'Anti enlaces de WhatsApp (grupos, canales, wa.me)',
    usage: '.antilinkgc <on/off/metode> [kick/remove]',
    example: '.antilinkgc on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}



function handler(m, { sock }) {
    const db = getDatabase()
    const option = m.text?.toLowerCase()?.trim()
    
    if (!option) {
        const groupData = db.getGroup(m.chat) || {}
        const status = groupData.antilinkgc || 'off'
        const mode = groupData.antilinkgcMode || 'remove'
        
        return m.reply(
            `🔗 *ᴀɴᴛɪʟɪɴᴋ ᴡᴀ*\n\n` +
            `☽◯☾ ♰ 「 📋 *ᴇsᴛᴀᴅᴏ* 」\n` +
            `┃ ◦ Estado: *${status.toUpperCase()}*\n` +
            `┃ ◦ Modo: *${mode.toUpperCase()}*\n` +
            `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
            `*ᴅᴇᴛᴇᴄᴄɪóɴ:*\n` +
            `> • chat.whatsapp.com (grupos)\n` +
            `> • wa.me (contactos)\n` +
            `> • whatsapp.com/channel (canales)\n\n` +
            `*ᴄóᴍᴏ ᴜsᴀʀ:*\n` +
            `> \`${m.prefix}antienlace_grupo on\` - Activar\n` +
            `> \`${m.prefix}antienlace_grupo off\` - Desactivar\n` +
            `> \`${m.prefix}antienlace_grupo metode kick\` - Modo expulsar usuario\n` +
            `> \`${m.prefix}antienlace_grupo metode remove\` - Modo eliminar mensaje`
        )
    }
    
    if (option === 'on') {
        db.setGroup(m.chat, { antilinkgc: 'on' })
        return m.reply("☽◯☾ ╭ ♰ 🛡️ PROTECCIÓN ♰ ━╮ ☽◯☾\n┃ "+`✅ *ᴀɴᴛɪʟɪɴᴋ ᴡᴀ* activado!\n\n> Los enlaces de WhatsApp se eliminarán automáticamente.`+"\n╰━ ⊱༺༒༻⊰ ━╯")
    }
    
    if (option === 'off') {
        db.setGroup(m.chat, { antilinkgc: 'off' })
        return m.reply(`❌ *ᴀɴᴛɪʟɪɴᴋ ᴡᴀ* desactivado!`)
    }
    
    if (option.startsWith('metode')) {
        const method = m.args?.[1]?.toLowerCase()
        if (method === 'kick') {
            db.setGroup(m.chat, { antilinkgc: 'on', antilinkgcMode: 'kick' })
            return m.reply("☽◯☾ ╭ ♰ 🛡️ PROTECCIÓN ♰ ━╮ ☽◯☾\n┃ "+`✅ *ᴀɴᴛɪʟɪɴᴋ ᴡᴀ* modo KICK activado!\n\n> El usuario que envíe un enlace de WhatsApp será expulsado.`+"\n╰━ ⊱༺༒༻⊰ ━╯")
        } else if (method === 'remove' || method === 'delete') {
            db.setGroup(m.chat, { antilinkgc: 'on', antilinkgcMode: 'remove' })
            return m.reply("☽◯☾ ╭ ♰ 🛡️ PROTECCIÓN ♰ ━╮ ☽◯☾\n┃ "+`✅ *ᴀɴᴛɪʟɪɴᴋ ᴡᴀ* modo DELETE activado!\n\n> El mensaje con enlace de WhatsApp será eliminado.`+"\n╰━ ⊱༺༒༻⊰ ━╯")
        } else {
            return m.reply("☽◯☾ ╭ ♰ 🛡️ PROTECCIÓN ♰ ━╮ ☽◯☾\n"+`❌ ¡Método no válido! Usa: \`kick\` o \`remove\`\n\n> Ejemplo: \`${m.prefix}antienlace_grupo metode kick\``+"\n╰━ ⊱༺༒༻⊰ ━╯")
        }
    }
    
    if (option === 'kick') {
        db.setGroup(m.chat, { antilinkgc: 'on', antilinkgcMode: 'kick' })
        return m.reply("☽◯☾ ╭ ♰ 🛡️ PROTECCIÓN ♰ ━╮ ☽◯☾\n┃ "+`✅ *ᴀɴᴛɪʟɪɴᴋ ᴡᴀ* modo KICK activado!\n\n> El usuario que envíe un enlace de WhatsApp será expulsado.`+"\n╰━ ⊱༺༒༻⊰ ━╯")
    }
    
    if (option === 'remove' || option === 'delete') {
        db.setGroup(m.chat, { antilinkgc: 'on', antilinkgcMode: 'remove' })
        return m.reply("☽◯☾ ╭ ♰ 🛡️ PROTECCIÓN ♰ ━╮ ☽◯☾\n┃ "+`✅ *ᴀɴᴛɪʟɪɴᴋ ᴡᴀ* modo DELETE activado!\n\n> El mensaje con enlace de WhatsApp será eliminado.`+"\n╰━ ⊱༺༒༻⊰ ━╯")
    }
    
    return m.reply("☽◯☾ ╭ ♰ 🛡️ PROTECCIÓN ♰ ━╮ ☽◯☾\n┃ "+`❌ ¡Opción no válida! Usa: \`on\`, \`off\`, \`metode kick\`, \`metode remove\``+"\n╰━ ⊱༺༒༻⊰ ━╯")
}

export { pluginConfig as config, handler }