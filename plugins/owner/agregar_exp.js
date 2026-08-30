import { getDatabase } from '../../src/lib/luffy-database.js'
import * as levelHelper from '../../src/lib/luffy-level.js'
const pluginConfig = {
    name: 'agregar_exp',
    alias: ["giveexp", "addxp"],
    category: 'owner',
    description: 'Añadir exp a un usuario (máx 9 mil millones)',
    usage: '.agregar_exp <cantidad> @user',
    example: '.agregar_exp 10000 @user',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
}

const MAX_EXP = 9000000000

function formatNumber(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function extractTarget(m) {
    if (m.quoted) return m.quoted.sender
    if (m.mentionedJid?.length) return m.mentionedJid[0]
    return null
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args
    
    const numArg = args.find(a => !isNaN(a) && !a.startsWith('@'))
    let amount = parseInt(numArg) || 0
    
    let targetJid = await extractTarget(m)
    
    if (!targetJid && amount > 0) {
        targetJid = m.sender
    }
    
    if (!targetJid || amount <= 0) {
        return m.reply(
            `⭐ *ᴀɢʀᴇɢᴀʀ ᴇxᴘ*\n\n` +
            `> \`.addexp <cantidad>\` - a ti mismo\n` +
            `> \`.addexp <cantidad> @user\` - a un usuario\n` +
            `> Máx: 9.000.000.000 (9B)\n\n` +
            `\`Ejemplo: ${m.prefix}agregar_exp 10000\``
        )
    }
    
    if (amount <= 0) {
        return m.reply(`👑•─────•👑\n❌ *ᴇʀʀᴏʀ*\n\n> La cantidad de exp debe ser mayor a 0\n♰ ──────── ♱`)
    }
    
    if (amount > MAX_EXP) {
        amount = MAX_EXP
    }
    
    const user = db.getUser(targetJid) || db.setUser(targetJid)
 
    await levelHelper.addExpWithLevelCheck(sock, m, db, user, amount)
    
    await m.react('✅')
    
    await m.reply(
        `☽◯☾ ╭━ ♰ ✦ ÉXITO ♰ ━╮ ☽◯☾\n┃ ✅ Exitoso, se añadió *${formatNumber(amount)}* exp a *@${targetJid.split('@')[0]}*\n╰━ ⊱༺༒༻⊰ ━╯`,
        { mentions: [targetJid] }
    )
}

export { pluginConfig as config, handler }