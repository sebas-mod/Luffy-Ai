import { getDatabase } from '../../src/lib/luffy-database.js'
import config from '../../config.js'
import fs from 'fs'
import path from 'path'
const pluginConfig = {
    name: 'leaderboard',
    alias: [
        'lb', 'ranking', 'rank', 'topglobal',
        'topbalance', 'topbal', 'topberry', 'topcoin', 'topmoney',
        'toplimit', 'topexp', 'topxp', 'toplevel',
        'topcarne', 'topenergy'
    ],
    category: 'main',
    description: 'Ver el ranking global (berry, exp, carne)',
    usage: '.leaderboard',
    example: '.topberry',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    carne: 0,
    isEnabled: true
}

function formatNumber(num) {
    if (num >= 1000000000000) return (num / 1000000000000).toFixed(2) + 'T'
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']

async function handler(m, { sock }) {
    const db = getDatabase()
    const cmd = m.command.toLowerCase()
    const args = m.args || []
    
    let type = 'overview'
    
    if (cmd.includes('berry') || cmd.includes('bal') || cmd.includes('money')) {
        type = 'berry'
    } else if (cmd.includes('exp') || cmd.includes('xp') || cmd.includes('level')) {
        type = 'exp'
    } else if (cmd.includes('carne')) {
        type = 'carne'
    } else if (args[0]) {
        const argType = args[0].toLowerCase()
        if (['berry', 'bal', 'balance', 'money'].includes(argType)) type = 'berry'
        else if (['exp', 'xp', 'level'].includes(argType)) type = 'exp'
        else if (['carne'].includes(argType)) type = 'carne'
    }
    
    const dbData = db.data?.users || db.getAllUsers?.() || {}
    const users = []
    
    for (const [jid, userData] of Object.entries(dbData)) {
        if (!jid || jid === 'undefined') continue
        if (jid.length > 15 || jid.startsWith('120')) continue
        
        users.push({
            jid,
            berry: userData.berry || 0,
            exp: userData.rpg?.exp || userData.exp || 0,
            carne: userData.carne || 0,
            level: userData.rpg?.level || userData.level || 1,
            name: userData.name || jid.split('@')[0]
        })
    }
    
    if (users.length === 0) {
        return m.reply(`📊 *ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ*\n\n> Aún no hay datos de usuarios registrados en la base de datos.`)
    }
    
    const senderJid = m.sender.replace('@s.whatsapp.net', '')
    
    if (type === 'overview') {
        const totalUsers = users.length
        const maxBalUser = users.reduce((a, b) => a.berry > b.berry ? a : b, users[0])
        const maxExpUser = users.reduce((a, b) => a.exp > b.exp ? a : b, users[0])
        const maxCarneUser = users.reduce((a, b) => a.carne > b.carne ? a : b, users[0])
        
        const mentions = [
            maxBalUser.jid.includes('@') ? maxBalUser.jid : maxBalUser.jid + "@s.whatsapp.net",
            maxExpUser.jid.includes('@') ? maxExpUser.jid : maxExpUser.jid + "@s.whatsapp.net",
            maxCarneUser.jid.includes('@') ? maxCarneUser.jid : maxCarneUser.jid + "@s.whatsapp.net"
        ]
        
        const overviewText = `🏆 *LEADERBOARD GLOBAL* 🏆\n\n` +
            `_¡Elige un botón de abajo para ver el ranking!_`
            try {
                await sock.sendButton(m.chat, fs.readFileSync(path.join(process.cwd(), 'assets', 'images', 'luffy.jpg')), overviewText, m, {
                    buttons: [
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '💰 Top Berry',
                            id: `${m.prefix}topberry`
                        })
                    },
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '✨ Top EXP',
                            id: `${m.prefix}topexp`
                        })
                    },
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '⚡ Top Carne',
                            id: `${m.prefix}topcarne`
                        })
                    }
                ],
            })
            return
        } catch (e) {
            return m.reply(overviewText, { mentions })
        }
    }
    
    let title, emoji, field, formatValue
    
    if (type === 'berry') {
        title = 'TOP GLOBAL BERRY'
        emoji = '💰'
        field = 'berry'
        formatValue = (u) => `Rp ${formatNumber(u.berry)}`
    } else if (type === 'exp') {
        title = 'TOP GLOBAL LEVEL'
        emoji = '✨'
        field = 'exp'
        formatValue = (u) => `Lv. ${u.level} (${formatNumber(u.exp)} XP)`
    } else if (type === 'carne') {
        title = 'TOP GLOBAL CARNE'
        emoji = '⚡'
        field = 'carne'
        formatValue = (u) => `${formatNumber(u.carne)} Carne`
    }
    
    users.sort((a, b) => b[field] - a[field])
    
    const top10 = users.slice(0, 10)
    const totalField = users.reduce((sum, u) => sum + (u[field] || 0), 0)
    
    let text = `🏆 *${title}* 🏆\n\n`
    text += `Ranking de los más poderosos del momento!\n\n`
    text += `☽◯☾ ♰ 「 ${emoji} *RANKING* 」\n`
    
    const mentions = []
    
    top10.forEach((u, i) => {
        const medal = MEDALS[i] || `${i + 1}.`
        const pct = totalField > 0 ? ((u[field] / totalField) * 100).toFixed(1) : 0
        const isMe = u.jid === senderJid ? " *(You)*" : ""
        
        text += `┃ ${medal} @${u.jid.split('@')[0]}${isMe}\n`
        text += `┃    └ ${formatValue(u)} (${pct}%)\n`
        
        if (i < top10.length - 1) text += `┃\n`
        mentions.push(u.jid.includes('@') ? u.jid : u.jid + "@s.whatsapp.net")
    })
    
    text += `╰━ ⊱༺༒༻⊰ ━╯\n\n`
    
    const myRankIndex = users.findIndex(u => u.jid === senderJid)
    if (myRankIndex !== -1) {
        text += `> Tu posición: *#${myRankIndex + 1}* de *${formatNumber(users.length)}* usuarios.`
    } else {
        text += `> Aún no estás registrado en la base de datos.`
    }
    
    await m.reply(text, { mentions })
}

export { pluginConfig as config, handler }