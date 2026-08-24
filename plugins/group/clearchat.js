import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: ['clearchat', 'cc', 'cleangc', 'deletechat', 'delchat'],
    alias: [],
    category: 'group',
    description: 'Limpiar el chat del grupo',
    usage: '.clearchat',
    example: '.clearchat',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 60,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    m.react('🗑️')
    
    try {
        const now = Math.floor(Date.now() / 1000)
        
        await sock.chatModify({ 
            delete: true, 
            lastMessages: [{ 
                key: m.key, 
                messageTimestamp: m.messageTimestamp || now
            }] 
        }, m.chat)
        
        await m.reply("╭━━━〔 ⚡ GRUPO 〕━━━╮\n"+`✅ *ᴄʜᴀᴛ ʟɪᴍᴘɪᴀᴅᴏ*\n\n> El chat del grupo fue limpiado por @${m.sender.split('@')[0]}`+"\n╰━━━━━━━━━━━━╯", { mentions: [m.sender] })
        
    } catch (error) {
        try {
            await sock.chatModify({ 
                clear: { 
                    messages: [{ 
                        id: m.key.id, 
                        fromMe: m.key.fromMe,
                        timestamp: Math.floor(Date.now() / 1000)
                    }] 
                } 
            }, m.chat)
            
            await m.reply("╭━━━〔 ⚡ GRUPO 〕━━━╮\n"+`✅ *ᴄʜᴀᴛ ʟɪᴍᴘɪᴀᴅᴏ*\n\nEl chat del grupo en el WA del bot fue limpiado por @${m.sender.split('@')[0]}\nRevísalo tú mismo en el WhatsApp del bot`+"\n╰━━━━━━━━━━━━╯", { mentions: [m.sender] })
        } catch (e) {
            m.react('☢')
            m.reply(te(m.prefix, m.command, m.pushName))
        }
    }
}

export { pluginConfig as config, handler }