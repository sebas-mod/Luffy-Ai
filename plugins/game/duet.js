import { getDatabase } from '../../src/lib/luffy-database.js'

const pluginConfig = {
    name: 'duet',
    alias: ['musical', 'notasduel', 'melodia'],
    category: 'game',
    description: 'Duelo musical de memoria por turnos (2 jugadores)',
    usage: '.duet @jugador2',
    example: '.duet @628xxx',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    isEnabled: true
}

if (!global.duetGames) global.duetGames = {}

const TIMEOUT = 120000
const WIN_REWARD = 1000
const VALID_NOTES = ['DO', 'DO#', 'RE', 'RE#', 'MI', 'FA', 'FA#', 'SOL', 'SOL#', 'LA', 'LA#', 'SI']
const MAX_NOTES = 6
const MIN_NOTES = 3
const POINTS_TO_WIN = 3
const MAX_ROUNDS = 6

function rulesText() {
    return '🎵 *DUET — Duelo Musical de Memoria*\n\n' +
        '👤 *2 jugadores*, por turnos.\n\n' +
        '📋 *Cómo funciona:*\n' +
        '1. El jugador en turno *CREA una melodía* escribiéndola EN PRIVADO al bot:\n' +
        '> `melodia DO RE MI FA` (3-6 notas)\n' +
        '2. El rival debe *REPETIRLA* en el grupo:\n' +
        '> `repetir DO RE MI FA`\n' +
        '3. Si acierta: +1 punto. Si falla: +1 punto para el creador.\n' +
        '4. Se alternan los roles cada ronda.\n\n' +
        '🎹 *Notas válidas:*\n' +
        '> DO, RE, MI, FA, SOL, LA, SI\n' +
        '> Con sostenidos: DO#, RE#, FA#, SOL#, LA#\n\n' +
        '⌨️ *Comandos:*\n' +
        '> `melodia <notas>` — crear melodía (por privado)\n' +
        '> `repetir <notas>` — repetir melodía (en grupo)\n' +
        '> `reglas` — ver reglas · `help` — ver notas válidas\n' +
        '> `marcador` — ver puntos · `salir` — abandonar\n\n' +
        '🏆 *Primero a ' + POINTS_TO_WIN + ' puntos* gana (máx. ' + MAX_ROUNDS + ' rondas).\n' +
        '> Premio: +' + WIN_REWARD + '💰 berries'
}

function notesList() {
    return '🎹 *Notas válidas para DUET*\n\n' +
        'Básicas: DO, RE, MI, FA, SOL, LA, SI\n' +
        'Con sostenido (#): DO#, RE#, FA#, SOL#, LA#\n\n' +
        'Formato: `melodia DO RE MI FA SOL`\n' +
        'Mínimo ' + MIN_NOTES + ' notas, máximo ' + MAX_NOTES + '.'
}

function parseMelody(input) {
    return input.toUpperCase().replace(/\s+/g, ' ').trim().split(' ')
}

function validateMelody(notes) {
    if (notes.length < MIN_NOTES) return { ok: false, msg: '❌ Mínimo ' + MIN_NOTES + ' notas.' }
    if (notes.length > MAX_NOTES) return { ok: false, msg: '❌ Máximo ' + MAX_NOTES + ' notas.' }
    for (const n of notes) {
        if (!VALID_NOTES.includes(n)) return { ok: false, msg: '❌ Nota inválida: *' + n + '*.\nEscribe `help` para ver las notas válidas.' }
    }
    return { ok: true }
}

function scoreboard(g) {
    return '🎵 *Marcador DUET*\n\n' +
        '🎶 @' + g.players[0].split('@')[0] + ': *' + g.score[g.players[0]] + '* puntos\n' +
        '🎶 @' + g.players[1].split('@')[0] + ': *' + g.score[g.players[1]] + '* puntos\n\n' +
        'Ronda ' + g.round + '/' + MAX_ROUNDS
}

function announceTurn(sock, g) {
    const cur = g.players[g.turn]
    const creator = g.players[g.roundCreator]
    sock.sendMessage(g.chat, {
        text: '🎵 Ronda ' + g.round + '/' + MAX_ROUNDS + '\n\n' +
            '📝 @' + creator.split('@')[0] + ': crea una melodía EN PRIVADO escribiendo:\n' +
            '> `melodia DO RE MI FA`\n\n' +
            '🎶 @' + g.players[g.turn === 0 ? 1 : 0].split('@')[0] + ': espera la melodía de tu rival.',
        mentions: g.players
    }).catch(() => {})
}

function checkWin(sock, g) {
    const winner = Object.keys(g.score).find(p => g.score[p] >= POINTS_TO_WIN)
    if (winner) { endGame(sock, g, winner); return true }
    if (g.round > MAX_ROUNDS) {
        const top = g.score[g.players[0]] >= g.score[g.players[1]] ? g.players[0] : g.players[1]
        endGame(sock, g, top)
        return true
    }
    return false
}

function endGame(sock, g, winner) {
    const loser = g.players.find(p => p !== winner)
    const db = getDatabase()
    try { db.updateBerry(winner, WIN_REWARD) } catch (e) {}

    sock.sendMessage(g.chat, {
        text: '🏆 *¡DUET TERMINA!*\n\n🎉 @' + winner.split('@')[0] + ' gana el duelo musical!\n' +
            scoreboard(g) + '\n\n> +' + WIN_REWARD + '💰 berries',
        mentions: g.players
    }).catch(() => {})
    sock.sendMessage(winner, { text: '🎉 ¡Felicidades! Ganaste DUET. +' + WIN_REWARD + '💰 berries.' }).catch(() => {})
    if (loser) sock.sendMessage(loser, { text: '😔 Perdiste DUET. ¡Mejor suerte la próxima!' }).catch(() => {})

    clearTimeout(g.timeout)
    delete global.duetGames[g.id]
}

function cleanup(g) {
    clearTimeout(g.timeout)
    delete global.duetGames[g.id]
}

async function handler(m, { sock }) {
    const existing = Object.values(global.duetGames).find(r =>
        r.status !== 'ended' && r.players.includes(m.sender))
    if (existing) return m.reply('❌ Ya estás en una partida de DUET en curso.')

    let targets = []
    if (m.quoted) targets = [m.quoted.sender]
    else if (m.mentionedJid) targets = m.mentionedJid.slice(0, 1)

    if (!targets.length) {
        return m.reply('🎵 *DUET — Duelo Musical de Memoria*\n\n' + rulesText() +
            '\n\n👉 Para jugar etiqueta a tu rival (2 jugadores):\n> `.duet @jugador2`')
    }

    const players = [m.sender, ...targets]
    if (new Set(players).size !== players.length) return m.reply('❌ No puedes invitarte a ti mismo.')
    if (players.length !== 2) return m.reply('❌ DUET se juega exactamente entre 2 jugadores.')
    for (const t of targets) {
        if (Object.values(global.duetGames).some(r => r.players.includes(t) && r.status !== 'ended'))
            return m.reply('❌ Alguien ya está jugando DUET.')
    }

    const roomId = 'duet_' + Date.now()
    const g = {
        id: roomId, chat: m.chat, players,
        accepted: { [m.sender]: true },
        status: 'waiting', turn: 0, round: 1, roundCreator: 0,
        score: { [m.sender]: 0, [targets[0]]: 0 },
        pendingMelody: null, state: 'waitingAccept', createdAt: Date.now()
    }
    global.duetGames[roomId] = g
    g.timeout = setTimeout(() => {
        if (global.duetGames[roomId]) {
            sock.sendMessage(m.chat, { text: '⏱️ Tiempo agotado. Partida de DUET cancelada.', mentions: g.players })
            delete global.duetGames[roomId]
        }
    }, TIMEOUT)

    await m.react('🎵')
    const inv = players.map(p => p === m.sender ? '👤 Tú (host)' : '👥 @' + p.split('@')[0]).join('\n')
    await m.reply('🎵 *DUET · INVITACIÓN*\n\nJugadores:\n' + inv +
        '\n\nEsperando que @' + targets[0].split('@')[0] + ' escriba *acepto* / *ok*.\n' +
        'Las reglas se muestran al comenzar. Time: 2 min', { mentions: targets })
}

async function answerHandler(m, sock) {
    if (!m.body) return false
    const text = m.body.trim().toLowerCase()

    let g = null, roomId = null
    for (const [id, r] of Object.entries(global.duetGames)) {
        if (r.status === 'waiting' && r.players.includes(m.sender) && r.chat === m.chat) { g = r; roomId = id; break }
        if (r.status !== 'waiting' && r.status !== 'ended' && r.players.includes(m.sender)) { g = r; roomId = id; break }
    }
    if (!g) return false

    if (g.status === 'waiting') {
        if (/^(acept(o|ar)?|acepto|terima|gas|oke?|ok|iya|yoi|vale|dale|vamos|claro|si|sip)$/i.test(text)) {
            g.accepted[m.sender] = true
            if (g.players.every(p => g.accepted[p])) {
                clearTimeout(g.timeout)
                g.status = 'playing'
                g.state = 'waitingMelody'
                g.turn = 0
                g.roundCreator = 0
                sock.sendMessage(m.chat, {
                    text: '🎵 *¡DUET COMIENZA!*\n\n' + rulesText() + '\n\n' + scoreboard(g),
                    mentions: g.players
                }).catch(() => {})
                announceTurn(sock, g)
            } else {
                m.reply('✅ Aceptado! Esperando a ' + g.players.filter(p => !g.accepted[p]).map(p => '@' + p.split('@')[0]).join(', '))
            }
            return true
        }
        if (/^(no|nope|rechaz|rechazo|negat|no quiero)$/i.test(text)) {
            clearTimeout(g.timeout)
            sock.sendMessage(m.chat, { text: '❌ @' + m.sender.split('@')[0] + ' rechazó. Partida cancelada.', mentions: g.players })
            delete global.duetGames[roomId]
            return true
        }
        return false
    }

    if (g.status === 'ended') return false

    if (/^(reglas|regla|help|ayuda)$/i.test(text)) { m.reply(rulesText()); return true }
    if (/^(notas|lista de notas|notes)$/i.test(text)) { m.reply(notesList()); return true }
    if (/^(marcador|score|puntos)$/i.test(text)) { m.reply(scoreboard(g)); return true }
    if (/^(salir|alto|abortar|cancelar)$/i.test(text)) {
        if (m.sender !== g.players[0]) { m.reply('❌ Solo el creador puede cancelar.'); return true }
        sock.sendMessage(m.chat, { text: '🛑 Partida de DUET cancelada por su creador.', mentions: g.players })
        cleanup(g)
        return true
    }

    const isGroup = m.isGroup
    const gameChat = g.chat
    const isCreator = m.sender === g.players[g.roundCreator]
    const isRival = m.sender === g.players[g.roundCreator === 0 ? 1 : 0]

    if (g.state === 'waitingMelody' && isCreator) {
        if (!/^melodia\s+/i.test(m.body.trim())) return false

        const melodyStr = m.body.trim().slice(m.body.trim().indexOf(' ') + 1)
        const notes = parseMelody(melodyStr)
        const val = validateMelody(notes)
        if (!val.ok) { m.reply(val.msg); return true }

        g.pendingMelody = notes
        g.state = 'waitingRepeat'

        await m.react('🎶')
        m.reply('🎵 Melodía recibida: *' + notes.join(' ') + '*\nAhora tu rival debe repetirla en el grupo. Espera...')

        sock.sendMessage(gameChat, {
            text: '🎵 Ronda ' + g.round + '/' + MAX_ROUNDS + '\n\n' +
                '📝 @' + m.sender.split('@')[0] + ' creó una melodía.\n\n' +
                '🎶 @' + g.players[g.roundCreator === 0 ? 1 : 0].split('@')[0] +
                ': escribe `repetir` seguido de las notas que crees que son:\n' +
                '> `repetir DO RE MI FA`\n\n⏱️ Tienes 60 segundos.',
            mentions: g.players
        }).catch(() => {})

        clearTimeout(g.timeout)
        g.timeout = setTimeout(async () => {
            if (!global.duetGames[roomId]) return
            const loser = g.players[g.roundCreator === 0 ? 1 : 0]
            g.score[m.sender]++
            sock.sendMessage(gameChat, {
                text: '⏱️ @' + loser.split('@')[0] + ' no respondió a tiempo.\n' +
                    '❌ Punto para @' + m.sender.split('@')[0] + '.',
                mentions: g.players
            }).catch(() => {})
            if (!checkWin(sock, g)) {
                g.round++
                g.roundCreator = g.roundCreator === 0 ? 1 : 0
                g.turn = g.roundCreator
                g.state = 'waitingMelody'
                g.pendingMelody = null
                g.timeout = setTimeout(() => { if (global.duetGames[roomId]) { sock.sendMessage(gameChat, { text: '⏱️ Tiempo agotado. Partida cancelada.', mentions: g.players }); cleanup(g) } }, TIMEOUT)
                announceTurn(sock, g)
            }
        }, 60000)
        return true
    }

    if (g.state === 'waitingRepeat' && isRival && isGroup) {
        if (!/^repetir\s+/i.test(m.body.trim())) return false

        const melodyStr = m.body.trim().slice(m.body.trim().indexOf(' ') + 1)
        const notes = parseMelody(melodyStr)
        const val = validateMelody(notes)
        if (!val.ok) { m.reply(val.msg); return true }

        const match = notes.length === g.pendingMelody.length &&
            notes.every((n, i) => n === g.pendingMelody[i])

        if (match) {
            g.score[m.sender]++
            await m.react('✅')
            sock.sendMessage(gameChat, {
                text: '🎵 ¡Correcto! @' + m.sender.split('@')[0] + ' repitió la melodía perfectamente.\n' +
                    '🎶 era: *' + g.pendingMelody.join(' ') + '*\n\n' + scoreboard(g),
                mentions: g.players
            }).catch(() => {})
        } else {
            g.score[g.players[g.roundCreator]]++
            await m.react('❌')
            sock.sendMessage(gameChat, {
                text: '❌ @' + m.sender.split('@')[0] + ' falló.\n' +
                    'Tu respuesta: *' + notes.join(' ') + '*\n' +
                    'La melodía era: *' + g.pendingMelody.join(' ') + '*\n' +
                    'Punto para @' + g.players[g.roundCreator].split('@')[0] + '.\n\n' + scoreboard(g),
                mentions: g.players
            }).catch(() => {})
        }

        clearTimeout(g.timeout)
        if (!checkWin(sock, g)) {
            g.round++
            g.roundCreator = g.roundCreator === 0 ? 1 : 0
            g.turn = g.roundCreator
            g.state = 'waitingMelody'
            g.pendingMelody = null
            g.timeout = setTimeout(() => { if (global.duetGames[roomId]) { sock.sendMessage(gameChat, { text: '⏱️ Tiempo agotado. Partida cancelada.', mentions: g.players }); cleanup(g) } }, TIMEOUT)
            announceTurn(sock, g)
        }
        return true
    }

    if (g.state === 'waitingMelody' && isRival && isGroup) {
        if (/^(repetir|melodia)\s+/i.test(m.body.trim())) {
            m.reply('⏳ Aún no hay melodía para repetir. Espera a que tu rival la envíe por privado.')
            return true
        }
    }

    return false
}

export { pluginConfig as config, handler, answerHandler }
