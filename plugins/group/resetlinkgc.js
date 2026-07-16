import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'resetlinkgc',
    alias: ['resetlink', 'revokelink', 'newlink'],
    category: 'group',
    description: 'Restablecer enlace de invitación del grupo',
    usage: '.resetlinkgc',
    example: '.resetlinkgc',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock }) {
    m.react('🔄')
    
    try {
        await sock.groupRevokeInvite(m.chat)
        
        m.react('✅')
        m.reply(`✅ *ᴇɴʟᴀᴄᴇ ᴅᴇʟ ɢʀᴜᴘᴏ ʀᴇsᴛᴀʙʟᴇᴄɪᴅᴏ*\nEl enlace anterior ya no es válido.\nUsa \`${m.prefix}linkgc\` para obtener uno nuevo.\n\n_¡Shishishi! ¡Un nuevo enlace, una nueva aventura!_`)
        
    } catch (err) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }