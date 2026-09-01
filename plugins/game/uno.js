import { getDatabase } from '../../src/lib/luffy-database.js'
const pluginConfig = {
    name: 'uno',
    alias: ['uno1', 'cartas'],
    category: 'game',
    description: 'Juega al UNO multijugador (2-4 jugadores) por turnos',
    usage: '.uno @tag1 @tag2',
    example: '.uno @628xxx @628yyy',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    isEnabled: true
}

if (!global.unoGames) global.unoGames = {}

const TIMEOUT = 120000
const WIN_REWARD = 1000
const COLOR = { r: '🔴', y: '🟡', g: '🟢', b: '🔵', w: '🃏' }
const COLORNAME = { r: 'Rojo', y: 'Amarillo', g: 'Verde', b: 'Azul', w: 'Comodín' }
const COLORWORD = { rojo: 'r', red: 'r', amarillo: 'y', yellow: 'y', verde: 'g', green: 'g', azul: 'b', blue: 'b' }
const VALWORD = { '0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9','+2':'+2',dos:'+2',saltar:'skip',salta:'skip',skip:'skip',reversa:'rev',revert:'rev',reverse:'rev',rev:'rev' }

function makeDeck() {
    const deck = []
    for (const c of ['r', 'y', 'g', 'b']) {
        deck.push({ c, v: '0' })
        for (const v of ['1', '2', '3', '4', '5', '6', '7', '8', '9', '+2', 'rev', 'skip']) {
            deck.push({ c, v }, { c, v })
        }
    }
    for (let i = 0; i < 4; i++) deck.push({ c: 'w', v: 'wild' })
    for (let i = 0; i < 4; i++) deck.push({ c: 'w', v: '+4' })
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
    const sy = c.c === 'w' ? '🃏' : COLOR[c.c]
    if (c.v === 'wild') return sy + ' Cambio de color'
    if (c.v === '+4') return sy + ' +4'
    if (c.v === '+2') return sy + ' +2'
    if (c.v === 'rev') return sy + ' Reversa'
    if (c.v === 'skip') return sy + ' Saltar'
    return sy + ' ' + c.v
}
function handStr(h) {
    return h.map((c, i) => (i + 1) + '. ' + cardStr(c)).join('\n')
}
function canPlay(handCard, top) {
    if (handCard.c === 'w') return true
    if (handCard.c === top.c) return true
    if (handCard.v === top.v) return true
    return false
}
function findCard(h, c, v) {
    for (let i = 0; i < h.length; i++) if (h[i].c === c && h[i].v === v) return i
    return -1
}

function rulesText() {
    return '🃏 *REGLA DEL UNO*\n\n' +
        'Se reparten *7 cartas* a cada jugador y 1 carta inicial en la mesa.\n\n' +
        '🎴 *En tu turno escribe:*\n' +
        '> `rojo 5`, `verde +2`, `azul saltar`, `amarillo reversa`\n' +
        '> `cambio <color>`, `+4 <color>`\n' +
        '> `robar` si no tienes carta jugable\n' +
        '> `mano` para ver tus cartas · `reglas` para esto\n\n' +
        '✅ Debes jugar del *mismo color* o *mismo valor*, o un comodín.\n\n' +
        '🔁 *Especiales:*\n' +
        '> `+2` → el siguiente roba 2\n' +
        '> `saltar` → el siguiente pierde turno\n' +
        '> `reversa` → cambia la dirección\n' +
        '> `cambio` → eliges el color · `+4` → el siguiente roba 4\n\n' +
        '🏆 El primero en quedarse sin cartas GANA (+' + WIN_REWARD + '💰). **Grita "UNO" cuando te quede 1 carta!**'
}

function startGame(sock, m, roomId, g) {
    let deck = shuffle(makeDeck())
    const hands = {}
    for (const p of g.players) { hands[p] = []; for (let i = 0; i < 7; i++) hands[p].push(deck.pop()) }
    g.deck = deck; g.hands = hands; g.pile = [deck.pop()]
    g.status = 'playing'; g.turn = 0; g.dir = 1; g.state = 'play'; g.pendingColor = null
    g.timeout = setTimeout(() => endTimeout(sock, m, roomId, g), TIMEOUT)

    const first = g.pile[g.pile.length - 1]
    let txt = '🎮 *¡UNO COMIENZA!*\n\nPrimera carta: *' + cardStr(first) +
        '*\n\n' + rulesText() + '\n\n🎯 Turno de @' + g.players[0].split('@')[0]
    sock.sendMessage(m.chat, { text: txt, mentions: g.players })
    for (const p of g.players) {
        const pm = '🃏 *TU MANO (UNO)*\n\n' + handStr(hands[p])
        sock.sendMessage(p, { text: pm }).catch(() => {})
    }
}

function nextIdx(g) { return (g.turn + g.dir + g.players.length) % g.players.length }
function advanceBy(g, k) {
    g.turn = (g.turn + g.dir * k + g.players.length * 100) % g.players.length
}

async function endTimeout(sock, m, roomId, g) {
    if (!global.unoGames[roomId]) return
    sock.sendMessage(m.chat, { text: '⏱️ Tiempo agotado. Partida de UNO cancelada.', mentions: g.players })
    delete global.unoGames[roomId]
}

function broadcast(sock, m, g, txt) {
    sock.sendMessage(m.chat, { text: txt, mentions: g.players })
}

function announceTurn(sock, m, g) {
    const top = g.pile[g.pile.length - 1]
    const nxt = g.players[g.turn]
    broadcast(sock, m, g,
        '🃏 Carta en mesa: *' + cardStr(top) + '*\n' +
        'Dirección: ' + (g.dir > 0 ? '➡️ horario' : '⬅️ antihorario') + '\n\n' +
        '🎯 Turno de @' + nxt.split('@')[0] + ' — escribe tu carta o `robar`',
        )
}

function winGame(sock, m, g, winner) {
    const db = getDatabase()
    db.updateBerry(winner, WIN_REWARD)
    for (const p of g.players) {
        if (p !== winner) sock.sendMessage(p, { text: '🏁 La partida de UNO terminó. Ganó @' + winner.split('@')[0], mentions: [winner] }).catch(() => {})
    }
    broadcast(sock, m, g,
        '🏆 *¡UNO!* 🎮\n\n🎉 @' + winner.split('@')[0] + ' se quedó sin cartas y GANA!\n> +' + WIN_REWARD + '💰',
        )
    const roomId = Object.keys(global.unoGames).find(k => global.unoGames[k] === g)
    if (roomId) { clearTimeout(g.timeout); delete global.unoGames[roomId] }
}

function drawN(sock, g, j, n) {
    for (let i = 0; i < n; i++) {
        if (!g.deck.length) g.deck = shuffle(makeDeck())
        g.hands[j].push(g.deck.pop())
    }
    sock.sendMessage(j, { text: '🃏 ROBAS ' + n + ' carta(s). Nueva mano:\n' + handStr(g.hands[j]) }).catch(() => {})
}

function resolveAndAdvance(sock, m, g, card) {
    const cur = g.players[g.turn]
    if (card.v === 'wild' || card.v === '+4') {
        g.pendingCard = card
        g.state = 'chooseColor'
        broadcast(sock, m, g,
            '@' + cur.split('@')[0] + ' jugó *' + cardStr(card) + '*.\n🎨 Elige un color: `rojo`, `azul`, `verde` o `amarillo`.',
            )
        return
    }
    if (card.v === '+2') {
        const robbed = g.players[nextIdx(g)]
        drawN(sock, g, robbed, 2)
        advanceBy(g, 2)
        broadcast(sock, m, g, '➕ @' + cur.split('@')[0] + ' jugó *' + cardStr(card) + '*\n➡️ @' + robbed.split('@')[0] + ' roba 2 y pierde turno.')
    } else if (card.v === 'skip') {
        advanceBy(g, 2)
        broadcast(sock, m, g, '⏭️ ' + cardStr(card) + ' — el siguiente pierde su turno.')
    } else if (card.v === 'rev') {
        if (g.players.length === 2) { advanceBy(g, 2); broadcast(sock, m, g, '🔁 ' + cardStr(card) + ' (2 jugadores): salta turno.') }
        else { g.dir = -g.dir; advanceBy(g, 1); broadcast(sock, m, g, '🔁 ' + cardStr(card) + ': cambia la dirección!') }
    } else {
        advanceBy(g, 1)
    }
    if (g.hands[cur].length === 0) { winGame(sock, m, g, cur); return }
    announceTurn(sock, m, g)
}

function applyColor(sock, m, g, color) {
    const card = g.pendingCard
    g.pendingCard = null
    g.state = 'play'
    const cur = g.players[g.turn]
    const top = g.pile[g.pile.length - 1]
    top.c = color
    let effect = '🎨 @' + cur.split('@')[0] + ' eligió *' + COLORNAME[color] + '*'
    if (card.v === '+4') {
        drawN(sock, g, g.players[nextIdx(g)], 4)
        effect += '\n➡️ el siguiente roba 4 y pierde turno!'
        advanceBy(g, 2)
    } else {
        advanceBy(g, 1)
    }
    if (g.hands[cur].length === 0) { winGame(sock, m, g, cur); return }
    announceTurn(sock, m, g)
}

function doPlay(sock, m, g, input) {
    const cur = g.players[g.turn]
    if (m.sender !== cur) return m.reply('⏳ Aún no es tu turno.')

    if (g.state === 'chooseColor') {
        const word = input.split(' ').pop()
        const color = COLORWORD[word]
        if (!color || color === 'w') return m.reply('❌ Elige: `rojo`, `amarillo`, `verde` o `azul`.')
        applyColor(sock, m, g, color)
        return true
    }

    if (/^(robar|robo|draw|pin|pasar)$/i.test(input)) {
        if (!g.deck.length) g.deck = shuffle(makeDeck())
        const card = g.deck.pop()
        g.hands[cur].push(card)
        m.reply('🎴 Robaste 1 carta: *' + cardStr(card) + '*')
        const top = g.pile[g.pile.length - 1]
        if (canPlay(card, top) && playableCount(g, cur) === 1) {
            const idx = findCard(g.hands[cur], card.c, card.v)
            g.pile.push(g.hands[cur].splice(idx, 1)[0])
            resolveAndAdvance(sock, m, g, card)
            return true
        }
        advanceBy(g, 1)
        announceTurn(sock, m, g)
        return true
    }

    const parts = input.split(' ')
    const first = parts[0]
    const rest = parts.slice(1).join(' ')

    if (first === 'cambio' || first === 'wild') {
        const color = COLORWORD[rest]
        if (!color) return m.reply('❌ Escribe `cambio <color>` ej: `cambio rojo`.')
        const idx = findCard(g.hands[cur], 'w', 'wild')
        if (idx < 0) return m.reply('❌ No tienes carta de Cambio de color.')
        const card = g.hands[cur].splice(idx, 1)[0]
        g.pile.push(card)
        resolveAndAdvance(sock, m, g, card)
        return true
    }
    if (first === '+4' || first === '4') {
        const color = COLORWORD[rest]
        if (!color) return m.reply('❌ Escribe `+4 <color>` ej: `+4 rojo`.')
        const idx = findCard(g.hands[cur], 'w', '+4')
        if (idx < 0) return m.reply('❌ No tienes carta +4.')
        const card = g.hands[cur].splice(idx, 1)[0]
        g.pile.push(card)
        resolveAndAdvance(sock, m, g, card)
        return true
    }

    const c = COLORWORD[first]
    if (!c) return m.reply('❌ Escribe `color valor` ej: `rojo 5`. Colores: rojo, amarillo, verde, azul.')
    const v = VALWORD[rest]
    if (v === undefined) return m.reply('❌ Valor no válido: número 0-9, `+2`, `saltar`, `reversa`.')
    const idx = findCard(g.hands[cur], c, v)
    if (idx < 0) {
        const n = playableCount(g, cur)
        return m.reply('❌ No tienes esa carta.' + (n ? ' 🃏 Tienes ' + n + ' jugables.' : ' 💡 Escribe `robar`.'))
    }
    const top = g.pile[g.pile.length - 1]
    const card = g.hands[cur][idx]
    if (!canPlay(card, top)) return m.reply('❌ Esa carta no coincide con el color/valor en mesa.')
    g.hands[cur].splice(idx, 1)
    g.pile.push(card)
    resolveAndAdvance(sock, m, g, card)
    return true
}

function playableCount(g, j) {
    const top = g.pile[g.pile.length - 1]
    let n = 0
    for (const c of g.hands[j]) if (c.c === 'w' || c.c === top.c || c.v === top.v) n++
    return n
}

async function handler(m, { sock }) {
    const existing = Object.values(global.unoGames).find(r => r.status === 'playing' && r.players.includes(m.sender))
    if (existing) return m.reply('❌ Ya estás en una partida de UNO en curso.')

    let targets = []
    if (m.quoted) targets = [m.quoted.sender]
    else if (m.mentionedJid) targets = m.mentionedJid.slice(0, 3)

    if (!targets.length) {
        return m.reply('🃏 *UNO*\n\n' + rulesText() + '\n\n👉 Para jugar etiqueta a tus rivales (2-4 jugadores):\n> `.uno @jugador2 @jugador3`')
    }
    const players = [m.sender, ...targets]
    if (new Set(players).size !== players.length) return m.reply('❌ No puedes invitarte a ti mismo o repetir jugadores.')
    if (players.length < 2 || players.length > 4) return m.reply('❌ UNO se juega de 2 a 4 jugadores.')
    for (const t of targets) {
        if (Object.values(global.unoGames).some(r => r.players.includes(t) && r.status === 'playing'))
            return m.reply('❌ Alguien ya está jugando UNO.')
    }

    const roomId = 'uno_' + Date.now()
    const g = {
        id: roomId, chat: m.chat, players,
        accepted: { [m.sender]: true },
        status: 'waiting', deck: null, hands: null, pile: null,
        turn: -1, dir: 1, state: 'play', pendingColor: null, pendingCard: null, createdAt: Date.now()
    }
    global.unoGames[roomId] = g
    g.timeout = setTimeout(() => endTimeout(sock, m, roomId, g), TIMEOUT)

    await m.react('🃏')
    const inv = players.map(p => p === m.sender ? '👤 Tú (host)' : '👥 @' + p.split('@')[0]).join('\n')
    await m.reply('🃏 *UNO · INVITACIÓN*\n\nJugadores:\n' + inv +
        '\n\nEsperando que @' + targets.map(t => t.split('@')[0]).join(' y @') + ' escriban *acepto* / *ok*.\n' +
        'Las reglas se muestran al comenzar. Time: 2 min', { mentions: targets })
}

async function answerHandler(m, sock) {
    if (!m.body) return false
    const text = m.body.trim().toLowerCase()

    let g = null, roomId = null
    for (const [id, r] of Object.entries(global.unoGames)) {
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
            sock.sendMessage(m.chat, { text: '❌ @' + m.sender.split('@')[0] + ' rechazó. Partida cancelada.', mentions: g.players })
            delete global.unoGames[roomId]
            return true
        }
        return false
    }

    if (/^(reglas|regla|help|ayuda)$/i.test(text)) {
        m.reply(rulesText()); return true
    }
    if (/^(mano|mis cartas|cartas)$/i.test(text)) {
        m.reply('🃏 *TU MANO*\n\n' + handStr(g.hands[m.sender])); return true
    }
    if (/^(alto|abortar|cancelar|terminar)$/i.test(text)) {
        if (m.sender !== g.players[0]) { m.reply('❌ Solo el creador puede cancelar.'); return true }
        clearTimeout(g.timeout)
        sock.sendMessage(m.chat, { text: '🛑 Partida de UNO cancelada por su creador.', mentions: g.players })
        delete global.unoGames[roomId]
        return true
    }

    return doPlay(sock, m, g, text)
}

export { pluginConfig as config, handler, answerHandler }
