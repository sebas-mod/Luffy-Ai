import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'banchat',
    alias: ['bangroup', 'bangrup', 'unbanchat', 'unbangroup'],
    category: 'group',
    description: 'Banear grupo del uso del bot (solo el propietario puede acceder)',
    usage: '.banchat',
    example: '.banchat',
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
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
                    `⚠️ *ɢʀᴜᴘ ɴᴏ ʙᴀɴᴇᴀᴅᴏ*\n\n` +
                    `> Este grupo no está baneado.\n` +
                    `> Todos los usuarios pueden usar el bot.`
                )
            }
            
            db.setGroup(m.chat, { ...groupData, isBanned: false })
            
            return sock.sendMessage(m.chat, {
                text: `✅ *ɢʀᴜᴘ ᴅᴇsʙᴀɴᴇᴀᴅᴏ*\n\n` +
                    `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇ* 」\n` +
                    `┃ 📛 ɢʀᴜᴘ: *${groupName}*\n` +
                    `┃ 📊 sᴛᴀᴛᴜs: *✅ ACTIVO*\n` +
                    `┃ 👤 ᴜɴʙᴀɴ ᴘᴏʀ: @${m.sender.split('@')[0]}\n` +
                    `╰┈┈⬡\n\n` +
                    `> Todos los miembros ahora pueden usar el bot de nuevo.`,
                mentions: [m.sender]
            }, { quoted: m })
        }
        
        if (groupData.isBanned) {
            return m.reply(
                `⚠️ *ɢʀᴜᴘ ʏᴀ sᴜᴅᴀʜ ᴅɪʙᴀɴ*\n\n` +
                `> Este grupo ya está baneado.\n` +
                `> Usa \`.unbanchat\` para desbloquear el acceso.`
            )
        }
        
        db.setGroup(m.chat, { ...groupData, isBanned: true })
        
        await m.reply(`🚫 *ɢʀᴜᴘ ʙᴀɴᴇᴀᴅᴏ*\n\n` +
                `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇ* 」\n` +
                `┃ 📛 ɢʀᴜᴘ: *${groupName}*\n` +
                `┃ 📊 sᴛᴀᴛᴜs: *🔴 BANEADO*\n` +
                `┃ 👤 ʙᴀɴ ᴘᴏʀ: @${m.sender.split('@')[0]}\n` +
                `╰┈┈⬡\n\n` +
                `> Los miembros normales no pueden usar el bot en este grupo.\n` +
                `> Solo el propietario puede usar el bot.`, {  mentions: [m.sender] })
        
    } catch (error) {
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }