import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'resetear_advertencias',
    alias: ["clearwarn", "quitar_advertencias", "delwarn"],
    category: 'group',
    description: 'Restablecer las advertencias de un miembro',
    usage: '.resetwarn @user',
    example: '.resetwarn @user',
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
    
    let targetUser = null
    if (m.quoted) {
        targetUser = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetUser = m.mentionedJid[0]
    }
    
    if (!targetUser) {
        await m.reply(
            `⚠️ *ᴄóᴍᴏ ᴜsᴀʀʟᴏ*\n\n` +
            `> Responde el mensaje de un usuario + \`${m.prefix}resetear_advertencias\`\n` +
            `> O: \`${m.prefix}resetear_advertencias @user\``
        )
        return
    }
    
    let groupData = db.getGroup(m.chat) || {}
    let warnings = groupData.warnings || {}
    const maxWarns = groupData.maxWarnings || 3
    
    const targetName = targetUser.split('@')[0]
    
    if (!warnings[targetUser] || warnings[targetUser].length === 0) {
        await m.reply("☽◯☾ ╭━ ♰ 👑 ADMIN ♰ ━╮ ☽◯☾\n┃ "+`✅ @${targetName} no tiene advertencias.`+"\n╰━ ⊱༺༒༻⊰ ━╯", { mentions: [targetUser] })
        return
    }
    
    const prevCount = warnings[targetUser].length
    delete warnings[targetUser]
    db.setGroup(m.chat, { ...groupData, warnings: warnings })
    
    await m.reply(
        `✅ *ᴀᴅᴠᴇʀᴛᴇɴᴄɪᴀs ʀᴇsᴛᴀʙʟᴇᴄɪᴅᴀs*\n` +
        `Las advertencias de @${targetName} se restablecieron!\n` +
        `Antes: *${prevCount}/${maxWarns}*\n` +
        `Ahora: *0/${maxWarns}*`,
        { mentions: [targetUser] }
    )
}

export { pluginConfig as config, handler }