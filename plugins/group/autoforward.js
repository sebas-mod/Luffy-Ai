import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'autoforward',
    alias: ['autofw', 'autofwd'],
    category: 'group',
    description: 'Reenvía automáticamente los mensajes que llegan a este grupo',
    usage: '.autoforward <on/off>',
    example: '.autoforward on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const db = getDatabase()
    const option = m.text?.toLowerCase()?.trim()
    const groupId = m.chat
    const group = db.getGroup(groupId) || {}
    
    if (!option) {
        const status = group.autoforward ? '✅ ON' : '❌ OFF'
        return m.reply(
            `🔄 *ᴀᴜᴛᴏ ꜰᴏʀᴡᴀʀᴅ*\n\n` +
            `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n` +
            `┃ ◦ Estado: *${status}*\n` +
            `╰┈┈⬡\n\n` +
            `> Usa: \`${m.prefix}autoforward on/off\`\n\n` +
            `_Esta función reenviará todos los mensajes a este grupo_`
        )
    }
    
    if (option === 'on') {
        db.setGroup(groupId, { ...group, autoforward: true })
        m.react('✅')
        return m.reply(
            `🔄 *ᴀᴜᴛᴏ ꜰᴏʀᴡᴀʀᴅ*\n\n` +
            `╭┈┈⬡「 ✅ *ᴀᴄᴛɪᴠᴏ* 」\n` +
            `┃ ◦ Estado: *ON*\n` +
            `╰┈┈⬡\n\n` +
            `> _Todos los mensajes serán reenviados_`
        )
    }
    
    if (option === 'off') {
        db.setGroup(groupId, { ...group, autoforward: false })
        m.react('❌')
        return m.reply(
            `🔄 *ᴀᴜᴛᴏ ꜰᴏʀᴡᴀʀᴅ*\n\n` +
            `╭┈┈⬡「 ❌ *ɪɴᴀᴄᴛɪᴠᴏ* 」\n` +
            `┃ ◦ Estado: *OFF*\n` +
            `╰┈┈⬡`
        )
    }
    
    return m.reply(`❌ Usa: on o off`)
}

export { pluginConfig as config, handler }