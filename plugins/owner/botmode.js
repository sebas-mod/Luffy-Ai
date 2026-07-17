import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'botmode',
    alias: ['setmode', 'mode'],
    category: 'owner',
    description: 'Configura el modo del bot (md/cpanel/store/pushcontacto/all)',
    usage: '.botmode <mode>',
    example: '.botmode store',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

const VALID_MODES = ['md', 'cpanel', 'store', 'pushcontacto', 'otp', 'all']

const MODE_DESCRIPTIONS = {
    md: 'Mode default, todos fesor acuali panel/store/pushcontacto',
    cpanel: 'Mode panel, main + group + sticar + owner + tools + panel',
    store: 'Mode store manual, main + group + sticar + owner + store',
    pushkontak: 'Mode pushcontacto, main + group + sticar + owner + pushcontacto',
    otp: 'Mode OTP service, main + group + sticar + owner + otp',
    all: 'Mode full, TODAS las funciones de todos los modos pueden accederse'
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
        let txt = `╭┈┈⬡「 🤖 *ʙᴏᴛ ᴍᴏᴅᴇ* 」\n`
        txt += `┃ ㊗ ɢʟᴏʙᴀʟ: *${globalMode.toUpperCase()}*\n`
        
        if (m.isGroup) {
            txt += `┃ ㊗ ɢʀᴜᴘ: *${(groupMode || 'INHERIT').toUpperCase()}*\n`
        }
        txt += `╰┈┈⬡\n\n`
        
        txt += `╭┈┈⬡「 📋 *ᴀᴠᴀɪʟᴀʙʟᴇ ᴍᴏᴅᴇs* 」\n`
        
        const currentMode = m.isGroup ? (groupMode || globalMode) : globalMode
        
        for (const [key, desc] of Object.entries(MODE_DESCRIPTIONS)) {
            const isActive = key === currentMode ? ' ✅' : ''
            txt += `┃ ㊗ *${key.toUpperCase()}*${isActive}\n`
            txt += `┃   ${desc}\n`
        }
        txt += `╰┈┈⬡\n\n`
        
        txt += `*ꜰʟᴀɢ sᴛᴏʀᴇ:*\n`
        txt += `> \`${m.prefix}botmode store\` - Manual order\n`
        txt += `> \`${m.prefix}botmode md\` → Mode default\n`
        txt += `> \`${m.prefix}botmode all\` → Todos fesor`
        
        await m.reply(txt)
        return
    }

    if (!VALID_MODES.includes(mode)) {
        return m.reply(
            `❌ *MODO NO VÁLIDO*\n\n` +
            `> Modos disponibles: \`${VALID_MODES.join(', ')}\``
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
        extraInfo = `\n\n📋 *Manual mode*\n> El admin necesita confirmar el orden manual`
    }

    await m.reply(
        `✅ *ᴍᴏᴅᴇ ᴅɪᴜʙᴀʜ*\n\n` +
        `> Mode: *${mode.toUpperCase()}*\n` +
        `> ${MODE_DESCRIPTIONS[mode]}\n` +
        extraInfo +
        `\n\n` +
        (m.isGroup ? `> _El modo de este grupo también fue cambiado._` : `> _El modo global fue cambiado._`)
    )

    console.log(`[BotMode] Changed to ${mode.toUpperCase()} by ${m.pushName} (${m.sender})`)
}

export { pluginConfig as config, handler, VALID_MODES, MODE_DESCRIPTIONS }
