import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'resetear_enlace_grupo',
    alias: ['resetlink', 'revokelink', 'newlink'],
    category: 'group',
    description: 'Restablecer el enlace de invitación del grupo',
    usage: '.resetlinkgc',
    example: '.resetlinkgc',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 60,
    carne: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock }) {
    m.react('🔄')
    
    try {
        await sock.groupRevokeInvite(m.chat)
        
        m.react('✅')
        m.reply(`✅ *ʟɪɴᴋ ᴅᴇʟ ɢʀᴜᴘᴏ ʀᴇsᴛᴀʙʟᴇᴄɪᴅᴏ*\nEl enlace anterior del grupo ya no es válido.\nUsa \`${m.prefix}enlace_grupo\` para obtener el nuevo enlace.`)
        
    } catch (err) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }