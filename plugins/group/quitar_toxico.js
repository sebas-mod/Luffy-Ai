import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'quitar_toxico',
    alias: ["remtoxic", "removetoxic"],
    category: 'group',
    description: 'Eliminar una palabra tóxica de la lista',
    usage: '.quitar_toxico <palabra>',
    example: '.quitar_toxico grosería',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 3,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const word = m.args.join(' ').trim().toLowerCase()
    
    if (!word) {
        return m.reply(
            `🗑️ *ᴅᴇʟ ᴛᴏxɪᴄ*\n\n` +
            `> Uso: \`.deltoxic <palabra>\`\n\n` +
            `\`Ejemplo: ${m.prefix}quitar_toxico grosería\``
        )
    }
    
    const groupData = db.getGroup(m.chat) || {}
    const toxicWords = groupData.toxicWords || []
    
    const index = toxicWords.indexOf(word)
    
    if (index === -1) {
        return m.reply("☽◯☾ ╭ ♰ 🛡️ PROTECCIÓN ♰ ━╮ ☽◯☾\n"+`❌ *ᴇʀʀᴏʀ*\n\n> La palabra \`${word}\` no está en la lista`+"\n╰━ ⊱༺༒༻⊰ ━╯")
    }
    
    toxicWords.splice(index, 1)
    db.setGroup(m.chat, { toxicWords })
    
    m.react('✅')
    
    await m.reply(
        `✅ *ᴘᴀʟᴀʙʀᴀ ᴛᴏxɪᴄᴀ ᴇʟɪᴍɪɴᴀᴅᴀ*\n\n` +
        `☽◯☾ ♰ 「 📋 *ᴅᴇᴛᴀʟʟᴇ* 」\n` +
        `┃ 📝 ᴘᴀʟᴀʙʀᴀ: \`${word}\`\n` +
        `┃ 📊 ʀᴇsᴛᴀɴᴛᴇs: \`${toxicWords.length}\` palabras\n` +
        `╰━ ⊱༺༒༻⊰ ━╯`
    )
}

export { pluginConfig as config, handler }