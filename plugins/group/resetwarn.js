import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'resetwarn',
    alias: ['clearwarn', 'hapuswarn', 'delwarn'],
    category: 'group',
    description: 'Restablecer advertencias de un miembro',
    usage: '.resetwarn @user',
    example: '.resetwarn @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    
    let targetUser = null
    if (m.quoted) {
        targetUser = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetUser = m.mentionedJid[0]
    }
    
    if (!targetUser) {
        await m.reply(
            `⚠️ *ᴄÓᴍᴏ ᴜsᴀʀ*\n\n` +
            `> Responde al mensaje del usuario + \`${m.prefix}resetwarn\`\n` +
            `> O: \`${m.prefix}resetwarn @user\`\n\n` +
            `_¡No tenemos miedo! Pero las segundas oportunidades son importantes._`
        )
        return
    }
    
    let groupData = db.getGroup(m.chat) || {}
    let warnings = groupData.warnings || {}
    const maxWarns = groupData.maxWarnings || 3
    
    const targetName = targetUser.split('@')[0]
    
    if (!warnings[targetUser] || warnings[targetUser].length === 0) {
        await m.reply(`✅ @${targetName} no tiene advertencias.`, { mentions: [targetUser] })
        return
    }
    
    const prevCount = warnings[targetUser].length
    delete warnings[targetUser]
    db.setGroup(m.chat, { ...groupData, warnings: warnings })
    
    await m.reply(
        `✅ *ᴀᴅᴠᴇʀᴛᴇɴᴄɪᴀs ʀᴇsᴛᴀʙʟᴇᴄɪᴅᴀs*\n` +
        `¡Las advertencias de @${targetName} se restablecieron!\n` +
        `Antes: *${prevCount}/${maxWarns}*\n` +
        `Ahora: *0/${maxWarns}*\n\n` +
        `_¡Shishishi! ¡Todos merecen una segunda oportunidad!_`,
        { mentions: [targetUser] }
    )
}

export { pluginConfig as config, handler }