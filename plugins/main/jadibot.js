import { startJadibot, isJadibotActive } from '../../src/lib/ourin-jadibot-manager.js'

const pluginConfig = {
    name: 'jadibot',
    alias: ['jadibotqr', 'becomebot', 'bot'],
    category: 'main',
    description: 'Convierte tu número en un bot (Código de Emparejamiento / QR)',
    usage: '.jadibot atau .jadibot qr',
    example: '.jadibot',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const sender = m.sender
    if (!sender) return m.reply('❌ No se pudo identificar tu número')

    if (isJadibotActive(sender)) {
        return m.reply(
            `⚠️ *ᴊᴀᴅɪʙᴏᴛ ʏᴀ ᴇsᴛᴀ ᴀᴄᴛɪᴠᴏ*\n\n` +
            `> Tu número ya es un bot\n` +
            `> Escribe \`${m.prefix}stopjadibot\` para detenerlo`
        )
    }

    const arg = (m.args?.[0] || '').toLowerCase()
    const useQR = arg === 'qr'

    if (useQR) {
        await m.reply(
            `🤖 *ᴊᴀᴅɪʙᴏᴛ — ᴍᴏᴅᴇ Qʀ*\n\n` +
            `> Preparando conexión...\n` +
            `> Escanea el código QR que se enviará`
        )
    } else {
        await m.reply(
            `🤖 *ᴊᴀᴅɪʙᴏᴛ — ᴄᴏᴅɪɢᴏ ᴅᴇ ᴇᴍᴘᴀʀᴇᴊᴀᴍɪᴇɴᴛᴏ*\n\n` +
            `> Preparando conexión...`
        )
    }

    try {
        await startJadibot(sock, m, sender, !useQR)
    } catch (e) {
        await m.reply(
            `❌ *ᴊᴀᴅɪʙᴏᴛ ꜰᴀʟʟᴏ*\n\n` +
            `> ${e.message || 'Ocurrió un error'}\n\n` +
            `Intenta de nuevo en unos minutos.`
        )
    }
}

export { pluginConfig as config, handler }
