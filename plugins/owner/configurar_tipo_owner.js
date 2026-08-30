import config from '../../config.js'
import { getDatabase } from '../../src/lib/luffy-database.js'
import fs from 'fs'
import path from 'path'
const pluginConfig = {
    name: 'configurar_tipo_owner',
    alias: ['ownertype', 'ownervariant', 'ownerstyle'],
    category: 'owner',
    description: 'Configurar la variante de visualización del mensaje del owner',
    usage: '.configurar_tipo_owner',
    example: '.configurar_tipo_owner',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
}

const VARIANTS = {
    1: { name: 'Current Design', desc: 'Visualización predeterminada actual' },
    2: { name: 'Multiple Contact', desc: 'Enviar tarjeta de contacto de todos los owners' }
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const variant = args[0]?.toLowerCase()
    const current = db.setting('ownerType') || 1

    if (variant && /^v?[1-3]$/.test(variant)) {
        const id = parseInt(variant.replace('v', ''))
        db.setting('ownerType', id)
        await db.save()

        await m.reply(
            `☽◯☾ ╭━ ♰ ✦ ÉXITO ♰ ━╮ ☽◯☾\n` +
            `┃ ✅ Tipo de owner cambiado a *V${id}*\n` +
            `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
            `👑 *${VARIANTS[id].name}*\n` +
            `✦ _${VARIANTS[id].desc}_`
        )
        return
    }

    const buttons = []
    for (const [id, val] of Object.entries(VARIANTS)) {
        const mark = parseInt(id) === current ? ' ✓' : ''
        buttons.push({
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: `V${id}${mark} - ${val.name}`,
                id: `${m.prefix}configurar_tipo_owner v${id}`
            })
        })
    }

    await sock.sendMessage(m.chat, {
        text: `🎨 *sᴇᴛ ᴏᴡɴᴇʀ ᴛʏᴘᴇ*\n\n> Tipo actual: *V${current}*\n> _${VARIANTS[current].name}_\n\n> Elige la variante del owner:`,
        footer: config.bot?.name || 'Luffy-Ai',
        contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardingScore: 999
        },
        interactiveButtons: buttons
    }, { quoted: m })
}

export { pluginConfig as config, handler }