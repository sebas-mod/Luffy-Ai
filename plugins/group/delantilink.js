import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'delantilink',
    alias: ['delalink', 'delblocklink', 'remantilink'],
    category: 'group',
    description: 'Eliminar enlace de la lista de antilink',
    usage: '.delantilink <domain/pattern>',
    example: '.delantilink tiktok.com',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    const link = m.args.join(' ')?.trim()?.toLowerCase()
    
    if (!link) {
        const groupData = db.getGroup(m.chat) || {}
        const antilinkList = groupData.antilinkList || []
        
        if (antilinkList.length === 0) {
            return m.reply(`📋 ¡La lista de antilink está vacía!`)
        }
        
        let txt = `🔗 *ʟɪsᴛᴀ ᴀɴᴛɪʟɪɴᴋ*\n\n`
        antilinkList.forEach((l, i) => {
            txt += `> ${i + 1}. \`${l}\`\n`
        })
        txt += `\n> Total: *${antilinkList.length}* link`
        txt += `\n\n\`${m.prefix}delantilink <dominio>\` para eliminar`
        
        return m.reply(txt)
    }
    
    const groupData = db.getGroup(m.chat) || {}
    const antilinkList = groupData.antilinkList || []
    
    const index = antilinkList.findIndex(l => l === link)
    
    if (index === -1) {
        return m.reply(`⚠️ El enlace \`${link}\` no fue encontrado en la lista de antilink!`)
    }
    
    antilinkList.splice(index, 1)
    db.setGroup(m.chat, { antilinkList })
    
    m.reply(
        `✅ *ᴀɴᴛɪʟɪɴᴋ ᴇʟɪᴍɪɴᴀᴅᴏ*\n\n` +
        `> Enlace: \`${link}\`\n` +
        `> Restante: *${antilinkList.length}* enlaces`
    )
}

export { pluginConfig as config, handler }