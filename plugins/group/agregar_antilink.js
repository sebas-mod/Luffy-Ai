import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'agregar_antilink',
    alias: ['addalink', 'addblocklink'],
    category: 'group',
    description: 'Agregar un enlace a la lista antilink',
    usage: '.addantilink <dominio/patrón>',
    example: '.addantilink tiktok.com',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    const link = m.text?.toLowerCase()
    
    if (!link) {
        return m.reply(
            `🔗 *ᴀɢʀᴇɢᴀʀ ᴀɴᴛɪʟɪɴᴋ*\n\n` +
            `> Ingresa el dominio/patrón del enlace que quieres bloquear\n\n` +
            `\`Ejemplo:\`\n` +
            `\`${m.prefix}agregar_antilink tiktok.com\`\n` +
            `\`${m.prefix}agregar_antilink chat.whatsapp.com\`\n` +
            `\`${m.prefix}agregar_antilink instagram.com\``
        )
    }
    
    const groupData = db.getGroup(m.chat) || {}
    const antilinkList = groupData.antilinkList || []
    
    if (antilinkList.includes(link)) {
        return m.reply(`⚠️ El enlace \`${link}\` ya está en la lista antilink!`)
    }
    
    antilinkList.push(link)
    db.setGroup(m.chat, { antilinkList })
    
    m.reply(
        `✅ *ᴀɴᴛɪʟɪɴᴋ ᴀɢʀᴇɢᴀᴅᴏ*\n\n` +
        `> Enlace: \`${link}\`\n` +
        `> Total: *${antilinkList.length}* enlaces\n\n` +
        `> Usa \`${m.prefix}lista_antilink\` para ver la lista`
    )
}

export { pluginConfig as config, handler }