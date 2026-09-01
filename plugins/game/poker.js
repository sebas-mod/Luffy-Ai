import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'poker',
    alias: ['pokerpvp', 'cartas'],
    category: 'game',
    description: 'Póker de 5 cartas multijugador (2 jugadores) por privado',
    usage: '.poker @jugador2',
    example: '.poker @628xxx',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    isEnabled: true
}

if (!global.pokerGames) global.pokerGames = {}

const TIMEOUT = 180000
const WIN_REWARD = 1500
const SUITS = { s: '♠', h: '♥', d: '♦', c: '♣' }
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const RANKVAL = { 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, '10': 10, J: 11, Q: 12, K: 13, A: 14 }

// Hand rank ids (higher = better)
const RANK = {
    HIGH_CARD: 0, PAIR: 1, TWO_PAIR: 2, THREE: 3, STRAIGHT: 4,
    FLUSH: 5, FULL_HOUSE: 6, FOUR: 7, STRAIGHT_FLUSH: 8, ROYAL: 9
}
const RANK_LABEL = {
    0: 'Carta alta', 1: 'Par', 2: 'Doble par', 3: 'Trío', 4: 'Escalera',
    5: 'Color', 6: 'Full', 7: 'Póker', 8: 'Escalera de color', 9: 'Escalera real'
}

function newDeck() {
    const deck = []
    for (const r of RANKS) {
        for (const s of Object.keys(SUITS)) deck.push({ r, s })
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
function cardStr(c) {
    return c.r + SUITS[c.s]
}
function handStr(h) {
    return h.map((c, i) => (i + 1) + '. ' + cardStr(c)).join('\n')
}

// Evaluate a 5-card hand -> { rank, tiebreakers: number[], label }
function evaluateHand(hand) {
    const ranks = hand.map(c => RANKVAL[c.r]).sort((a, b) => b - a)
    const suits = hand.map(c => c.s)
    const count = {}
    for (const r of ranks) count[r] = (count[r] || 0) + 1

    const groups = Object.entries(count).map(([v, n]) => ({ v: Number(v), n }))
    groups.sort((a, b) => b.n - a.n || b.v - a.v)

    const isFlush = suits.every(s => s === suits[0])

    // straight (ace low -> treat A as 1)
    let isStraight = false
    let straightHigh = 0
    let uniq = [...new Set(ranks)].sort((a, b) => b - a)
    if (uniq.length === 5) {
        if (uniq[0] - uniq[4] === 4) { isStraight = true; straightHigh = uniq[0] }
        else if (uniq[0] === 14 && uniq[1] === 5 && uniq[4] === 2) { isStraight = true; straightHigh = 5 } // wheel A-2-3-4-5
    }

    if (isFlush && isStraight) {
        if (straightHigh === 14) return { rank: RANK.ROYAL, tiebreakers: [14], label: RANK_LABEL[RANK.ROYAL] }
        return { rank: RANK.STRAIGHT_FLUSH, tiebreakers: [straightHigh], label: RANK_LABEL[RANK.STRAIGHT_FLUSH] }
    }
    if (groups[0].n === 4) return { rank: RANK.FOUR, tiebreakers: [groups[0].v, groups[1].v], label: RANK_LABEL[RANK.FOUR] }
    if (groups[0].n === 3 && groups[1].n === 2) return { rank: RANK.FULL_HOUSE, tiebreakers: [groups[0].v, groups[1].v], label: RANK_LABEL[RANK.FULL_HOUSE] }
    if (isFlush) return { rank: RANK.FLUSH, tiebreakers: ranks, label: RANK_LABEL[RANK.FLUSH] }
    if (isStraight) return { rank: RANK.STRAIGHT, tiebreakers: [straightHigh], label: RANK_LABEL[RANK.STRAIGHT] }
    if (groups[0].n === 3) return { rank: RANK.THREE, tiebreakers: [groups[0].v, ...ranks.filter(r => r !== groups[0].v)], label: RANK_LABEL[RANK.THREE] }
    if (groups[0].n === 2 && groups[1].n === 2) {
        const pairVals = groups.slice(0, 2).map(x => x.v).sort((a, b) => b - a)
        const kicker = groups.find(g => g.n === 1).v
        return { rank: RANK.TWO_PAIR, tiebreakers: [...pairVals, kicker], label: RANK_LABEL[RANK.TWO_PAIR] }
    }
    if (groups[0].n === 2) {
        const kickers = ranks.filter(r => r !== groups[0].v)
        return { rank: RANK.PAIR, tiebreakers: [groups[0].v, ...kickers], label: RANK_LABEL[RANK.PAIR] }
    }
    return { rank: RANK.HIGH_CARD, tiebreakers: ranks, label: RANK_LABEL[RANK.HIGH_CARD] }
}

function compare(ev1, ev2) {
    if (ev1.rank !== ev2.rank) return ev1.rank - ev2.rank
    for (let i = 0; i < Math.max(ev1.tiebreakers.length, ev2.tiebreakers.length); i++) {
        const a = ev1.tiebreakers[i] || 0
        const b = ev2.tiebreakers[i] || 0
        if (a !== b) return a - b
    }
    return 0 // exact tie
}

function rulesText() {
    return '🃏 *REGLAS DEL PÓKER* 🃏\n\n' +
        'Cada jugador recibe *5 cartas* por privado.\n\n' +
        '🎯 *FASE 1 — APUESTAS:*\n' +
        'En tu turno escribe `apostar` (subes 100 al pozo común) o `pasar` (igualas, sin subir).\n' +
        'Ambos jugadores deben completar esta fase: quien pasa marca *pasar*, ambos deben pasar/apostar para avanzar.\n\n' +
        '🎴 *FASE 2 — DESCARTE:*\n' +
        'Puedes cambiar hasta *3 cartas* escribiendo `cambiar <índices>` (1-5, ej: `cambiar 1 3 4`).\n' +
        'O escribe `plantarse` para mantener tus 5 cartas.\n\n' +
        '🏆 *SHOWDOWN:*\n' +
        'Se comparan las manos con reglas reales de póker (escalera real > escalera de color > póker > full > color > escalera > trío > doble par > par > carta alta).\n' +
        'El ganador recibe +' + WIN_REWARD + '💰.\n\n' +
        '⌨️ *Comandos:* `reglas` · `mano` (tu mano por privado) · `pote`/`masa` (pozo) · `salir`/`alto` (solo creador)'
}

function startGame(sock, m, roomId, g) {
    const deck = shuffle(newDeck())
    g.deck = deck
    g.hands = {}
    for (const p of g.players) {
        g.hands[p] = []
        for (let i = 0; i < 5; i++) g.hands[p].push(deck.pop())
    }
    g.pot = 0
    g.status = 'playing'
    g.state = 'bet'          // 'bet' then 'draw'
    g.turn = 0
    clearTimeout(g.timeout)
    g.timeout = setTimeout(() => endTimeout(sock, m, roomId, g), TIMEOUT)

    for (const p of g.players) {
        sock.sendMessage(p, { text: '🃏 *TU MANO (PÓKER)*\n\n' + handStr(g.hands[p]) + '\n\nMantén en secreto tu mano. Usa `mano` para verla de nuevo.' }).catch(() => {})
    }

    const first = g.players[0]
    sock.sendMessage(m.chat, {
        text: '🎮 *¡PÓKER COMIENZA!*\n\n🂠 Se repartieron 5 cartas a cada jugador POR PRIVADO.\n🪙 Pozo inicial: *0*\n\n' + rulesText() +
            '\n\n🎯 *FASE DE APUESTAS* — turno de @' + first.split('@')[0] + ' — escribe `apostar` o `pasar`.',
        mentions: g.players
    }).catch(() => {})
}

function nextIdx(g) { return (g.turn + 1) % g.players.length }

function otherIdx(g) { return nextIdx(g) }

function broadcast(sock, m, g, txt) {
    sock.sendMessage(m.chat, { text: txt, mentions: g.players }).catch(() => {})
}

function announceTurn(sock, m, g) {
    const cur = g.players[g.turn]
    const p = g.state === 'bet'
        ? 'escribe `apostar` o `pasar`'
        : 'escribe `cambiar <índices>` (ej: `cambiar 1 3`) o `plantarse`'
    broadcast(sock, m, g, '🎯 Turno de @' + cur.split('@')[0] + ' — ' + p + '. Pozo: *' + g.pot + '💰*')
}

function announceDrawTurn(sock, m, g) {
    const cur = g.players[g.turn]
    const others = g.players.filter(p => p !== cur)
    sock.sendMessage(cur, { text: '🃏 *FASE DE DESCARTE (PÓKER)*\n\nTu mano actual:\n' + handStr(g.hands[cur]) + '\n\nEscribe `cambiar <índices>` (máx 3, 1-5) o `plantarse`.', mentions: [cur] }).catch(() => {})
    broadcast(sock, m, g, '🎴 *FASE DE DESCARTE* — @' + cur.split('@')[0] + ' puede cambiar hasta 3 cartas. (' + others.map(o => '@' + o.split('@')[0]).join(', ') + ' espera).')
}

function completeFaseApuesta(sock, m, g) {
    broadcast(sock, m, g, '✅ *FASE DE APUESTAS COMPLETADA.*\n🪙 Pozo final: *' + g.pot + '💰*')
    g.state = 'draw'
    g.turn = 0
    g.drawn = {}
    announceDrawTurn(sock, m, g)
}

function completeFaseDescarte(sock, m, g) {
    clearTimeout(g.timeout)
    showdown(sock, m, g)
}

async function showdown(sock, m, g) {
    const [p1, p2] = g.players
    const ev1 = evaluateHand(g.hands[p1])
    const ev2 = evaluateHand(g.hands[p2])
    const cmp = compare(ev1, ev2)
    const winner = cmp > 0 ? p1 : (cmp < 0 ? p2 : null)

    let txt = '🏁 *SHOWDOWN — RESULTADOS*\n\n'
    txt += '🧑 @' + p1.split('@')[0] + ':\n' + g.hands[p1].map(cardStr).join(' ') + '\n➜ *' + ev1.label + '*\n\n'
    txt += '🧑 @' + p2.split('@')[0] + ':\n' + g.hands[p2].map(cardStr).join(' ') + '\n➜ *' + ev2.label + '*\n\n'

    if (!winner) {
        txt += '🤝 ¡EMPATE! Se reparte el pozo de *' + g.pot + '💰*.'
        sock.sendMessage(m.chat, { text: txt, mentions: g.players }).catch(() => {})
        delete global.pokerGames[g.id]
        return
    }

    txt += '🏆 *GANADOR: @' + winner.split('@')[0] + '*\n> Lleva el pozo (' + g.pot + '💰 virtual) y recibe +' + WIN_REWARD + '💰 reales.'
    const db = getDatabase()
    try { db.updateBerry(winner, WIN_REWARD) } catch (e) {}
    sock.sendMessage(m.chat, { text: txt, mentions: g.players }).catch(() => {})
    delete global.pokerGames[g.id]
}

async function endTimeout(sock, m, roomId, g) {
    if (!global.pokerGames[roomId]) return
    sock.sendMessage(m.chat, { text: '⏱️ Tiempo agotado. Partida de Póker cancelada.', mentions: g.players }).catch(() => {})
    delete global.pokerGames[roomId]
}

// --- lobby ---
async function handler(m, { sock }) {
    const existing = Object.values(global.pokerGames).find(r => r.status === 'playing' && r.players.includes(m.sender))
    if (existing) return m.reply('❌ Ya estás en una partida de Póker en curso.')

    let targets = []
    if (m.quoted) targets = [m.quoted.sender]
    else if (m.mentionedJid) targets = m.mentionedJid.slice(0, 1)

    if (!targets.length) {
        return m.reply('🃏 *PÓKER*\n\n' + rulesText() + '\n\n👉 Para jugar etiqueta a tu rival:\n> `.poker @jugador2`')
    }

    const players = [m.sender, ...targets]
    if (new Set(players).size !== players.length) return m.reply('❌ No puedes invitarte a ti mismo o repetir jugadores.')
    if (players.length < 2 || players.length > 2) return m.reply('❌ Póker se juega de 2 jugadores.')
    for (const t of targets) {
        if (Object.values(global.pokerGames).some(r => r.players.includes(t) && r.status === 'playing'))
            return m.reply('❌ Alguien ya está jugando Póker.')
    }

    const roomId = 'poker_' + Date.now()
    const g = {
        id: roomId, chat: m.chat, players,
        accepted: { [m.sender]: true },
        status: 'waiting', deck: null, hands: null, pot: 0,
        turn: -1, state: 'bet', drawn: null, createdAt: Date.now()
    }
    global.pokerGames[roomId] = g
    g.timeout = setTimeout(() => endTimeout(sock, m, roomId, g), TIMEOUT)

    await m.react('🃏')
    const inv = players.map(p => p === m.sender ? '👤 Tú (host)' : '👥 @' + p.split('@')[0]).join('\n')
    await m.reply('🃏 *PÓKER · INVITACIÓN*\n\nJugadores:\n' + inv +
        '\n\nEsperando que @' + targets.map(t => t.split('@')[0]).join(' y @') + ' escriban *acepto* / *ok*.\n' +
        'Las reglas se muestran al comenzar. Time: 3 min', { mentions: targets })
}

async function answerHandler(m, sock) {
    if (!m.body) return false
    const text = m.body.trim().toLowerCase()

    let g = null, roomId = null
    for (const [id, r] of Object.entries(global.pokerGames)) {
        if (r.status === 'waiting' && r.players.includes(m.sender) && r.chat === m.chat) { g = r; roomId = id; break }
        if (r.status === 'playing' && r.players.includes(m.sender)) { g = r; roomId = id; break }
    }
    if (!g) return false

    if (g.status === 'waiting') {
        if (/^(acept(o|ar)?|acepto|terima|gas|oke?|ok|iya|yoi|vale|dale|vamos|claro|si|sip)$/i.test(text)) {
            g.accepted[m.sender] = true
            if (g.players.every(p => g.accepted[p])) {
                clearTimeout(g.timeout)
                g.status = 'playing'
                startGame(sock, m, roomId, g)
            } else {
                m.reply('✅ Aceptado! Esperando a ' + g.players.filter(p => !g.accepted[p]).map(p => '@' + p.split('@')[0]).join(', '))
            }
            return true
        }
        if (/^(no|nope|rechaz|rechazo|negat|no quiero)$/i.test(text)) {
            clearTimeout(g.timeout)
            sock.sendMessage(m.chat, { text: '❌ @' + m.sender.split('@')[0] + ' rechazó. Partida cancelada.', mentions: g.players })
            delete global.pokerGames[roomId]
            return true
        }
        return false
    }

    // ---- in-game generic commands ----
    if (/^(reglas|regla|help|ayuda)$/i.test(text)) { m.reply(rulesText()); return true }
    if (/^(mano|mis cartas|cartas)$/i.test(text)) {
        if (!g.hands[m.sender]) return false
        m.reply('🃏 *TU MANO (PÓKER)*\n\n' + handStr(g.hands[m.sender]))
        return true
    }
    if (/^(masa|pote|pot|pozo)$/i.test(text)) {
        m.reply('🪙 *POZO:* ' + g.pot + '💰')
        return true
    }
    if (/^(salir|alto|abortar|cancelar|terminar)$/i.test(text)) {
        if (m.sender !== g.players[0]) { m.reply('❌ Solo el creador puede cancelar.'); return true }
        clearTimeout(g.timeout)
        sock.sendMessage(m.chat, { text: '🛑 Partida de Póker cancelada por su creador.', mentions: g.players })
        delete global.pokerGames[roomId]
        return true
    }

    // must be that player's turn for gameplay
    if (g.status !== 'playing') return false
    if (g.players[g.turn] !== m.sender) return m.reply('⏳ Aún no es tu turno.')

    const cur = m.sender
    const idx = g.turn

    if (g.state === 'bet') {
        if (/^(apost(ar|a)?|subir|bet)$/i.test(text)) {
            g.pot += 100
            g.actions = g.actions || {}
            g.actions[cur] = 'apostar'
            clearTimeout(g.timeout)
            g.timeout = setTimeout(() => endTimeout(sock, m, roomId, g), TIMEOUT)
            const oi = otherIdx(g)
            if (g.actions[g.players[oi]] === 'pasar') {
                // other already passed -> advance
                g.turn = oi
                broadcast(sock, m, g, '➕ @' + cur.split('@')[0] + ' apostó 100. Pozo: *' + g.pot + '💰*')
                g.turn = oi
                // other passed already; now other must act (they may pass/apostar)
                announceTurn(sock, m, g)
                return true
            }
            g.turn = oi
            broadcast(sock, m, g, '➕ @' + cur.split('@')[0] + ' apostó 100. Pozo: *' + g.pot + '💰*\n\n🎯 Turno de @' + g.players[oi].split('@')[0] + ' — escribe `apostar` o `pasar`.')
            return true
        }
        if (/^(pasar|pass|chec(k)?|check)$/i.test(text)) {
            g.actions = g.actions || {}
            g.actions[cur] = 'pasar'
            clearTimeout(g.timeout)
            g.timeout = setTimeout(() => endTimeout(sock, m, roomId, g), TIMEOUT)
            const oi = otherIdx(g)
            const otherActed = g.actions[g.players[oi]] !== undefined
            if (otherActed) {
                completeFaseApuesta(sock, m, g)
                return true
            }
            g.turn = oi
            broadcast(sock, m, g, '⏸️ @' + cur.split('@')[0] + ' pasó.\n\n🎯 Turno de @' + g.players[oi].split('@')[0] + ' — escribe `apostar` o `pasar`.')
            return true
        }
        return false
    }

    if (g.state === 'draw') {
        if (/^(plantar(se)?|plant|stay|quedar)$/i.test(text)) {
            g.drawn = g.drawn || {}
            g.drawn[cur] = true
            doDraw(sock, m, g, cur, [])
            return true
        }
        const cm = text.match(/^cambiar\s+([1-5](?:\s+[1-5]){0,2})$/i)
        if (cm) {
            const idxs = [...new Set(cm[1].split(/\s+/).map(x => Number(x)))]
            if (idxs.length > 3) return m.reply('❌ Máximo 3 cartas.')
            if (idxs.length === 0) return m.reply('❌ Indica índices entre 1 y 5. Ej: `cambiar 1 3 4`.')
            const uniq = new Set(idxs)
            if (uniq.size !== idxs.length) return m.reply('❌ Índices repetidos.')
            for (const i of idxs) if (i < 1 || i > 5) return m.reply('❌ Índices válidos: 1-5.')
            g.drawn = g.drawn || {}
            g.drawn[cur] = true
            doDraw(sock, m, g, cur, idxs)
            return true
        }
        return false
    }

    return false
}

function doDraw(sock, m, g, cur, idxs) {
    // replace given indices with new cards
    const hand = g.hands[cur]
    g.drawn = g.drawn || {}
    for (const i of idxs) {
        if (!g.deck.length) g.deck = shuffle(newDeck())
        hand[i - 1] = g.deck.pop()
    }
    let msg = '🃏 Cambiaste ' + idxs.length + ' carta(s).\n\n*TU NUEVA MANO:*\n' + handStr(hand)
    if (idxs.length === 0) msg = '😐 Te plantaste. Mantienes tu mano:\n' + handStr(hand)
    sock.sendMessage(cur, { text: msg }).catch(() => {})

    clearTimeout(g.timeout)
    g.timeout = setTimeout(() => endTimeout(sock, m, g.id, g), TIMEOUT)

    const oi = otherIdx(g)
    const other = g.players[oi]
    if (g.drawn[other]) {
        completeFaseDescarte(sock, m, g)
    } else {
        g.turn = oi
        announceDrawTurn(sock, m, g)
    }
}

export { pluginConfig as config, handler, answerHandler }
