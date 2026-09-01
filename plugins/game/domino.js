import { getDatabase } from '../../src/lib/luffy-database.js'

const pluginConfig = {
    name: 'domino',
    alias: ['dominoes', 'ficha'],
    category: 'game',
    description: 'Juega al Dominó multijugador (2 jugadores) por turnos',
    usage: '.domino @jugador2',
    example: '.domino @628xxx',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    isEnabled: true
}

if (!global.dominoGames) global.dominoGames = {}

const TIMEOUT = 120000
const TURN_TIMEOUT = 60000
const WIN_REWARD = 1000

function makeDeck() {
    const deck = []
    for (let i = 0; i <= 6; i++) {
        for (let j = i; j <= 6; j++) {
            deck.push([i, j])
        }
    }
    return deck
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const t = a[i]; a[i] = a[j]; a[j] = t
    }
    return a
}

function tileStr(t) {
    return t[0] + '-' + t[1]
}

function handStr(h) {
    return h.map((t, i) => (i + 1) + '. ' + tileStr(t)).join('\n')
}

function rulesText() {
    return ' Domino *REGLAS DEL DOMINÓ*\n\n' +
        'Se reparten *7 fichas* a cada jugador (doble-seis: 28 fichas del 0-0 al 6-6).\n\n' +
        'Para empezar se coloca la ficha doble mayor al centro. Si ninguno tiene doble, se juega la mayor.\n\n' +
        '*En tu turno escribe:*\n' +
        '> `jugar X-Y` — colocar una ficha que empalme con la línea\n' +
        '> `robar` — robar del pozo si no tienes jugable\n' +
        '> `mano` — ver tus fichas (por privado)\n' +
        '> `tablero` — ver la línea actual\n' +
        '> `reglas` — ver esto\n' +
        '> `salir` — abandonar (solo el creador)\n\n' +
        '*Empalme:* La ficha debe coincidir con el *inicio* o el *final* de la línea.\n' +
        'Si escribés `jugar 3-5` y la línea termina en 5, se colocará como `5-3` automáticamente.\n\n' +
        '*Si no podés jugar:* escribe `robar`. Si tras robar tampoco podés, pasás turno.\n' +
        'Si el pozo está vacío y no podés jugar, pasás turno automáticamente.\n\n' +
        '*Fin del juego:*\n' +
        '> Se queda sin fichas → ¡GANA! (+' + WIN_REWARD + ' )\n' +
        '> Nadie puede jugar (bloqueado) → gana quien tenga MENOS puntos en mano\n\n' +
        '*Timeout de turno:* 60 segundos'
}

function renderBoard(g) {
    const left = g.line[0]
    const right = g.line[g.line.length - 1]
    const lineStr = g.line.map(t => tileStr(t)).join(' ')
    return ' *DOMINÓ — TABLERO*\n\n' +
        'Línea: ' + lineStr + '\n' +
        'Extremos: [' + left[0] + '] ← ' + lineStr + ' → [' + right[1] + ']\n' +
        'Pozo: ' + g.deck.length + ' fichas restantes'
}

function calcHandScore(hand) {
    let s = 0
    for (const t of hand) s += t[0] + t[1]
    return s
}

function countPlayable(hand, leftVal, rightVal) {
    let n = 0
    for (const t of hand) {
        if (t[0] === leftVal || t[1] === leftVal || t[0] === rightVal || t[1] === rightVal) n++
    }
    return n
}

function canPlayTile(t, leftVal, rightVal) {
    return t[0] === leftVal || t[1] === leftVal || t[0] === rightVal || t[1] === rightVal
}

function startGame(sock, m, roomId, g) {
    const deck = shuffle(makeDeck())
    g.deck = deck
    g.hands = {}
    for (const p of g.players) g.hands[p] = []
    for (let i = 0; i < 7; i++) {
        for (const p of g.players) g.hands[p].push(deck.pop())
    }
    g.status = 'playing'
    g.turn = 0
    g.state = 'play'
    g.line = []
    g.leftVal = -1
    g.rightVal = -1
    g.passek = [false, false]

    let firstTile = null
    let firstPlayer = -1
    const doubles = []
    for (let pi = 0; pi < 2; pi++) {
        const p = g.players[pi]
        for (let ti = 0; ti < g.hands[p].length; ti++) {
            const t = g.hands[p][ti]
            if (t[0] === t[1]) doubles.push({ pi, ti, val: t[0] })
        }
    }
    if (doubles.length > 0) {
        doubles.sort((a, b) => b.val - a.val)
        firstPlayer = doubles[0].pi
        firstTile = g.hands[g.players[firstPlayer]].splice(doubles[0].ti, 1)[0]
    } else {
        let best = -1
        for (let pi = 0; pi < 2; pi++) {
            const p = g.players[pi]
            for (let ti = 0; ti < g.hands[p].length; ti++) {
                const t = g.hands[p][ti]
                const sum = t[0] + t[1]
                if (sum > best) { best = sum; firstPlayer = pi; firstTile = t }
            }
        }
        g.hands[g.players[firstPlayer]].splice(
            g.hands[g.players[firstPlayer]].findIndex(t => t[0] === firstTile[0] && t[1] === firstTile[1]),
            1
        )
    }
    g.line = [firstTile]
    g.leftVal = firstTile[0]
    g.rightVal = firstTile[1]
    g.turn = firstPlayer
    g.turnTimeout = setTimeout(() => endTurnTimeout(sock, m, roomId, g), TURN_TIMEOUT)

    const rules = rulesText()
    const board = renderBoard(g)
    const cur = g.players[g.turn]
    const txt = ' *¡DOMINÓ COMIENZA!*\n\n' +
        'Primera ficha: *' + tileStr(firstTile) + '*\n\n' +
        rules + '\n\n' + board + '\n\n' +
        'Turno de @' + cur.split('@')[0]
    sock.sendMessage(m.chat, { text: txt, mentions: g.players }).catch(() => {})
    for (const p of g.players) {
        const pm = ' *TU MANO (DOMINÓ)*\n\n' + handStr(g.hands[p]) + '\n\nEscribe `mano` para ver tus fichas'
        sock.sendMessage(p, { text: pm }).catch(() => {})
    }
}

async function endTimeout(sock, m, roomId, g) {
    if (!global.dominoGames[roomId]) return
    sock.sendMessage(m.chat, { text: '⏱ Tiempo agotado. Partida de Dominó cancelada.', mentions: g.players }).catch(() => {})
    if (g.turnTimeout) clearTimeout(g.turnTimeout)
    delete global.dominoGames[roomId]
}

function endTurnTimeout(sock, m, roomId, g) {
    if (!global.dominoGames[roomId]) return
    const cur = g.players[g.turn]
    sock.sendMessage(m.chat, {
        text: '⏱ @' + cur.split('@')[0] + ' tardó demasiado. Turno perdido.',
        mentions: [cur]
    }).catch(() => {})
    if (g.turnTimeout) clearTimeout(g.turnTimeout)
    g.turn = (g.turn + 1) % 2
    g.turnTimeout = setTimeout(() => endTurnTimeout(sock, m, roomId, g), TURN_TIMEOUT)
    announceTurn(sock, m, g)
}

function announceTurn(sock, m, g) {
    const cur = g.players[g.turn]
    const n = countPlayable(g.hands[cur], g.leftVal, g.rightVal)
    const board = renderBoard(g)
    const extra = n === 0 ? '\nNo tenés fichas jugables — escribe `robar`' : ''
    sock.sendMessage(m.chat, {
        text: board + '\n\nTurno de @' + cur.split('@')[0] + ' — escribe `jugar X-Y` o `robar`' + extra,
        mentions: [cur]
    }).catch(() => {})
}

function broadcast(sock, m, g, txt) {
    sock.sendMessage(m.chat, { text: txt, mentions: g.players }).catch(() => {})
}

function checkBlocked(g) {
    if (g.deck.length > 0) return false
    for (const p of g.players) {
        if (countPlayable(g.hands[p], g.leftVal, g.rightVal) > 0) return false
    }
    return true
}

function resolveBlocked(sock, m, g) {
    const scores = g.players.map(p => ({ p, score: calcHandScore(g.hands[p]) }))
    scores.sort((a, b) => a.score - b.score)
    const winner = scores[0].p
    const loser = scores[1].p
    const db = getDatabase()
    try { db.updateBerry(winner, WIN_REWARD) } catch (e) {}
    broadcast(sock, m, g,
        ' *JUEGO BLOQUEADO*\n\n' +
        '@' + winner.split('@')[0] + ' tiene ' + scores[0].score + ' puntos en mano\n' +
        '@' + loser.split('@')[0] + ' tiene ' + scores[1].score + ' puntos en mano\n\n' +
        '🏆 @' + winner.split('@')[0] + ' GANA con menos puntos!\n> +' + WIN_REWARD + ' '
    )
    const roomId = Object.keys(global.dominoGames).find(k => global.dominoGames[k] === g)
    if (roomId) { clearTimeout(g.timeout); if (g.turnTimeout) clearTimeout(g.turnTimeout); delete global.dominoGames[roomId] }
}

function winGame(sock, m, g, winner) {
    const db = getDatabase()
    try { db.updateBerry(winner, WIN_REWARD) } catch (e) {}
    broadcast(sock, m, g,
        ' *¡DOMINÓ!*\n\n🏆 @' + winner.split('@')[0] + ' se quedó sin fichas y GANA!\n> +' + WIN_REWARD + ' '
    )
    const roomId = Object.keys(global.dominoGames).find(k => global.dominoGames[k] === g)
    if (roomId) { clearTimeout(g.timeout); if (g.turnTimeout) clearTimeout(g.turnTimeout); delete global.dominoGames[roomId] }
}

function advanceTurn(g) {
    g.turn = (g.turn + 1) % 2
    if (g.turnTimeout) clearTimeout(g.turnTimeout)
}

function doPlay(sock, m, g, input) {
    const cur = g.players[g.turn]
    if (m.sender !== cur) return m.reply('⏳ Aún no es tu turno.')

    if (/^(robar|robo|draw|pin)$/i.test(input)) {
        if (g.deck.length === 0) return m.reply('El pozo está vacío. No podés robar.')
        const drawn = g.deck.pop()
        g.hands[cur].push(drawn)
        m.reply('Robaste la ficha: *' + tileStr(drawn) + '*')
        const canNow = canPlayTile(drawn, g.leftVal, g.rightVal)
        if (canNow) {
            m.reply('Podés jugar esa ficha. Escribe `jugar ' + tileStr(drawn) + '`')
            return true
        }
        advanceTurn(g)
        g.turnTimeout = setTimeout(() => endTurnTimeout(sock, m, Object.keys(global.dominoGames).find(k => global.dominoGames[k] === g), g), TURN_TIMEOUT)
        announceTurn(sock, m, g)
        return true
    }

    const match = input.match(/^jugar\s+(\d+)[-.](\d+)/i)
    if (!match) return m.reply('Formato: `jugar X-Y` (ej: `jugar 3-5`) o `robar`')

    const a = parseInt(match[1])
    const b = parseInt(match[2])
    if (a < 0 || a > 6 || b < 0 || b > 6) return m.reply('Ficha inválida. Números del 0 al 6.')

    const hand = g.hands[cur]
    const tileIdx = hand.findIndex(t => (t[0] === a && t[1] === b) || (t[0] === b && t[1] === a))
    if (tileIdx < 0) return m.reply('No tenés esa ficha en tu mano.')

    const tile = hand[tileIdx]
    let placed = null
    let side = null

    if (tile[0] === g.leftVal || tile[1] === g.leftVal) {
        side = 'left'
        placed = tile[0] === g.leftVal ? [tile[1], tile[0]] : [tile[0], tile[1]]
    } else if (tile[0] === g.rightVal || tile[1] === g.rightVal) {
        side = 'right'
        placed = tile[1] === g.rightVal ? [tile[1], tile[0]] : [tile[0], tile[1]]
    } else {
        return m.reply('Esa ficha no empalma con ningún extremo de la línea.')
    }

    hand.splice(tileIdx, 1)

    if (side === 'left') {
        g.line.unshift(placed)
        g.leftVal = placed[0]
    } else {
        g.line.push(placed)
        g.rightVal = placed[1]
    }

    broadcast(sock, m, g,
        '@' + cur.split('@')[0] + ' jugó *' + tileStr(placed) + '*\n' +
        renderBoard(g)
    )

    if (hand.length === 0) {
        winGame(sock, m, g, cur)
        return true
    }

    advanceTurn(g)
    if (checkBlocked(g)) {
        resolveBlocked(sock, m, g)
        return true
    }
    g.turnTimeout = setTimeout(() => endTurnTimeout(sock, m, Object.keys(global.dominoGames).find(k => global.dominoGames[k] === g), g), TURN_TIMEOUT)
    announceTurn(sock, m, g)
    return true
}

async function handler(m, { sock }) {
    const existing = Object.values(global.dominoGames).find(r => r.status === 'playing' && r.players.includes(m.sender))
    if (existing) return m.reply('❌ Ya estás en una partida de Dominó en curso.')

    let targets = []
    if (m.quoted) targets = [m.quoted.sender]
    else if (m.mentionedJid) targets = m.mentionedJid.slice(0, 1)

    if (!targets.length) {
        return m.reply(' *DOMINÓ*\n\n' + rulesText() + '\n\nPara jugar etiqueta a tu rival (2 jugadores):\n> `.domino @jugador2`')
    }
    const players = [m.sender, targets[0]]
    if (players[0] === players[1]) return m.reply('❌ No podés invitarte a vos mismo.')
    for (const t of targets) {
        if (Object.values(global.dominoGames).some(r => r.players.includes(t) && r.status === 'playing'))
            return m.reply('❌ Alguien ya está jugando Dominó.')
    }

    const roomId = 'domino_' + Date.now()
    const g = {
        id: roomId, chat: m.chat, players,
        accepted: { [m.sender]: true },
        status: 'waiting', deck: null, hands: null, line: null,
        leftVal: -1, rightVal: -1, turn: -1, state: 'play',
        turnTimeout: null, createdAt: Date.now()
    }
    global.dominoGames[roomId] = g
    g.timeout = setTimeout(() => endTimeout(sock, m, roomId, g), TIMEOUT)

    await m.react(' ')
    const inv = players.map(p => p === m.sender ? '👤 Tú (host)' : '👥 @' + p.split('@')[0]).join('\n')
    await m.reply(' *DOMINÓ · INVITACIÓN*\n\nJugadores:\n' + inv +
        '\n\nEsperando que @' + targets[0].split('@')[0] + ' escriba *acepto* / *ok*.\n' +
        'Las reglas se muestran al comenzar. Time: 2 min', { mentions: targets })
}

async function answerHandler(m, sock) {
    if (!m.body) return false
    const text = m.body.trim().toLowerCase()

    let g = null, roomId = null
    for (const [id, r] of Object.entries(global.dominoGames)) {
        if (r.status === 'waiting' && r.players.includes(m.sender) && r.chat === m.chat) { g = r; roomId = id; break }
        if (r.status === 'playing' && r.players.includes(m.sender)) { g = r; roomId = id; break }
    }
    if (!g) return false

    if (g.status === 'waiting') {
        if (/^(acept(o|ar)?|acepto|terima|gas|oke?|ok|iya|yoi|vale|dale|vamos|claro|si|sip)$/i.test(text)) {
            g.accepted[m.sender] = true
            if (g.players.every(p => g.accepted[p])) {
                clearTimeout(g.timeout)
                startGame(sock, m, roomId, g)
            } else {
                m.reply('✅ Aceptado! Esperando a ' + g.players.filter(p => !g.accepted[p]).map(p => '@' + p.split('@')[0]).join(', '))
            }
            return true
        }
        if (/^(no|nope|rechaz|rechazo|negat|no quiero)$/i.test(text)) {
            clearTimeout(g.timeout)
            sock.sendMessage(m.chat, { text: '❌ @' + m.sender.split('@')[0] + ' rechazó. Partida cancelada.', mentions: g.players }).catch(() => {})
            delete global.dominoGames[roomId]
            return true
        }
        return false
    }

    if (/^(reglas|regla|help|ayuda)$/i.test(text)) { m.reply(rulesText()); return true }
    if (/^(mano|mis fichas|fichas|hand)$/i.test(text)) {
        m.reply(' *TU MANO (DOMINÓ)*\n\n' + handStr(g.hands[m.sender]))
        return true
    }
    if (/^(tablero|board|mesa)$/i.test(text)) { m.reply(renderBoard(g)); return true }
    if (/^(salir|alto|abortar|cancelar|terminar)$/i.test(text)) {
        if (m.sender !== g.players[0]) { m.reply('❌ Solo el creador puede cancelar.'); return true }
        clearTimeout(g.timeout)
        if (g.turnTimeout) clearTimeout(g.turnTimeout)
        sock.sendMessage(m.chat, { text: '🛑 Partida de Dominó cancelada por su creador.', mentions: g.players }).catch(() => {})
        delete global.dominoGames[roomId]
        return true
    }

    return doPlay(sock, m, g, text)
}

export { pluginConfig as config, handler, answerHandler }
