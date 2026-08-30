import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'ptv',
    alias: ['pvideo', 'circlevideo'],
    category: 'tools',
    description: 'Envía el video como PTV (video en círculo)',
    usage: '.ptv (responde un video)',
    example: '.ptv',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    let video = null
    
    if (m.quoted && m.quoted.isVideo) {
        try {
            video = await m.quoted.download()
        } catch (e) {
            return m.reply(`☽◯☾ ♰ ❌ No se pudo descargar el video citado.`)
        }
    } else if (m.isVideo) {
        try {
            video = await m.download()
        } catch (e) {
            return m.reply(`☽◯☾ ♰ ❌ No se pudo descargar el video.`)
        }
    }
    
    if (!video) {
        return m.reply(
            `☽◯☾ ╭━ ♰ ⚠️ ᴄᴏᴍᴏ ᴜsᴀʀ ♰ ━╮ ☽◯☾\n\n` +
            `> Envía un *video* o *responde un video* y escribe:\n` +
            `> \`${m.prefix}ptv\`\n\n╰━ ⊱༺༒༻⊰ ━╯`
        )
    }
    
    await m.reply(`☽◯☾ ♰ 🕕 *ᴄʀᴇᴀɴᴅᴏ ᴘᴛᴠ...*`)
    
    try {
        await sock.sendMessage(m.chat, {
            video: video,
            mimetype: 'video/mp4',
            gifPlayback: true,
            ptv: true
        }, { quoted: m })
        
        m.react('✅')
        
    } catch (err) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
