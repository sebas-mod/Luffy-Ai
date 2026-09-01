import te from '../../src/lib/luffy-error.js'
import { getDatabase } from '../../src/lib/luffy-database.js'

const pluginConfig = {
    name: 'fantasmas',
    alias: ["fantasma", "ghosts", "inactivos", "quien_no_habla", "lurkers"],
    category: 'group',
    description: 'Detecta miembros en línea que no hablan en el grupo (fantasmas)',
    usage: '.fantasmas',
    example: '.fantasmas',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 60,
    carne: 1,
    isEnabled: true
}

// Días de inactividad para considerar a alguien "fantasma"
const GHOST_DAYS = 7
const GHOST_MS = GHOST_DAYS * 24 * 60 * 60 * 1000

async function handler(m, { sock }) {
    m.react('👻')
    
    try {
        const db = getDatabase()
        const groupMetadata = m.groupMetadata
        const participants = m.groupMembers
        
        if (participants.length === 0) {
            m.react('❌')
            return m.reply("☽◯☾ ╭━ ♰ ⚡ GRUPO ♰ ━╮ ☽◯☾\n┃ " + `❌ *ᴇʀʀᴏʀ*\n\n> No se pudieron obtener los datos de los miembros del grupo` + "\n╰━ ⊱༺༒༻⊰ ━╯")
        }
        
        await m.reply("☽◯☾ ╭━ ♰ ⚡ GRUPO ♰ ━╮ ☽◯☾\n" + `👻 *ᴄᴀᴢᴀɴᴅᴏ ꜰᴀɴᴛᴀsᴍᴀs...*\n\n> Escaneando ${participants.length} miembros\n> Detectando quiénes están en línea pero no hablan\n> Estimado: 5-10 segundos` + "\n╰━ ⊱༺༒༻⊰ ━╯")
        
        const presences = {}
        
        const presenceHandler = (update) => {
            if (update.id === m.chat && update.presences) {
                for (const [jid, presence] of Object.entries(update.presences)) {
                    if (presence.lastKnownPresence === 'available' || 
                        presence.lastKnownPresence === 'composing' || 
                        presence.lastKnownPresence === 'recording') {
                        presences[jid] = presence.lastKnownPresence
                    }
                }
            }
        }
        
        sock.ev.on('presence.update', presenceHandler)
        
        const batchSize = 10
        for (let i = 0; i < participants.length; i += batchSize) {
            const batch = participants.slice(i, i + batchSize)
            await Promise.all(batch.map(p => 
                sock.presenceSubscribe(p.id).catch(() => {})
            ))
            await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000))
        
        sock.ev.off('presence.update', presenceHandler)
        
        // Recuperar estadísticas de chat del grupo (lastChat por miembro)
        const group = db.getGroup(m.chat) || {}
        const chatStats = group.chatStats || {}
        const now = Date.now()
        
        const onlineMembers = Object.keys(presences)
        
        // Filtrar fantasmas: en línea ahora pero con lastChat antiguo o sin registro
        const ghosts = onlineMembers.filter(jid => {
            const stats = chatStats[jid]
            if (!stats || !stats.lastChat) return true
            return (now - stats.lastChat) > GHOST_MS
        })
        
        const mentions = ghosts
        
        let text = `👻 *ᴄᴀᴢᴀ ᴅᴇ ꜰᴀɴᴛᴀsᴍᴀs*\n\n`
        text += `☽◯☾ ♰ 「 📋 *ɪɴꜰᴏ ɢʀᴜᴘᴏ* 」\n`
        text += `┃ 👥 ɴᴀᴍʙʀᴇ: *${groupMetadata.subject}*\n`
        text += `┃ 👤 ᴛᴏᴛᴀʟ: \`${participants.length}\` miembros\n`
        text += `┃ 🟢 ᴇɴ ʟíɴᴇᴀ: \`${onlineMembers.length}\` miembros\n`
        text += `┃ 👻 ꜰᴀɴᴛᴀsᴍᴀs: \`${ghosts.length}\` miembros\n`
        text += `╰━ ⊱༺༒༻⊰ ━╯\n\n`
        
        if (ghosts.length === 0) {
            text += `> _🎉 ¡No se detectaron fantasmas en este momento!_\n`
            text += `> _Todos los que están en línea han hablado hace menos de ${GHOST_DAYS} días_`
        } else {
            text += `☽◯☾ ♰ 「 👻 *ꜰᴀɴᴛᴀsᴍᴀs ᴅᴇᴛᴇᴄᴛᴀᴅᴏs* 」\n`
            text += `┃ _En línea pero sin hablar hace +${GHOST_DAYS} días_\n\n`
            
            let count = 0
            for (const jid of ghosts) {
                if (count >= 50) {
                    text += `┃ ... y ${ghosts.length - 50} fantasmas más\n`
                    break
                }
                const number = jid.split('@')[0]
                const stats = chatStats[jid]
                const lastDays = stats?.lastChat ? Math.floor((now - stats.lastChat) / (24*60*60*1000)) : null
                const lastTxt = lastDays === null ? 'nunca' : (lastDays === 0 ? 'hoy' : `${lastDays} días`)
                
                let statusIcon = '👻'
                if (presences[jid] === 'composing') statusIcon = '⌨️👻'
                if (presences[jid] === 'recording') statusIcon = '🎤👻'
                
                text += `┃ ${statusIcon} @${number} — *${lastTxt}* sin hablar\n`
                count++
            }
            
            text += `╰━ ⊱༺༒༻⊰ ━╯\n\n`
            text += `> 👻 En línea pero callado | ⌨️ Escribiendo | 🎤 Grabando audio`
        }
        
        m.react('✅')
        await m.reply(text, { mentions: mentions })
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }