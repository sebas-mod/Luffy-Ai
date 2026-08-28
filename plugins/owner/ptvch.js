import config from '../../config.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'ptvch',
    alias: ['ptvchanel', 'ptvstory'],
    category: 'owner',
    description: 'Enviar video como PTV al canal',
    usage: '.ptvch (responder video)',
    example: '.ptvch',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let video = null
    
    if (m.quoted && m.quoted.isVideo) {
        try {
            video = await m.quoted.download()
        } catch (e) {
            return m.reply(`╰┈➤ ❌ Fallo al descargar el video citado.`)
        }
    } else if (m.isVideo) {
        try {
            video = await m.download()
        } catch (e) {
            return m.reply(`╰┈➤ ❌ Fallo al descargar el video.`)
        }
    }
    
    if (!video) {
        return m.reply(
            `⚠️ *ᴄᴏ́ᴍᴏ ᴜsᴀʀʟᴏ*\n\n` +
            `> Envía un *video* o *responde a un video* y escribe:\n` +
            `> \`${m.prefix}ptvch\``
        )
    }
    
    const channelId = config.saluran?.canalId || '120363404849776664@newsletter'
    
    await m.reply(`🕕 *ᴇɴᴠɪᴀɴᴅᴏ ᴘᴛᴠ ᴀʟ ᴄᴀɴᴀʟ...*`)
    
    try {
        await sock.sendMessage(channelId, {
            video: video,
            mimetype: 'video/mp4',
            gifPlayback: true,
            ptv: true
        })
        
        await m.react('✅')
        return m.reply(`✅ *ᴇxɪᴛᴏsᴏ*\n\n╭━〔 ✦ ÉXITO 〕━╮\n┃ Video enviado al canal como PTV 📺\n╰━━━━━━━━╯`)
        
    } catch (err) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }