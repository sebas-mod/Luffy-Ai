import config from '../../config.js'
import { getDatabase } from '../../src/lib/luffy-database.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'agregar_carne_todo',
    alias: ['bonuscarneall'],
    category: 'owner',
    description: 'Agregar carne a todos los miembros del grupo',
    usage: '.addcarneall <cantidad>',
    example: '.addcarneall 50',
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        const amount = parseInt(m.args[0])
        
        if (isNaN(amount) || amount <= 0) {
            return m.reply(`👑•─────•👑\n⚠️ *ᴄóᴍᴏ ᴜsᴀʀ*\n\n> Introduce la cantidad de carne que quieres añadir.\n\n\`Ejemplo: ${m.prefix}agregar_carne_todo 50\`\n♰ ──────── ♱`)
        }
        
        const groupMeta = m.groupMetadata
        const participants = groupMeta.participants || []
        
        if (participants.length === 0) {
            return m.reply(`👑•─────•👑\n❌ *ᴇʀʀᴏʀ*\n\n> No hay miembros en este grupo\n♰ ──────── ♱`)
        }
        
        await m.react('🕕')
        const db = getDatabase()
        let successCount = 0
        
        for (const participant of participants) {
            const number = participant.jid?.replace(/[^0-9]/g, '') || ''
            if (!number) continue
            const jid = number + '@s.whatsapp.net'
            db.updateCarne(jid, amount)
            successCount++
        }

        const gb = m?.groupMetadata
        
        await db.save()
        await m.react('⚡')
        await m.reply(
           `☽◯☾ ╭━ ♰ ✦ ÉXITO ♰ ━╮ ☽◯☾\n┃ ✅ Exitoso, se añadió limit a todos los miembros ( Total *${successCount}* Miembros ) en el grupo *${gb?.subject}*\n╰━ ⊱༺༒༻⊰ ━╯`,
            )
        
    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }