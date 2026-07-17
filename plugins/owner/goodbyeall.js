import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'goodbyeall',
    alias: ['gball', 'globalgoodbye', 'leaveall'],
    category: 'owner',
    description: 'Activa o desactiva la despedida en todos los grupos',
    usage: '.goodbyeall <on/off>',
    example: '.goodbyeall on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    
    if (!action || !['on', 'off'].includes(action)) {
        return m.reply(
            `👋 *ɢᴏᴏᴅʙʏᴇ ɢʟᴏʙᴀʟ*\n\n` +
            `> Activar/desactivar la despedida en TODOS los grupos a la vez\n\n` +
            `╭┈┈⬡「 📋 *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ* 」\n` +
            `┃ ${m.prefix}goodbyeall on\n` +
            `┃ ${m.prefix}goodbyeall off\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
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
                `✅ *ɢᴏᴏᴅʙʏᴇ ɢʟᴏʙᴀʟ ᴏɴ*\n\n` +
                `╭┈┈⬡「 📊 *ʀᴇsᴜʟᴛ* 」\n` +
                `┃ 🌐 Total Grup: *${count}*\n` +
                `┃ ✅ Goodbye: *ACTIVO*\n` +
                `╰┈┈┈┈┈┈┈┈⬡\n\n` +
                `> ¡Los miembros que se van recibirán un mensaje de despedida!`
            )
        } else {
            return m.reply(
                `❌ *ɢᴏᴏᴅʙʏᴇ ɢʟᴏʙᴀʟ ᴏꜰꜰ*\n\n` +
                `╭┈┈⬡「 📊 *ʀᴇsᴜʟᴛ* 」\n` +
                `┃ 🌐 Total Grup: *${count}*\n` +
                `┃ ❌ Goodbye: *INACTIVO*\n` +
                `╰┈┈┈┈┈┈┈┈⬡\n\n` +
                `> La despedida ha sido desactivada en todos los grupos.`
            )
        }
    } catch (error) {
        console.error('[GoodbyeAll] Error:', error.message)
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
