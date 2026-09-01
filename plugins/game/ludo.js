import { initDatabase, getDatabase } from '../../src/lib/luffy-database.js'

const pluginConfig = {
    name: 'ludo',
    alias: ['parcheesi', 'parchis', 'ludoo'],
    category: 'game',
    description: 'Ludo clásico multijugador (2-4 jugadores)',
    usage: '.ludo @jugador2 @jugador3',
    example: '.ludo @628xxx @628yyy',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    carne: 0,
    isEnabled: true
}

if (!global.ludoGames) global.ludoGames = {}

const TIMEOUT = 180000
const WIN_REWARD = 1500
const COLORS = {
    r: { name: 'Rojo', emoji: '🔴', letter: 'R' },
    g: { name: 'Verde', emoji: '🟢', letter: 'G' },
    y: { name: 'Amarillo', emoji: '🟡', letter: 'Y' },
    b: { name: 'Azul', emoji: '🔵', letter: 'B' }
}
const PCOLORS = ['r', 'g', 'y', 'b']
const TRACK = 52
const HOME_IN = 51   // (rel 51..56 = homestretch)
const ARRIVED = 57   // rel to finish

function die() { return Math.floor(Math.random() * 6) + 1 }

function startCell(i) { return i * 13 }   // 0,13,26,39

// absolute ring cell for a token at rel (0..50)
function absCell(i, rel) { return (startCell(i) + rel) % TRACK }

function playerColorFor(start) { return PCOLORS[start / 13] }

function tokenStr(g, i, t) {
    const c = PCOLORS[i]
    if (t === -1) return '🏠'
    if (t === ARRIVED) return '🏁'
    if (t >= HOME_IN) return COLORS[c].emoji
    return COLORS[c].emoji
}

function renderBoard(g) {
    // Build ring render: 4 arms of 13 cells each (seg 0 = cells 0-12 ... seg3=39-51)
    const grid = []
    for (let seg = 0; seg < 4; seg++) {
        const row = []
        for (let k = 0; k < 13; k++) {
            const cell = seg * 13 + k
            const tokens = []
            for (let i = 0; i < g.players.length; i++) {
                const ci = g.colorIdx[i]
                for (const t of g.tokens[i]) {
                    if (t >= 0 && t < HOME_IN && absCell(ci, t) === cell) tokens.push(COLORS[PCOLORS[ci]].letter)
                }
            }
            row.push(tokens.length ? tokens.join('') : '·')
        }
        const label = { 0: '⬇️', 1: '⬅️', 2: '⬆️', 3: '➡️' }[seg]
        grid.push(label + ' ' + row.join(' '))
    }
    // home columns per player (tokens rel 51-56) and finished count
    const homeRows = []
    for (let i = 0; i < g.players.length; i++) {
        const ci = g.colorIdx[i]
        const c = PCOLORS[ci]
        const inHome = g.tokens[i].filter(t => t >= HOME_IN && t < ARRIVED).length
        const done = g.tokens[i].filter(t => t === ARRIVED).length
        const out = g.tokens[i].filter(t => t >= 0 && t < HOME_IN).length
        homeRows.push(COLORS[c].emoji + ' ' + COLORS[c].name + ': fuera ' + out + ' · cola ' + inHome + ' · 🏁 ' + done)
    }
    return grid.join('\n') + '\n\n' + homeRows.join('\n')
}

function fmtPos(g, idx, t) {
    const c = COLORS[PCOLORS[g.colorIdx[idx]]]
    if (t === -1) return 'en base 🏠'
    if (t === ARRIVED) return 'llegó a meta 🏁'
    if (t >= HOME_IN) return 'en la cola de llegada (pos ' + (t - HOME_IN + 1) + '/6)'
    return 'casilla ' + (absCell(g.colorIdx[idx], t) + 1) + ' (' + c.name + ' track)'
}

function handStr(g, idx) {
    // show tokens
    let s = ''
    const names = ['A', 'B', 'C', 'D']
    for (let k = 0; k < 4; k++) {
        s += names[k] + ' ➜ ' + fmtPos(g, idx, g.tokens[idx][k]) + '\n'
    }
    return s
}

function rulesText() {
    return '🎲 *REGLAS DE LUDO* 🎲\n\n' +
        '1. Cada jugador tiene 4 fichas (A,B,C,D) que salen desde su *casa* (base 🏠).\n' +
        '2. Tira el dado: escribe *tirar* (o *rola*).\n' +
        '3. Para sacar una ficha de la base necesitas un *6*. Elige la ficha escribiendo su letra (ej: *a*).\n' +
        '4. Con un 6 vuelves a tirar.\n' +
        '5. Las fichas recorren las 52 casillas en el sentido de las agujas del reloj y entran a su *cola de llegada* 🏁.\n' +
        '6. Si caes en una casilla con una ficha rival, la *mandas a su base* (menos en las casillas de salida que son seguras).\n' +
        '7. Ganarás cuando tus 4 fichas lleguen a la meta.\n\n' +
        '🎮 *Comandos durante la partida:*\n' +
        '• `tirar` / `rola` — lanzar el dado\n' +
        '• `a`, `b`, `c`, `d` — mover esa ficha\n' +
        '• `tablero` — ver el tablero\n' +
        '• `fichas` — ver tus fichas\n' +
        '• `reglas` — ver reglas\n' +
        '• `salir` — salir de la partida'
}

function announceTurn(sock, m, g) {
    const cur = g.players[g.turn]
    const c = COLORS[PCOLORS[g.colorIdx[g.turn]]]
    sock.sendMessage(m.chat, {
        text: '🎲 Turno de ' + c.emoji + ' @' + cur.split('@')[0] + ' — escribe *tirar* para lanzar el dado.',
        mentions: [cur]
    }).catch(() => {})
}

function nextIdx(g) { return (g.turn + 1) % g.players.length }

function rollTurn(sock, m, g) {
    const r = die()
    const idx = g.turn
    const movable = []
    const based = []
    g.tokens[idx].forEach((t, k) => {
        if (t >= 0 && t < ARRIVED) {
            if (t === -1) { /* base */ } else if (t + r <= ARRIVED) movable.push(k)
        }
        if (t === -1) based.push(k)
    })
    // Also a base token can be released on 6
    const names = ['A', 'B', 'C', 'D']
    const curPlayer = g.players[idx]
    const c = COLORS[PCOLORS[g.colorIdx[idx]]]
    let hold = false

    let msg = '🎲 ' + c.emoji + ' ' + c.name + ' tiró: *' + r + '*'
    if (movable.length) {
        msg += '\n\nFichas que pueden moverse ' + r + ' pasos:\n' + movable.map(k => '`' + names[k] + '` ' + fmtPos(g, idx, g.tokens[idx][k])).join('\n')
    }
    if (based.length && r === 6) {
        if (movable.length) msg += '\n\nTambién puedes sacar una ficha de la base escribiendo su letra.'
        else msg += '\n\n¡Sacaste un 6! Elige una ficha de la base para sacarla: ' + based.map(k => '`' + names[k] + '`').join(' ')
    }

    if (!movable.length && !(based.length && r === 6)) {
        // cannot move: end turn
        msg += '\n\n😅 No puedes mover. Pierdes el turno.'
        g.turn = nextIdx(g)
        sock.sendMessage(m.chat, { text: msg, mentions: [curPlayer] }).catch(() => {})
        announceTurn(sock, m, g)
        return null
    }

    g.pending = { roll: r, movable, based: based.length && r === 6 ? based : [] }
    sock.sendMessage(m.chat, { text: msg, mentions: [curPlayer] }).catch(() => {})
    return g.pending
}

function resolveMove(sock, m, g, input) {
    const names = ['A', 'B', 'C', 'D']
    const pick = input.toLowerCase()
    const idx = g.turn
    const curPlayer = g.players[idx]
    const c = COLORS[PCOLORS[g.colorIdx[idx]]]
    const pr = g.pending
    if (!pr) { m.reply('❌ Primero escribe *tirar*.'); return true }
    const k = names.map(x => x.toLowerCase()).indexOf(pick)
    if (k < 0) { m.reply('❌ Elige ficha: `a`, `b`, `c` o `d`.'); return true }

    const rel = g.tokens[idx][k]
    let captured = null
    if (rel === -1) {
        // release from base (must have rolled 6 and chosen a based token)
        if (!pr.based.includes(k)) { m.reply('❌ Solo puedes sacar ficha con un 6 (y elegir una de la base).'); return true }
        // check collision on start cell: if opponent token on start, capture it
        const st = absCell(g.colorIdx[idx], 0)
        for (let oi = 0; oi < g.players.length; oi++) {
            if (oi === idx) continue
            for (let ok = 0; ok < g.tokens[oi].length; ok++) {
                const ot = g.tokens[oi][ok]
                if (ot >= 0 && ot < HOME_IN && absCell(g.colorIdx[oi], ot) === st) { g.tokens[oi][ok] = -1; captured = oi }
            }
        }
        g.tokens[idx][k] = 0
        let msg = '🏃 ' + c.emoji + ' @' + curPlayer.split('@')[0] + ' sacó la ficha *' + names[k] + '* de la base.'
        if (captured !== null) { const cc = COLORS[PCOLORS[g.colorIdx[captured]]]; msg += '\n💥 ¡Capturó la ficha rival de ' + cc.name + '!' }
        g.pending = null
        sock.sendMessage(m.chat, { text: msg, mentions: [curPlayer] }).catch(() => {})
        applyExtraOrPass(sock, m, g, true)
        return true
    }

    // normal move
    if (rel >= ARRIVED) { m.reply('❌ Esa ficha ya llegó a meta.'); return true }
    if (rel >= HOME_IN && rel + pr.roll > ARRIVED) { m.reply('❌ Esa ficha no puede avanzar ' + pr.roll + ' pasos (llegaría más allá de la meta).'); return true }
    if (!pr.movable.includes(k)) { m.reply('❌ Esa ficha no puede moverse ' + pr.roll + ' pasos.'); return true }

    let mr = rel + pr.roll
    if (mr > ARRIVED) mr = ARRIVED
    // capture if landing on main track (mr < HOME_IN) and not safe
    if (mr < HOME_IN) {
        const cell = absCell(g.colorIdx[idx], mr)
        const isSafe = [0, 13, 26, 39].includes(cell)
        if (!isSafe) {
            for (let oi = 0; oi < g.players.length; oi++) {
                if (oi === idx) continue
                for (let ok = 0; ok < g.tokens[oi].length; ok++) {
                    const ot = g.tokens[oi][ok]
                    if (ot >= 0 && ot < HOME_IN && absCell(g.colorIdx[oi], ot) === cell) { g.tokens[oi][ok] = -1; captured = oi }
                }
            }
        }
    }
    g.tokens[idx][k] = mr
    let msg = '🎲 ' + c.emoji + ' @' + curPlayer.split('@')[0] + ' movió *' + names[k] + '* a ' + fmtPos(g, idx, mr) + '.'
    if (captured !== null) { const cc = COLORS[PCOLORS[g.colorIdx[captured]]]; msg += '\n💥 ¡Capturaste la ficha de ' + cc.name + '!' }
    if (mr === ARRIVED) msg += '\n🏁 ¡Ficha llegó a meta!'
    g.pending = null
    sock.sendMessage(m.chat, { text: msg, mentions: [curPlayer] }).catch(() => {})

    // check win
    if (g.tokens[idx].every(t => t === ARRIVED)) {
        const db = getDatabase()
        try { db.updateBerry(curPlayer, WIN_REWARD) } catch (e) {}
        clearTimeout(g.timeout)
        sock.sendMessage(m.chat, {
            text: '🏆 *¡LUDO!* 🎲\n\n🎉 ' + c.emoji + ' @' + curPlayer.split('@')[0] + ' llevó sus 4 fichas a la meta y GANA!\n> +' + WIN_REWARD + '💰',
            mentions: g.players
        }).catch(() => {})
        delete global.ludoGames[g.id]
        return true
    }

    applyExtraOrPass(sock, m, g, pr.roll === 6)
    return true
}

function applyExtraOrPass(sock, m, g, extra) {
    if (extra) { announceTurn(sock, m, g); return }
    g.turn = nextIdx(g)
    announceTurn(sock, m, g)
}

async function handler(m, { sock }) {
    const existing = Object.values(global.ludoGames).find(r => r.status === 'playing' && r.players.includes(m.sender))
    if (existing) return m.reply('❌ Ya estás en una partida de Ludo en curso.')

    let targets = []
    if (m.quoted) targets = [m.quoted.sender]
    else if (m.mentionedJid) targets = m.mentionedJid.slice(0, 3)

    if (!targets.length) {
        return m.reply('🎲 *LUDO*\n\n' + rulesText() + '\n\n👉 Para jugar etiqueta a tus rivales (2-4 jugadores):\n> `.ludo @jugador2 @jugador3`')
    }

    const players = [m.sender, ...targets]
    if (new Set(players).size !== players.length) return m.reply('❌ No puedes invitarte a ti mismo o repetir jugadores.')
    if (players.length < 2 || players.length > 4) return m.reply('❌ Ludo se juega de 2 a 4 jugadores.')
    for (const t of targets) {
        if (Object.values(global.ludoGames).some(r => r.players.includes(t) && r.status === 'playing'))
            return m.reply('❌ Alguien ya está jugando Ludo.')
    }

    const roomId = 'ludo_' + Date.now()
    const g = {
        id: roomId, chat: m.chat, players,
        colorIdx: players.map((_, i) => i),
        tokens: players.map(() => [-1, -1, -1, -1]),
        accepted: { [m.sender]: true },
        status: 'waiting', turn: 0, pending: null, createdAt: Date.now()
    }
    global.ludoGames[roomId] = g
    g.timeout = setTimeout(() => { if (global.ludoGames[roomId]) { sock.sendMessage(m.chat, { text: '⏱️ Tiempo agotado, partida cancelada.', mentions: g.players }); delete global.ludoGames[roomId] } }, TIMEOUT)

    await m.react('🎲')
    const inv = players.map(p => p === m.sender ? '👤 Tú (host)' : '👥 @' + p.split('@')[0]).join('\n')
    await m.reply('🎲 *LUDO · INVITACIÓN*\n\nJugadores:\n' + inv +
        '\n\nEsperando que @' + targets.map(t => t.split('@')[0]).join(' y @') + ' escriban *acepto* / *ok*.\n' +
        'Las reglas se muestran al comenzar. Time: 3 min', { mentions: targets })
}

async function answerHandler(m, sock) {
    if (!m.body) return false
    const text = m.body.trim().toLowerCase()

    let g = null, roomId = null
    for (const [id, r] of Object.entries(global.ludoGames)) {
        if (r.status === 'waiting' && r.players.includes(m.sender) && r.chat === m.chat) { g = r; roomId = id; break }
        if (r.status === 'playing' && r.players.includes(m.sender)) { g = r; roomId = id; break }
    }
    if (!g) return false

    if (g.status === 'waiting') {
        if (/^(acept(o|ar)?|acepto|terima|gas|oke?|ok|iya|yoi|vale|dale|vamos|claro|si|sip)$/i.test(text)) {
            g.accepted[m.sender] = true
            if (g.players.every(p => g.accepted[p])) {
                clearTimeout(g.timeout)
                const first = g.players[0]
                const c = COLORS[PCOLORS[g.colorIdx[0]]]
                sock.sendMessage(m.chat, {
                    text: '🎲 *¡LUDO COMIENZA!*\n\n' + rulesText() +
                        '\n\n🎯 Empieza ' + c.emoji + ' @' + first.split('@')[0] + ' — escribe *tirar*.\n\n' + renderBoard(g),
                    mentions: g.players
                }).catch(() => {})
                g.status = 'playing'
            } else {
                m.reply('✅ Aceptado! Esperando a ' + g.players.filter(p => !g.accepted[p]).map(p => '@' + p.split('@')[0]).join(', '))
            }
            return true
        }
        if (/^(no|nope|rechaz|rechazo|negat|no quiero)$/i.test(text)) {
            clearTimeout(g.timeout)
            sock.sendMessage(m.chat, { text: '❌ @' + m.sender.split('@')[0] + ' rechazó. Partida cancelada.', mentions: g.players })
            delete global.ludoGames[roomId]
            return true
        }
        return false
    }

    if (/^(reglas|regla|help|ayuda)$/i.test(text)) { m.reply(rulesText()); return true }
    if (/^(fichas|mis fichas|tokens)$/i.test(text)) { const pi = g.players.indexOf(m.sender); m.reply('🎲 *TUS FICHAS*\n\n' + handStr(g, pi)); return true }
    if (/^(tablero|board|mesa)$/i.test(text)) { m.reply('🎲 *TABLERO*\n\n' + renderBoard(g)); return true }

    if (g.players[g.turn] !== m.sender) return m.reply('⏳ Aún no es tu turno.')

    if (/^(tirar|rola|dado|roll|jugar|tira)$/i.test(text)) {
        rollTurn(sock, m, g)
        return true
    }
    if (/^(a|b|c|d|ficha a|ficha b|ficha c|ficha d)$/i.test(text)) {
        const pick = text.split(' ').pop()
        return resolveMove(sock, m, g, pick)
    }
    return false
}

export { pluginConfig as config, handler, answerHandler }
