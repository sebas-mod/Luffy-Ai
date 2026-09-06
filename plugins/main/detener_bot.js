import { stopJadibot, isJadibotActive, getJadibotStatus } from '../../src/lib/luffy-jadibot-manager.js'

const pluginConfig = {
    name: 'detener_bot',
    alias: ['berhentijadibot', 'stopbot', 'unjadibot', 'detenerjadibot', 'stopjadibot'],
    category: 'jadibot',
    description: 'Detener tu sesión jadibot',
    usage: '.detener_bot',
    example: '.detener_bot',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    carne: 0,
    isEnabled: true
}

function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
}

async function handler(m, { sock }) {
    const sender = m.sender
    if (!sender) return m.reply('❌ No se pudo identificar tu número')

    if (!isJadibotActive(sender)) {
        return m.reply(
            `❌ *ɴᴏ ᴇʀᴇs ᴜɴ ᴊᴀᴅɪʙᴏᴛ*\n\n` +
            `> Escribe \`${m.prefix}ser_bot\` para convertirte en bot`
        )
    }

    const status = getJadibotStatus(sender)
    const uptime = status ? formatUptime(Date.now() - status.startedAt) : '-'

    await m.react('🕕')

    try {
        await stopJadibot(sender, false)
        await m.react('✅')

        await m.reply(
            `🛑 *ᴊᴀᴅɪʙᴏᴛ ᴅᴇᴛᴇɴɪᴅᴏ*\n\n` +
            `> 📱 Número: *@${sender.split('@')[0]}*\n` +
            `> ⏱️ Uptime: *${uptime}*\n` +
            `> 💾 Sesión: *Guardada*\n\n` +
            `Escribe \`${m.prefix}ser_bot\` para reactivarlo.`,
            { mentions: [sender] }
        )
    } catch (e) {
        await m.react('☢')
        await m.reply(`❌ Error al detener el jadibot: ${e.message}`)
    }
}

export { pluginConfig as config, handler }
