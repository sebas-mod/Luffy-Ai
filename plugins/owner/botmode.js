import config from '../../config.js'
import { getDatabase } from '../../src/lib/luffy-database.js'

const pluginConfig = {
    name: 'botmode',
    alias: ["modo_bot", "mode"],
    category: 'owner',
    description: 'Configurar el modo del bot (md/store/all)',
    usage: '.botmode <mode>',
    example: '.botmode store',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
}

const VALID_MODES = ['md', 'store', 'otp', 'all']

const MODE_DESCRIPTIONS = {
    md: 'Modo por defecto, todas las funciones excepto store/otp',
    store: 'Modo tienda manual, main + group + sticker + owner + store',
    otp: 'Modo servicio OTP, main + group + sticker + owner + otp',
    all: 'Modo completo, TODAS las funciones de todos los modos'
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    
    let mode = (args[0] || '').toLowerCase()
    const flags = args.slice(1).map(f => f.toLowerCase())
    const globalMode = db.setting('botMode') || 'all'
    const groupData = m.isGroup ? (db.getGroup(m.chat) || {}) : {}
    const groupMode = groupData.botMode || null
    
    if (!mode) {
        let txt = `☽◯☾ ♰ 「 🤖 *ʙᴏᴛ ᴍᴏᴅᴇ* 」\n`
        txt += `┃ ㊗ ɢʟᴏʙᴀʟ: *${globalMode.toUpperCase()}*\n`
        
        if (m.isGroup) {
            txt += `┃ ㊗ ɢʀᴜᴘ: *${(groupMode || 'INHERIT').toUpperCase()}*\n`
        }
        txt += `╰━ ⊱༺༒༻⊰ ━╯\n\n`
        
        txt += `☽◯☾ ♰ 「 📋 *ᴀᴠᴀɪʟᴀʙʟᴇ ᴍᴏᴅᴇs* 」\n`
        
        const currentMode = m.isGroup ? (groupMode || globalMode) : globalMode
        
        for (const [key, desc] of Object.entries(MODE_DESCRIPTIONS)) {
            const isActive = key === currentMode ? ' ✅' : ''
            txt += `┃ ㊗ *${key.toUpperCase()}*${isActive}\n`
            txt += `┃   ${desc}\n`
        }
        txt += `╰━ ⊱༺༒༻⊰ ━╯\n\n`
        
        txt += `*ᴄᴏᴍᴀɴᴅᴏs:*\n`
        txt += `> \`${m.prefix}botmode store\` - Pedido manual\n`
        txt += `> \`${m.prefix}botmode md\` → Modo por defecto\n`
        txt += `> \`${m.prefix}botmode all\` → Todas las funciones`
        
        await m.reply(txt)
        return
    }

    if (!VALID_MODES.includes(mode)) {
        return m.reply(
            `☽◯☾ ╭ ♰ ⚙️ SISTEMA ♰ ━╮ ☽◯☾\n` +
            `┃ ❌ *ᴍᴏᴅᴏ ɴᴏ ᴠáʟɪᴅᴏ*\n` +
            `╰━━━━━━━━╯\n\n` +
            `☽◯☾ ♰ Modos disponibles: \`${VALID_MODES.join(', ')}\``
        )
    }

    if (m.isGroup) {
        const newGroupData = {
            ...groupData,
            botMode: mode
        }

        if (mode === 'store') {
            newGroupData.storeConfig = {
                ...(groupData.storeConfig || {}),
                products: groupData.storeConfig?.products || []
            }
        }

        db.setGroup(m.chat, newGroupData)
    } else {
        db.setting('botMode', mode)
    }

    db.save()
    await m.react('✅')

    let extraInfo = ''
    if (mode === 'store' && m.isGroup) {
        extraInfo = `\n\n📋 *Modo manual*\n> El admin debe confirmar el pedido manual`
    }

    await m.reply(
        `☽◯☾ ╭━ ♰ ✦ ÉXITO ♰ ━╮ ☽◯☾\n` +
        `┃ ✅ *ᴍᴏᴅᴏ ᴄᴀᴍʙɪᴀᴅᴏ*\n` +
        `╰━ ⊱༺༒༻⊰ ━╯\n\n` +
        `› Mode: *${mode.toUpperCase()}*\n` +
        `› ${MODE_DESCRIPTIONS[mode]}\n` +
        extraInfo +
        `\n\n` +
        (m.isGroup ? `› _El modo de este grupo también cambió._` : `› _El modo global cambió._`)
    )

    console.log(`[BotMode] Changed to ${mode.toUpperCase()} by ${m.pushName} (${m.sender})`)
}

export { pluginConfig as config, handler, VALID_MODES, MODE_DESCRIPTIONS }