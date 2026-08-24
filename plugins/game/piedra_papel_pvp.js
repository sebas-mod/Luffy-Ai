import { getDatabase } from '../../src/lib/luffy-database.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'piedra_papel_pvp',
    alias: ['suit', 'rps', 'janken'],
    category: 'game',
    description: 'Juega al piedra, papel o tijera con otro jugador',
    usage: '.suit @tag',
    example: '.suit @628xxx',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    carne: 0,
    isEnabled: true
}

if (!global.suitGames) global.suitGames = {}

const TIMEOUT = 90000
const WIN_REWARD = 1000

const EMOJI = {
    batu: '✊',
    gunting: '✌️',
    kertas: '✋',
    piedra: '✊',
    tijera: '✌️',
    papel: '✋'
}

async function handler(m, { sock }) {
    const db = getDatabase()
    
    const existingRoom = Object.values(global.suitGames).find(
        room => [room.p, room.p2].includes(m.sender)
    )
    
    if (existingRoom) {
        return m.reply(
            `❌ ¡Aún estás en una partida de piedra, papel o tijera!\n\n` +
            `> Termina tu partida primero.`
        )
    }
    
    let target = null
    if (m.quoted) {
        target = m.quoted.sender
    } else if (m.mentionedJid?.[0]) {
        target = m.mentionedJid[0]
    }
    
    if (!target) {
        return m.reply(
            `✊✌️✋ *sᴜɪᴛ ᴘᴠᴘ*\n\n` +
            `> ¡Etiqueta a la persona a la que quieres retar!\n\n` +
            `*Ejemplo:*\n` +
            `> \`.suit @628xxx\``
        )
    }
    
    if (target === m.sender) {
        return m.reply('❌ ¡No puedes retarte a ti mismo!')
    }
    
    const targetInGame = Object.values(global.suitGames).find(
        room => [room.p, room.p2].includes(target)
    )
    
    if (targetInGame) {
        return m.reply('❌ ¡Esa persona ya está jugando piedra, papel o tijera con otra persona!')
    }
    
    const roomId = 'suit_' + Date.now()
    
    global.suitGames[roomId] = {
        id: roomId,
        chat: m.chat,
        p: m.sender,
        p2: target,
        status: 'waiting',
        pilih: null,
        pilih2: null,
        createdAt: Date.now(),
        timeout: setTimeout(() => {
            if (global.suitGames[roomId]) {
                sock.sendMessage(m.chat, {
                    text: `⏱️ *¡TIEMPO AGOTADO!*\n\n@${target.split('@')[0]} no respondió!\nLa partida fue cancelada.`,
                    mentions: [target]
                })
                delete global.suitGames[roomId]
            }
        }, TIMEOUT)
    }
    
    await m.react('✊')
    await m.reply(`⚔️ ──────────\nDesafías a @${target.split('@')[0]} a un duelo de piedra, papel o tijera\n\n` +
            `╭┈┈⬡「 💬 *ʀᴇsᴘᴜᴇsᴛᴀ* 」\n` +
            `┃ ✅ Escribe *acepto* / *gas* / *ok*\n` +
            `┃ ❌ Escribe *rechazo* / *no*\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `Tiempo: 90 segundos`, {  mentions: [target]})
}

async function answerHandler(m, sock) {
    if (!m.body) return false
    
    const text = m.body.trim().toLowerCase()
    const db = getDatabase()
    
    let room = null
    let roomId = null
    
    for (const [id, r] of Object.entries(global.suitGames)) {
        if (r.chat === m.chat && [r.p, r.p2].includes(m.sender)) {
            room = r
            roomId = id
            break
        }
        if (!m.isGroup && [r.p, r.p2].includes(m.sender)) {
            room = r
            roomId = id
            break
        }
    }
    
    if (!room) return false
    
    if (room.status === 'waiting' && m.sender === room.p2 && m.chat === room.chat) {
        if (/^(acc(ept)?|terima|gas|oke?|ok|iya|yoi|acept|acepto|vale|dale|vamos|venga|claro)$/i.test(text)) {
            clearTimeout(room.timeout)
            room.status = 'playing'
            
            await m.react('🎮')
            
            await m.reply(`✊✌️✋ *sᴜɪᴛ ᴄᴏᴍᴇɴᴢᴀᴅᴏ!*\n\n` +
                    `@${room.p.split('@')[0]} vs @${room.p2.split('@')[0]}\n\n` +
                    `> 📩 Revisa el *Chat Privado* para elegir!\n` +
                    `> ⏱️ Timeout: 90 segundos`, {  mentions: [room.p, room.p2]})
            
            const pmMessage = `✊✌️✋ *sᴜɪᴛ - ᴇʟɪɢᴇ ᴛᴜ ᴏᴘᴄɪᴏ́ɴ*\n\n` +
                `Escribe una de estas opciones:\n\n` +
                `┃ ✊ *piedra* (batu)\n` +
                `┃ ✌️ *tijera* (gunting)\n` +
                `┃ ✋ *papel* (kertas)\n\n` +
                `*TIP: ¡Responde a este mensaje con tu opción!*\n` +
                `Ejemplo: *piedra*`
            
            try {
                await sock.sendMessage(room.p, { text: pmMessage })
            } catch (e) {
                console.log('[Suit] Failed to PM player 1:', e.message)
            }
            
            try {
                await sock.sendMessage(room.p2, { text: pmMessage })
            } catch (e) {
                console.log('[Suit] Failed to PM player 2:', e.message)
            }
            
            room.timeout = setTimeout(async () => {
                if (global.suitGames[roomId]) {
                    if (!room.pilih && !room.pilih2) {
                        await sock.sendMessage(room.chat, { 
                            text: '⏱️ Ninguno de los dos eligió, ¡la partida fue cancelada!' 
                        })
                    } else if (!room.pilih || !room.pilih2) {
                        const afk = !room.pilih ? room.p : room.p2
                        const winner = !room.pilih ? room.p2 : room.p
                        
                        db.updateBerry(winner, WIN_REWARD)
                        
                        await sock.sendMessage(room.chat, {
                            text: `⏱️ *¡TIEMPO AGOTADO!*\n\n` +
                                `@${afk.split('@')[0]} no eligió!\n` +
                                `@${winner.split('@')[0]} gana! +Rp ${WIN_REWARD.toLocaleString()}`,
                            mentions: [afk, winner]
                        })
                    }
                    delete global.suitGames[roomId]
                }
            }, TIMEOUT)
            
            return true
        }
        
        if (/^(tolak|gamau|nanti|ga(k.)?bisa|no|tidak|rechaz|rechazo|nope|nunca|despues|luego)$/i.test(text)) {
            clearTimeout(room.timeout)
            
            await sock.sendMessage(room.chat, {
                text: `❌ @${room.p2.split('@')[0]} rechazó el desafío!\nLa partida fue cancelada.`,
                mentions: [room.p2]
            })
            
            delete global.suitGames[roomId]
            return true
        }
    }
    
    if (room.status === 'playing' && !m.isGroup) {
        const choices = /^(batu|gunting|kertas|piedra|tijera|papel)$/i
        
        if (!choices.test(text)) return false
        
        const choice = text.toLowerCase()
        
        if (m.sender === room.p && !room.pilih) {
            room.pilih = choice
            await m.reply(`✅ Elegiste *${choice}* ${EMOJI[choice]}\n\n> Esperando al rival...`)
            
            if (!room.pilih2) {
                await sock.sendMessage(room.chat, {
                    text: `🕕 @${room.p.split('@')[0]} ya eligió!\n> Esperando a @${room.p2.split('@')[0]}...`,
                    mentions: [room.p, room.p2]
                })
            }
        }
        
        if (m.sender === room.p2 && !room.pilih2) {
            room.pilih2 = choice
            await m.reply(`✅ Elegiste *${choice}* ${EMOJI[choice]}\n\n> Esperando al rival...`)
            
            if (!room.pilih) {
                await sock.sendMessage(room.chat, {
                    text: `🕕 @${room.p2.split('@')[0]} ya eligió!\n> Esperando a @${room.p.split('@')[0]}...`,
                    mentions: [room.p, room.p2]
                })
            }
        }
        
        if (room.pilih && room.pilih2) {
            clearTimeout(room.timeout)
            
            let winner = null
            let tie = false
            
            if (room.pilih === room.pilih2) {
                tie = true
            } else if (
                (room.pilih === 'batu' && room.pilih2 === 'gunting') ||
                (room.pilih === 'gunting' && room.pilih2 === 'kertas') ||
                (room.pilih === 'kertas' && room.pilih2 === 'batu')
            ) {
                winner = room.p
            } else {
                winner = room.p2
            }
            
            let resultTxt = `╭━━〔 🎲 〕━━╮\n✊✌️✋ *RESULTADO DEL SUIT*\n╰━━━━━━━━━━╯\n\n`
            resultTxt += `@${room.p.split('@')[0]} ${EMOJI[room.pilih]} ${room.pilih}\n`
            resultTxt += `@${room.p2.split('@')[0]} ${EMOJI[room.pilih2]} ${room.pilih2}\n\n`
            
            if (tie) {
                resultTxt += `🤝 ──────────\n*¡EMPATE!* 🤝`
            } else {
                db.updateBerry(winner, WIN_REWARD)
                
                resultTxt += `꧁༺ 🏆 VICTORIA ༻꧂\n╰┈➤ @${winner.split('@')[0]} gana! 💥\n`
                resultTxt += `> +Rp ${WIN_REWARD.toLocaleString()}`
            }
            
            await sock.sendMessage(room.chat, {
                text: resultTxt,
                mentions: [room.p, room.p2]
            }, { quoted: m })
            
            delete global.suitGames[roomId]
        }
        
        return true
    }
    
    return false
}

export { pluginConfig as config, handler, answerHandler }