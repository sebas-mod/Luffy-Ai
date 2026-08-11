import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'botmode',
    alias: ["modo_bot", "mode"],
    category: 'group',
    description: 'Configurar el modo del bot para este grupo',
    usage: '.botmode <md/store/otp/all>',
    example: '.botmode store',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

const MODES = {
    md: {
        name: 'Multi-Device',
        desc: 'Modo por defecto con todas las funciones estándar',
        allowedCategories: null,
        excludeCategories: ['store']
    },
    all: {
        name: 'All Features',
        desc: 'Se pueden usar todas las funciones de todos los modos',
        allowedCategories: null,
        excludeCategories: null
    },
    store: {
        name: 'Store/Tienda',
        desc: 'Modo especial para tienda manual',
        allowedCategories: ['main', 'group', 'sticker', 'owner', 'store'],
        excludeCategories: null
    },
    otp: {
        name: 'OTP Service',
        desc: 'Modo de servicio OTP automático',
        allowedCategories: ['main', 'group', 'sticker', 'owner', 'otp'],
        excludeCategories: null
    }
}

function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    let mode = (args[0] || '').toLowerCase()
    const flags = args.slice(1).map(f => f.toLowerCase())

    const groupData = db.getGroup(m.chat) || {}
    const currentMode = groupData.botMode || 'all'

    if (!mode) {
        let modeList = ''
        for (const [key, val] of Object.entries(MODES)) {
            const isCurrent = key === currentMode ? ' ⬅️' : ''
            modeList += `┃ \`${m.prefix}botmode ${key}\`${isCurrent}\n`
            modeList += `┃ └ ${val.desc}\n`
        }

        return m.reply(
            `🔧 *ʙᴏᴛ ᴍᴏᴅᴇ*\n\n` +
            `> Modo actual: *${currentMode.toUpperCase()}* (${MODES[currentMode]?.name || 'Unknown'})\n` +
            `\n╭─「 📋 *ᴏᴘᴄɪᴏɴᴇs* 」\n` +
            `${modeList}` +
            `╰───────────────\n\n` +
            `*ᴄᴏᴍᴀɴᴅᴏs:*\n` +
            `> \`${m.prefix}botmode store\` - Pedido manual\n\n` +
            `> _Configuración por grupo_`
        )
    }

    if (!Object.keys(MODES).includes(mode)) {
        return m.reply(`❌ Modo no válido. Opciones: \`${Object.keys(MODES).join(', ')}\``)
    }



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
    db.save()

    m.react('✅')

    let extraInfo = ''
    if (mode === 'store') {
        const products = newGroupData.storeConfig?.products || []
        extraInfo = `\n\n📋 *Manual mode*\n` +
            `> El admin debe confirmar el pedido manual\n` +
            `> Productos: \`${products.length}\` artículos\n\n` +
            `*ɢᴜíᴀ:*\n` +
            `> \`${m.prefix}addprod <código> <precio> <nombre>\`\n` +
            `> \`${m.prefix}listprod\` - Ver productos`
    }

    return m.reply(
        `✅ *ᴍᴏᴅᴏ ᴄᴀᴍʙɪᴀᴅᴏ*\n\n` +
        `> Mode: *${mode.toUpperCase()}* (${MODES[mode].name})\n` +
        `> Grup: *${m.chat.split('@')[0]}*\n` +
        extraInfo +
        `\n\n> Escribe \`${m.prefix}menu\` para ver el menú.`
    )
}

function getGroupMode(chatJid, db) {
    const globalMode = db.setting('botMode') || 'all'
    if (!chatJid?.endsWith('@g.us')) return globalMode
    const groupData = db.getGroup(chatJid) || {}
    return groupData.botMode || globalMode
}

function getModeCategories(mode) {
    const modeConfig = MODES[mode] || MODES.md
    return {
        allowed: modeConfig.allowedCategories,
        excluded: modeConfig.excludeCategories
    }
}

function filterCategoriesByMode(categories, mode) {
    const modeConfig = MODES[mode] || MODES.md

    if (modeConfig.allowedCategories) {
        return categories.filter(cat => modeConfig.allowedCategories.includes(cat.toLowerCase()))
    }

    if (modeConfig.excludeCategories) {
        return categories.filter(cat => !modeConfig.excludeCategories.includes(cat.toLowerCase()))
    }

    return categories
}

export { pluginConfig as config, handler, getGroupMode, getModeCategories, filterCategoriesByMode, MODES }