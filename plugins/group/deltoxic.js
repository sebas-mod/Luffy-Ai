import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'deltoxic',
    alias: ['hapustoxic', 'remtoxic', 'removetoxic'],
    category: 'group',
    description: 'Eliminar palabra tóxica de la lista',
    usage: '.deltoxic <kata>',
    example: '.deltoxic palabra_ofensiva',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const word = m.args.join(' ').trim().toLowerCase()
    
    if (!word) {
        return m.reply(
            `🗑️ *ᴇʟɪᴍɪɴᴀʀ ᴛóxɪᴄᴏ*\n\n` +
            `> Usa: \`.deltoxic <palabra>\`\n\n` +
            `\`Ejemplo: ${m.prefix}deltoxic palabra_ofensiva\``
        )
    }
    
    const groupData = db.getGroup(m.chat) || {}
    const toxicWords = groupData.toxicWords || []
    
    const index = toxicWords.indexOf(word)
    
    if (index === -1) {
        return m.reply(`❌ *ғᴀʟʟᴏ*\n\n> La palabra \`${word}\` no está en la lista`)
    }
    
    toxicWords.splice(index, 1)
    db.setGroup(m.chat, { toxicWords })
    
    m.react('✅')
    
    await m.reply(
        `✅ *ᴘᴀʟᴀʙʀᴀ ᴛóxɪᴄᴀ ᴇʟɪᴍɪɴᴀᴅᴀ*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇ* 」\n` +
        `┃ 📝 ᴘᴀʟᴀʙʀᴀ: \`${word}\`\n` +
        `┃ 📊 sᴏʙʀᴀɴᴛᴇ: \`${toxicWords.length}\` palabras\n` +
        `╰┈┈⬡`
    )
}

export { pluginConfig as config, handler }