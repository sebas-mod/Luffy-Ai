import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'addtoxic',
    alias: ['tambahtoxic', 'addkata'],
    category: 'group',
    description: 'Agrega palabras tóxicas a la lista',
    usage: '.addtoxic <kata>',
    example: '.addtoxic palabra_ofensiva',
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
            `📝 *ᴀɢʀᴇɢᴀʀ ᴛóxɪᴄᴏ*\n\n` +
            `> Usa: \`.addtoxic <palabra>\`\n\n` +
            `\`Ejemplo: ${m.prefix}addtoxic palabravulgar\``
        )
    }
    
    if (word.length < 2) {
        return m.reply(`❌ *ꜰᴀʟʟᴀ*\n\n> Palabra muy corta (mín. 2 letras)`)
    }
    
    if (word.length > 30) {
        return m.reply(`❌ *ꜰᴀʟʟᴀ*\n\n> Palabra muy larga (máx. 30 letras)`)
    }
    
    const groupData = db.getGroup(m.chat) || {}
    const toxicWords = groupData.toxicWords || []
    
    if (toxicWords.includes(word)) {
        return m.reply(`❌ *ꜰᴀʟʟᴀ*\n\n> La palabra \`${word}\` ya está en la lista`)
    }
    
    toxicWords.push(word)
    db.setGroup(m.chat, { toxicWords })
    
    m.react('✅')
    
    await m.reply(
        `✅ *ᴘᴀʟᴀʙʀᴀ ᴛóxɪᴄᴀ ᴀɢʀᴇɢᴀᴅᴀ*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇs* 」\n` +
        `┃ 📝 ᴘᴀʟᴀʙʀᴀ: \`${word}\`\n` +
        `┃ 📊 ᴛᴏᴛᴀʟ: \`${toxicWords.length}\` palabras\n` +
        `╰┈┈⬡`
    )
}

export { pluginConfig as config, handler }