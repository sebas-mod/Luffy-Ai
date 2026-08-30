import { startJadibot, isJadibotActive } from '../../src/lib/luffy-jadibot-manager.js'

const pluginConfig = {
    name: 'ser_bot',
    alias: ['jadibotqr', 'becomebot', 'bot'],
    category: 'main',
    description: 'Convierte tu número en bot (Código de emparejamiento / QR)',
    usage: '.ser_bot atau .ser_bot qr',
    example: '.ser_bot',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const sender = m.sender
    if (!sender) return m.reply('❌ No se pudo identificar tu número')

    if (isJadibotActive(sender)) {
        return m.reply(
            `⚠️ *ᴊᴀᴅɪʙᴏᴛ ʏᴀ ᴇsᴛá ᴀᴄᴛɪᴠᴏ*\n\n` +
            `> Tu número ya es un bot\n` +
            `> Escribe \`${m.prefix}detener_bot\` para detenerlo`
        )
    }

    const arg = (m.args?.[0] || '').toLowerCase()
    const useQR = arg === 'qr'

    if (useQR) {
        await m.reply(
            `🤖 *ᴊᴀᴅɪʙᴏᴛ — ᴍᴏᴅᴏ Qʀ*\n\n` +
            `> Preparando conexión...\n` +
            `> Escanea el QR Code que se enviará`
        )
    } else {
        await m.reply(
            `🤖 *ᴊᴀᴅɪʙᴏᴛ — ᴄóᴅɪɢᴏ ᴅᴇ ᴇᴍᴘᴀʀᴇᴊᴀᴍɪᴇɴᴛᴏ*\n\n` +
            `> Preparando conexión...`
        )
    }

    try {
        await startJadibot(sock, m, sender, !useQR)
    } catch (e) {
        await m.reply(
            `❌ *ᴊᴀᴅɪʙᴏᴛ ꜰᴀʟʟᴏ*\n\n` +
            `> ${e.message || 'Ocurrió un error'}\n\n` +
            `Inténtalo de nuevo en unos minutos.`
        )
    }
}

export { pluginConfig as config, handler }
