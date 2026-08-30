import { getDatabase } from '../../src/lib/luffy-database.js'
import { DEFAULT_TOXIC_WORDS } from './antitoxico.js'
const pluginConfig = {
    name: 'lista_toxicos',
    alias: ["toxiclist", "palabra_toxica", "ver_palabra"],
    category: 'group',
    description: 'Ver la lista de palabras tóxicas',
    usage: '.listtoxic',
    example: '.listtoxic',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || {}
    
    const customWords = groupData.toxicWords || []
    const defaultWords = DEFAULT_TOXIC_WORDS || []
    
    let text = `📋 *ʟɪsᴛᴀ ᴅᴇ ᴘᴀʟᴀʙʀᴀs ᴛᴏxɪᴄᴀs*\n\n`
    
    if (customWords.length > 0) {
        text += `☽◯☾ ♰ 「 ✏️ *ᴄᴜsᴛᴏᴍ* (${customWords.length}) 」\n`
        for (let i = 0; i < customWords.length; i++) {
            text += `┃ ${i + 1}. ${customWords[i]}\n`
        }
        text += `╰━ ⊱༺༒༻⊰ ━╯\n\n`
    }
    
    text += `☽◯☾ ♰ 「 📦 *ᴘʀᴇᴅᴇᴛᴇʀᴍɪɴᴀᴅᴀs* (${defaultWords.length}) 」\n`
    
    for (let i = 0; i < defaultWords.length; i++) {
        text += `┃ ${i + 1}. ${defaultWords[i]}\n`
    }
    text += `╰━ ⊱༺༒༻⊰ ━╯\n\n`
    
    text += `Total: *${customWords.length + defaultWords.length}* palabras\n`
    text += `\`.addtoxic <palabra>\` para agregar\n`
    text += `\`.deltoxic <palabra>\` para eliminar`
    
    await m.reply(text)
}

export { pluginConfig as config, handler }