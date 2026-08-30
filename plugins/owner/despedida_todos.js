import { getDatabase } from '../../src/lib/luffy-database.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'despedida_todos',
    alias: ['gball', 'globalgoodbye', 'leaveall'],
    category: 'owner',
    description: 'Activar/desactivar el goodbye en todos los grupos',
    usage: '.despedida_todos <on/off>',
    example: '.despedida_todos on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    
    if (!action || !['on', 'off'].includes(action)) {
        return m.reply(
            `👋 *ᴅᴇsᴘᴇᴅɪᴅᴀ ɢʟᴏʙᴀʟ*\n\n` +
            `> Activa/desactiva la despedida en TODOS los grupos a la vez\n\n` +
            `☽◯☾ ♰ 「 📋 *ᴄóᴍᴏ ᴜsᴀʀ* 」\n` +
            `┃ ${m.prefix}despedida_todos on\n` +
            `┃ ${m.prefix}despedida_todos off\n` +
            `╰━ ⊱༺༒༻⊰ ━╯`
        )
    }
    
    await m.react('🕕')
    
    try {
        const groups = await sock.groupFetchAllParticipating()
        const groupIds = Object.keys(groups)
        const status = action === 'on'
        let count = 0
        
        for (const groupId of groupIds) {
            db.setGroup(groupId, { leave: status })
            count++
        }
        
        await m.react('✅')
        
        if (status) {
            return m.reply(
                `✅ *ᴅᴇsᴘᴇᴅɪᴅᴀ ɢʟᴏʙᴀʟ ᴏɴ*\n\n` +
                `☽◯☾ ♰ 「 📊 *ʀᴇsᴜʟᴛᴀᴅᴏ* 」\n` +
                `┃ 🌐 Total Grupos: *${count}*\n` +
                `┃ ✅ Despedida: *ACTIVA*\n` +
                `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
                `> A los miembros que salgan se les enviará un mensaje de despedida!`
            )
        } else {
            return m.reply(
                `❌ *ᴅᴇsᴘᴇᴅɪᴅᴀ ɢʟᴏʙᴀʟ ᴏꜰꜰ*\n\n` +
                `☽◯☾ ♰ 「 📊 *ʀᴇsᴜʟᴛᴀᴅᴏ* 」\n` +
                `┃ 🌐 Total Grupos: *${count}*\n` +
                `┃ ❌ Despedida: *DESACTIVADA*\n` +
                `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
                `> La despedida se desactivó en todos los grupos.`
            )
        }
    } catch (error) {
        console.error('[GoodbyeAll] Error:', error.message)
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }