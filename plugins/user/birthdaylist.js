import { getDatabase } from '../../src/lib/luffy-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'birthdaylist',
    alias: ['bdaylist', 'listultah', 'ultahlist'],
    category: 'user',
    description: 'Ver lista de cumpleaños de los miembros',
    usage: '.birthdaylist',
    example: '.birthdaylist',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const groupMeta = m.groupMetadata
    const participants = groupMeta.participants.map(p => p.id)
    
    const birthdays = []
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentDay = now.getDate()
    
    for (const jid of participants) {
        const user = db.getUser(jid)
        if (user?.birthday) {
            const [day, month] = user.birthday.split('-').map(Number)
            birthdays.push({
                jid,
                day,
                month,
                name: user.name || jid.split('@')[0]
            })
        }
    }
    
    if (birthdays.length === 0) {
        return m.reply(
            `❌ *ꜱɪɴ ᴅᴀᴛᴏs*\n\n` +
            `> Aún no hay miembros que hayan configurado su cumpleaños\n\n` +
            `> Usa: .setbirthday DD-MM`
        )
    }
    
    birthdays.sort((a, b) => {
        const aNext = a.month > currentMonth || (a.month === currentMonth && a.day >= currentDay)
        const bNext = b.month > currentMonth || (b.month === currentMonth && b.day >= currentDay)
        
        if (aNext && !bNext) return -1
        if (!aNext && bNext) return 1
        
        if (a.month !== b.month) return a.month - b.month
        return a.day - b.day
    })
    
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    
    let text = `╭━━━━━━━━━━━━━━━━━╮\n`
    text += `┃  🎂 *ʟɪsᴛᴀ ᴄᴜᴍᴘʟᴇᴀÑᴏs*\n`
    text += `╰━━━━━━━━━━━━━━━━━╯\n\n`
    text += `╭┈┈⬡「 📋 *${birthdays.length} ᴍɪᴇᴍʙʀᴏs* 」\n`
    
    const mentions = []
    
    for (const b of birthdays.slice(0, 15)) {
        const isToday = b.day === currentDay && b.month === currentMonth
        const emoji = isToday ? '🎉' : '🎂'
        text += `┃ ${emoji} ${b.day} ${months[b.month - 1]} - @${b.jid.split('@')[0]}${isToday ? ' *¡HOY!*' : ''}\n`
        mentions.push(b.jid)
    }
    
    if (birthdays.length > 15) {
        text += `┃ ... y ${birthdays.length - 15} más\n`
    }
    
    text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    text += `> Configura tu cumpleaños: .setbirthday DD-MM`
    
    await m.reply(text, { mentions })
}

export { pluginConfig as config, handler }