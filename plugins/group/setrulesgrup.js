import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'setrulesgrup',
    alias: ['setgrouprules', 'setaturangrup'],
    category: 'group',
    description: 'Set rules/aturan grup custom (admin only)',
    usage: '.setrulesgrup <text>',
    example: '.setrulesgrup 1. No hagas spam\n2. Respeta a los demás',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    const text = m.text?.trim() || (m.quoted?.body || m.quoted?.text || '')

    if (!text) {
        return m.reply(
            `📝 *sᴇᴛ ɢʀᴜᴘ ʀᴜʟᴇs*\n\n` +
            `> Escribe el texto de las reglas nuevo\n\n` +
            `\`Ejemplo:\`\n` +
            `\`${m.prefix}setrulesgrup 1. No hagas spam
2. Respeta a los demás\``
        )
    }

    db.setGroup(m.chat, { groupRules: text })

    m.reply(
        `✅ *ʀᴇɢʟᴀs ᴀᴄᴛᴜᴀʟɪᴢᴀᴅᴀs*\n\n` +
        `¡Las reglas del grupo han sido actualizadas! 🏴‍☠️\n` +
        `Escribe \`${m.prefix}rulesgrup\` para verlas.`
    )
}

export { pluginConfig as config, handler }
