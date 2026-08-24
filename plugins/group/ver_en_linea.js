import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'ver_en_linea',
    alias: ["checkonline", "online", "quien_en_linea", "whosonline"],
    category: 'group',
    description: 'Ver qué miembros están en línea en el grupo',
    usage: '.cekonline',
    example: '.cekonline',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 60,
    carne: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    m.react('🔍')
    
    try {
        const groupMetadata = m.groupMetadata
        const participants = m.groupMembers
        
        if (participants.length === 0) {
            m.react('❌')
            return m.reply("╭━━━〔 ⚡ GRUPO 〕━━━╮\n┃ "+`❌ *ᴇʀʀᴏʀ*\n\n> No se pudieron obtener los datos de los miembros del grupo`+"\n╰━━━━━━━━━━━━╯")
        }
        
        await m.reply("╭━━━〔 ⚡ GRUPO 〕━━━╮\n"+`🔍 *ʙᴜsᴄᴀɴᴅᴏ ᴍɪᴇᴍʙʀᴏs ᴇɴ ʟíɴᴇᴀ...*\n\n> Esperando respuesta de ${participants.length} miembros\n> Estimado: 5-10 segundos`+"\n╰━━━━━━━━━━━━╯")
        
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
        
        const onlineMembers = Object.keys(presences)
        const mentions = onlineMembers
        
        let text = `📊 *ᴄᴇᴋ ᴏɴʟɪɴᴇ*\n\n`
        text += `╭┈┈⬡「 📋 *ɪɴꜰᴏ ɢʀᴜᴘᴏ* 」\n`
        text += `┃ 👥 ɴᴀᴍʙʀᴇ: *${groupMetadata.subject}*\n`
        text += `┃ 👤 ᴛᴏᴛᴀʟ: \`${participants.length}\` miembros\n`
        text += `┃ 🟢 ᴇɴ ʟíɴᴇᴀ: \`${onlineMembers.length}\` miembros\n`
        text += `╰┈┈⬡\n\n`
        
        if (onlineMembers.length === 0) {
            text += `> _No se detectaron miembros en línea_\n`
            text += `> _Asegúrate de que los miembros hayan abierto WhatsApp_`
        } else {
            text += `╭┈┈⬡「 🟢 *ᴍɪᴇᴍʙʀᴏs ᴇɴ ʟíɴᴇᴀ* 」\n`
            
            let count = 0
            for (const jid of onlineMembers) {
                if (count >= 50) {
                    text += `┃ ... y ${onlineMembers.length - 50} miembros más\n`
                    break
                }
                const number = jid.split('@')[0]
                const participant = participants.find(p => p.id === jid)
                const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin'
                const adminBadge = isAdmin ? ' 👑' : ''
                
                let statusIcon = '🟢'
                if (presences[jid] === 'composing') statusIcon = '⌨️'
                if (presences[jid] === 'recording') statusIcon = '🎤'
                
                text += `┃ ${statusIcon} @${number}${adminBadge}\n`
                count++
            }
            
            text += `╰┈┈⬡\n\n`
            text += `> 🟢 En línea | ⌨️ Escribiendo | 🎤 Grabando audio`
        }
        
        m.react('✅')
        await m.reply(text, { mentions: mentions })
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }