import { stopJadibot, getAllJadibotSessions } from '../../src/lib/luffy-jadibot-manager.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'detener_eliminar_bot',
    alias: ["deletejadibot", "removejadibot", "quitar_bot"],
    category: 'owner',
    description: 'Detener y eliminar la sesión jadibot del usuario permanentemente',
    usage: '.stopdandeletejadibot @user',
    example: '.stopdandeletejadibot @628xxx',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let target = null

    if (m.quoted) {
        target = m.quoted.sender
    } else if (m.mentionedJid?.[0]) {
        target = m.mentionedJid[0]
    } else if (m.text?.trim()) {
        const num = m.text.trim().replace(/[^0-9]/g, '')
        if (num) target = num + '@s.whatsapp.net'
    }

    if (!target) {
        const sessions = getAllJadibotSessions()

        if (sessions.length === 0) {
            return m.reply(`❌ No hay sesiones jadibot guardadas`)
        }

        let txt = `🗑️ *sᴛᴏᴘ & ᴇʟɪᴍɪɴᴀʀ ᴊᴀᴅɪʙᴏᴛ*\n\n`
        txt += `Elige el objetivo con mention o reply:\n\n`

        sessions.forEach((s, i) => {
            const status = s.isActive ? '🟢' : '⚫'
            txt += `${status} *${i + 1}.* @${s.id}\n`
        })

        txt += `\n> Ejemplo: \`${m.prefix}detener_eliminar_bot @628xxx\``

        return sock.sendMessage(m.chat, {
            text: txt,
            mentions: sessions.map(s => s.jid)
        }, { quoted: m })
    }

    const id = target.replace(/@.+/g, '')
    const sessions = getAllJadibotSessions()
    const session = sessions.find(s => s.id === id)

    if (!session) {
        return m.reply(`❌ No se encontró la sesión jadibot de *@${id}*`, { mentions: [target] })
    }

    await m.react('🕕')

    try {
        await stopJadibot(target, true)

        await m.react('✅')

        await sock.sendMessage(m.chat, {
            text: `🗑️ *ᴊᴀᴅɪʙᴏᴛ ᴇʟɪᴍɪɴᴀᴅᴏ*\n\n` +
                `> 📱 Número: *@${id}*\n` +
                `> 🗑️ Estado: *Eliminado*\n\n` +
                `La sesión se eliminó permanentemente.\n` +
                `El usuario necesita usar \`.jadibot\` de nuevo para crear una sesión nueva.`,
            mentions: [target]
        }, { quoted: m })
    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }