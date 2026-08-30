import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'lista_antilink',
    alias: ["antilinklist", "ver_antilink"],
    category: 'group',
    description: 'Ver la lista de enlaces bloqueados',
    usage: '.lista_antilink',
    example: '.lista_antilink',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

const DEFAULT_BLOCKED_LINKS = [
    'chat.whatsapp.com',
    'wa.me',
    'bit.ly',
    't.me',
    'telegram.me',
    'discord.gg',
    'discord.com/invite'
]

function handler(m) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || {}
    const customList = groupData.antilinkList || []
    
    let txt = `🔗 *ʟɪsᴛᴀ ᴀɴᴛɪʟɪɴᴋ*\n\n`
    
    txt += `☽◯☾ ♰ 「 📌 *ᴘʀᴇᴅᴇᴛᴇʀᴍɪɴᴀᴅᴏs* 」\n`
    DEFAULT_BLOCKED_LINKS.forEach((l, i) => {
        txt += `┃ ${i + 1}. \`${l}\`\n`
    })
    txt += `╰━ ⊱༺༒༻⊰ ━╯\n\n`
    
    if (customList.length > 0) {
        txt += `☽◯☾ ♰ 「 ➕ *ᴄᴜsᴛᴏᴍ* 」\n`
        customList.forEach((l, i) => {
            txt += `┃ ${i + 1}. \`${l}\`\n`
        })
        txt += `╰━ ⊱༺༒༻⊰ ━╯\n\n`
    }
    
    txt += `> Predeterminados: *${DEFAULT_BLOCKED_LINKS.length}* enlaces\n`
    txt += `> Custom: *${customList.length}* enlaces\n\n`
    txt += `\`${m.prefix}agregar_antilink <enlace>\` para agregar\n`
    txt += `\`${m.prefix}quitar_antilink <enlace>\` para eliminar`
    
    m.reply(txt)
}

export { pluginConfig as config, handler, DEFAULT_BLOCKED_LINKS }