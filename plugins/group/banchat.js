import { getDatabase } from '../../src/lib/luffy-database.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'banchat',
    alias: ['bangroup', 'bangrup', 'unbanchat', 'unbangroup'],
    category: 'group',
    description: 'Prohibir a un grupo el uso del bot (solo el owner puede acceder)',
    usage: '.banchat',
    example: '.banchat',
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const cmd = m.command.toLowerCase()
    const isUnban = ['unbanchat', 'unbangroup'].includes(cmd)
    
    try {
        const groupMeta = m.groupMetadata
        const groupName = groupMeta.subject || 'Unknown'
        const groupData = db.getGroup(m.chat) || {}
        
        if (isUnban) {
            if (!groupData.isBanned) {
                return m.reply(
                    `⚠️ *ɢʀᴜᴘᴏ ɴᴏ ʙᴀɴᴇᴀᴅᴏ*\n\n` +
                    `> Este grupo no está en estado de baneado.\n` +
                    `> Todos los usuarios pueden usar el bot.`
                )
            }
            
            db.setGroup(m.chat, { ...groupData, isBanned: false })
            
            return sock.sendMessage(m.chat, {
                text: `✅ *ɢʀᴜᴘᴏ ᴅᴇsʙᴀɴᴇᴀᴅᴏ*\n\n` +
                    `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇ* 」\n` +
                    `┃ 📛 ɢʀᴜᴘᴏ: *${groupName}*\n` +
                    `┃ 📊 ᴇsᴛᴀᴅᴏ: *✅ ACTIVO*\n` +
                    `┃ 👤 ᴅᴇsʙᴀɴᴇᴀᴅᴏ ᴘᴏʀ: @${m.sender.split('@')[0]}\n` +
                    `╰┈┈⬡\n\n` +
                    `> Todos los miembros ahora pueden volver a usar el bot.`,
                mentions: [m.sender]
            }, { quoted: m })
        }
        
        if (groupData.isBanned) {
            return m.reply(
                `⚠️ *ɢʀᴜᴘᴏ ʏᴀ ʙᴀɴᴇᴀᴅᴏ*\n\n` +
                `> Este grupo ya está en estado de baneado.\n` +
                `> Usa \`.unbanchat\` para abrir el acceso.`
            )
        }
        
        db.setGroup(m.chat, { ...groupData, isBanned: true })
        
        await m.reply(`🚫 *ɢʀᴜᴘᴏ ʙᴀɴᴇᴀᴅᴏ*\n\n` +
                `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇ* 」\n` +
                `┃ 📛 ɢʀᴜᴘᴏ: *${groupName}*\n` +
                `┃ 📊 ᴇsᴛᴀᴅᴏ: *🔴 BANEADO*\n` +
                `┃ 👤 ʙᴀɴᴇᴀᴅᴏ ᴘᴏʀ: @${m.sender.split('@')[0]}\n` +
                `╰┈┈⬡\n\n` +
                `> Los miembros comunes no pueden usar el bot en este grupo.\n` +
                `> Solo el owner puede usar el bot.`, {  mentions: [m.sender] })
        
    } catch (error) {
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }