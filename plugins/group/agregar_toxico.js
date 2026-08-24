import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'agregar_toxico',
    alias: ["agregar_palabra"],
    category: 'group',
    description: 'Agregar una palabra tóxica a la lista',
    usage: '.addtoxic <palabra>',
    example: '.addtoxic palabra_grosera',
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
            `📝 *ᴀɢʀᴇɢᴀʀ ᴛᴏxɪᴄᴀ*\n\n` +
            `> Usa: \`.addtoxic <palabra>\`\n\n` +
            `\`Ejemplo: ${m.prefix}agregar_toxico palabra\``
        )
    }
    
    if (word.length < 2) {
        return m.reply("╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n┃ "+`❌ *ᴇʀʀᴏʀ*\n\n> La palabra es demasiado corta (mín 2 letras)`+"\n╰━━━━━━━━━━━━╯")
    }
    
    if (word.length > 30) {
        return m.reply("╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n┃ "+`❌ *ᴇʀʀᴏʀ*\n\n> La palabra es demasiado larga (máx 30 letras)`+"\n╰━━━━━━━━━━━━╯")
    }
    
    const groupData = db.getGroup(m.chat) || {}
    const toxicWords = groupData.toxicWords || []
    
    if (toxicWords.includes(word)) {
        return m.reply("╭━━〔 🛡️ PROTECCIÓN 〕━━╮\n"+`❌ *ᴇʀʀᴏʀ*\n\n> La palabra \`${word}\` ya está en la lista`+"\n╰━━━━━━━━━━━━╯")
    }
    
    toxicWords.push(word)
    db.setGroup(m.chat, { toxicWords })
    
    m.react('✅')
    
    await m.reply(
        `✅ *ᴘᴀʟᴀʙʀᴀ ᴛᴏxɪᴄᴀ ᴀɢʀᴇɢᴀᴅᴀ*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇ* 」\n` +
        `┃ 📝 ᴘᴀʟᴀʙʀᴀ: \`${word}\`\n` +
        `┃ 📊 ᴛᴏᴛᴀʟ: \`${toxicWords.length}\` palabras\n` +
        `╰┈┈⬡`
    )
}

export { pluginConfig as config, handler }