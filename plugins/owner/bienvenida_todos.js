import { getDatabase } from '../../src/lib/luffy-database.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'bienvenida_todos',
    alias: ['wcall', 'globalwelcome'],
    category: 'owner',
    description: 'Activar/desactivar el welcome en todos los grupos',
    usage: '.welcomeall <on/off>',
    example: '.welcomeall on',
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
            `👋 *ᴡᴇʟᴄᴏᴍᴇ ɢʟᴏʙᴀʟ*\n\n` +
            `> Activa/desactiva el welcome en TODOS los grupos a la vez\n\n` +
            `☽◯☾ ♰ 「 📋 *ᴄᴏ́ᴍᴏ ᴜsᴀʀʟᴏ* 」\n` +
            `┃ ${m.prefix}bienvenida_todos on\n` +
            `┃ ${m.prefix}bienvenida_todos off\n` +
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
            db.setGroup(groupId, { welcome: status })
            count++
        }
        
        await m.react('✅')
        
        if (status) {
            return m.reply(
                `✅ *ᴡᴇʟᴄᴏᴍᴇ ɢʟᴏʙᴀʟ ᴏɴ*\n\n` +
                `☽◯☾ ♰ 「 📊 *ʀᴇsᴜʟᴛᴀᴅᴏ* 」\n` +
                `┃ 🌐 Total de Grupos: *${count}*\n` +
                `┃ ✅ Welcome: *ACTIVO*\n` +
                `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
                `> ¡Todos los miembros nuevos serán recibidos automáticamente!`
            )
        } else {
            return m.reply(
                `❌ *ᴡᴇʟᴄᴏᴍᴇ ɢʟᴏʙᴀʟ ᴏꜰꜰ*\n\n` +
                `☽◯☾ ♰ 「 📊 *ʀᴇsᴜʟᴛᴀᴅᴏ* 」\n` +
                `┃ 🌐 Total de Grupos: *${count}*\n` +
                `┃ ❌ Welcome: *INACTIVO*\n` +
                `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
                `> El welcome se desactivó en todos los grupos.`
            )
        }
    } catch (error) {
        console.error('[WelcomeAll] Error:', error.message)
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }