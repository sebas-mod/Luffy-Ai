import { getDatabase } from '../../src/lib/luffy-database.js'

const pluginConfig = {
    name: 'ajedrezpvp',
    alias: ['chesspvp', 'ajedrez2'],
    category: 'game',
    description: 'Ajedrez multijugador 1v1 por turnos',
    usage: '.ajedrezpvp @jugador2',
    example: '.ajedrezpvp @628xxx',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    isEnabled: true
}

if (!global.chessGames) global.chessGames = {}

const TIMEOUT = 300000
const TURN_TIMEOUT = 120000
const WIN_REWARD = 2000
const DRAW_REWARD = 500

const GLYPH = {
    K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
    k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟'
}
const KNIGHT_DELTAS = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]
const KING_DELTAS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
const DIAG = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
const STRAIGHT = [[-1, 0], [1, 0], [0, -1], [0, 1]]
const ALL_DIRS = DIAG.concat(STRAIGHT)

function colorOf(p) { return p === p.toUpperCase() ? 'w' : 'b' }

function clone(b) { return b.map(row => row.slice()) }

function toSquareName(r, c) { return String.fromCharCode(97 + c) + (8 - r) }

function initialBoard() {
    return [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ]
}

function renderBoard(g) {
    const rows = []
    for (let r = 0; r < 8; r++) {
        const cells = []
        for (let c = 0; c < 8; c++) {
            const p = g.board[r][c]
            cells.push(p ? GLYPH[p] : ((r + c) % 2 === 0 ? '·' : '▪'))
        }
        rows.push((8 - r) + ' ' + cells.join(' '))
    }
    rows.push('  a b c d e f g h')
    return rows.join('\n')
}

function roleName(g, jid) {
    return jid === g.players[0] ? '⚪ Blancas' : '⚫ Negras'
}

function isSquareAttacked(board, sq, byColor) {
    const r = sq[0], c = sq[1]
    const pawn = byColor === 'w' ? 'P' : 'p'
    const knight = byColor === 'w' ? 'N' : 'n'
    const king = byColor === 'w' ? 'K' : 'k'
    const pRow = byColor === 'w' ? r + 1 : r - 1
    for (const dc of [-1, 1]) {
        const pc = c + dc
        if (pRow >= 0 && pRow < 8 && pc >= 0 && pc < 8 && board[pRow][pc] === pawn) return true
    }
    for (const [dr, dc] of KNIGHT_DELTAS) {
        const nr = r + dr, nc = c + dc
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === knight) return true
    }
    for (const [dr, dc] of KING_DELTAS) {
        const nr = r + dr, nc = c + dc
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc] === king) return true
    }
    const bq = byColor === 'w' ? ['B', 'Q'] : ['b', 'q']
    const rq = byColor === 'w' ? ['R', 'Q'] : ['r', 'q']
    for (const [dr, dc] of DIAG) {
        let nr = r + dr, nc = c + dc
        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            const t = board[nr][nc]
            if (t) {
                if (bq.includes(t)) return true
                break
            }
            nr += dr; nc += dc
        }
    }
    for (const [dr, dc] of STRAIGHT) {
        let nr = r + dr, nc = c + dc
        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            const t = board[nr][nc]
            if (t) {
                if (rq.includes(t)) return true
                break
            }
            nr += dr; nc += dc
        }
    }
    return false
}

function findKing(board, color) {
    const k = color === 'w' ? 'K' : 'k'
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] === k) return [r, c]
        }
    }
    return null
}

function inCheck(board, color) {
    const ks = findKing(board, color)
    if (!ks) return true
    return isSquareAttacked(board, ks, color === 'w' ? 'b' : 'w')
}

function pushPawn(moves, r, c, nr, nc, color, promoRank) {
    if (promoRank) {
        for (const promo of ['q', 'r', 'b', 'n']) {
            moves.push({ from: [r, c], to: [nr, nc], piece: color === 'w' ? 'P' : 'p', promo })
        }
    } else {
        moves.push({ from: [r, c], to: [nr, nc], piece: color === 'w' ? 'P' : 'p' })
    }
}

function genPawnMoves(g, moves, r, c) {
    const board = g.board
    const color = colorOf(board[r][c])
    const dir = color === 'w' ? -1 : 1
    const start = color === 'w' ? 6 : 1
    const promoRank = color === 'w' ? 0 : 7
    const enemy = color === 'w' ? 'b' : 'w'
    const nr = r + dir
    if (nr >= 0 && nr < 8 && !board[nr][c]) {
        pushPawn(moves, r, c, nr, c, color, nr === promoRank)
        if (r === start && !board[r + 2 * dir][c]) {
            moves.push({ from: [r, c], to: [r + 2 * dir, c], piece: board[r][c] })
        }
    }
    for (const dc of [-1, 1]) {
        const nc = c + dc
        if (nc < 0 || nc > 7) continue
        const target = board[nr][nc]
        if (target && colorOf(target) === enemy) {
            pushPawn(moves, r, c, nr, nc, color, nr === promoRank)
        }
        if (!target && g.enPassant && g.enPassant[0] === nr && g.enPassant[1] === nc) {
            moves.push({ from: [r, c], to: [nr, nc], piece: board[r][c], ep: true })
        }
    }
}

function genKnightMoves(board, moves, r, c, color) {
    for (const [dr, dc] of KNIGHT_DELTAS) {
        const nr = r + dr, nc = c + dc
        if (nr < 0 || nr > 7 || nc < 0 || nc > 7) continue
        const t = board[nr][nc]
        if (!t || colorOf(t) !== color) moves.push({ from: [r, c], to: [nr, nc], piece: board[r][c] })
    }
}

function genSlidingMoves(board, moves, r, c, color, dirs) {
    for (const [dr, dc] of dirs) {
        let nr = r + dr, nc = c + dc
        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            const t = board[nr][nc]
            if (!t) {
                moves.push({ from: [r, c], to: [nr, nc], piece: board[r][c] })
            } else {
                if (colorOf(t) !== color) moves.push({ from: [r, c], to: [nr, nc], piece: board[r][c] })
                break
            }
            nr += dr; nc += dc
        }
    }
}

function genKingMoves(board, moves, r, c, color) {
    for (const [dr, dc] of KING_DELTAS) {
        const nr = r + dr, nc = c + dc
        if (nr < 0 || nr > 7 || nc < 0 || nc > 7) continue
        const t = board[nr][nc]
        if (!t || colorOf(t) !== color) moves.push({ from: [r, c], to: [nr, nc], piece: board[r][c] })
    }
}

function genCastlingMoves(g, moves, color) {
    const rank = color === 'w' ? 7 : 0
    const kingPiece = color === 'w' ? 'K' : 'k'
    const rookPiece = color === 'w' ? 'R' : 'r'
    const opp = color === 'w' ? 'b' : 'w'
    const board = g.board
    if (board[rank][4] !== kingPiece) return
    if (color === 'w') {
        if (g.castling.includes('K') && board[rank][7] === rookPiece && !board[rank][5] && !board[rank][6] &&
            !isSquareAttacked(board, [rank, 4], opp) && !isSquareAttacked(board, [rank, 5], opp) && !isSquareAttacked(board, [rank, 6], opp)) {
            moves.push({ from: [rank, 4], to: [rank, 6], piece: kingPiece, castle: 'K' })
        }
        if (g.castling.includes('Q') && board[rank][0] === rookPiece && !board[rank][1] && !board[rank][2] && !board[rank][3] &&
            !isSquareAttacked(board, [rank, 4], opp) && !isSquareAttacked(board, [rank, 3], opp) && !isSquareAttacked(board, [rank, 2], opp)) {
            moves.push({ from: [rank, 4], to: [rank, 2], piece: kingPiece, castle: 'Q' })
        }
    } else {
        if (g.castling.includes('k') && board[rank][7] === rookPiece && !board[rank][5] && !board[rank][6] &&
            !isSquareAttacked(board, [rank, 4], opp) && !isSquareAttacked(board, [rank, 5], opp) && !isSquareAttacked(board, [rank, 6], opp)) {
            moves.push({ from: [rank, 4], to: [rank, 6], piece: kingPiece, castle: 'k' })
        }
        if (g.castling.includes('q') && board[rank][0] === rookPiece && !board[rank][1] && !board[rank][2] && !board[rank][3] &&
            !isSquareAttacked(board, [rank, 4], opp) && !isSquareAttacked(board, [rank, 3], opp) && !isSquareAttacked(board, [rank, 2], opp)) {
            moves.push({ from: [rank, 4], to: [rank, 2], piece: kingPiece, castle: 'q' })
        }
    }
}

function boardAfter(g, mv) {
    const b = clone(g.board)
    const piece = g.board[mv.from[0]][mv.from[1]]
    b[mv.from[0]][mv.from[1]] = null
    let placed = piece
    if (mv.promo) placed = colorOf(piece) === 'w' ? mv.promo.toUpperCase() : mv.promo
    b[mv.to[0]][mv.to[1]] = placed
    if (mv.ep) b[mv.from[0]][mv.to[1]] = null
    if (mv.castle) {
        const rank = mv.from[0]
        if (mv.castle === 'K' || mv.castle === 'k') {
            const rook = b[rank][7]
            b[rank][7] = null
            b[rank][5] = rook
        } else {
            const rook = b[rank][0]
            b[rank][0] = null
            b[rank][3] = rook
        }
    }
    return b
}

function genMoves(g, color) {
    const board = g.board
    const pseudo = []
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c]
            if (!p || colorOf(p) !== color) continue
            const t = p.toLowerCase()
            if (t === 'p') genPawnMoves(g, pseudo, r, c)
            else if (t === 'n') genKnightMoves(board, pseudo, r, c, color)
            else if (t === 'b') genSlidingMoves(board, pseudo, r, c, color, DIAG)
            else if (t === 'r') genSlidingMoves(board, pseudo, r, c, color, STRAIGHT)
            else if (t === 'q') genSlidingMoves(board, pseudo, r, c, color, ALL_DIRS)
            else genKingMoves(board, pseudo, r, c, color)
        }
    }
    genCastlingMoves(g, pseudo, color)
    const legal = []
    for (const mv of pseudo) {
        if (!inCheck(boardAfter(g, mv), color)) legal.push(mv)
    }
    return legal
}

function gameStatus(g) {
    const color = g.turn === 0 ? 'w' : 'b'
    const legal = genMoves(g, color)
    if (!legal.length) return inCheck(g.board, color) ? 'checkmate' : 'stalemate'
    if (inCheck(g.board, color)) return 'check'
    if (g.halfmove >= 100) return 'fifty'
    return 'none'
}

function describeMove(mv) {
    if (mv.castle) return mv.castle === 'K' || mv.castle === 'k' ? 'Enroque corto 0-0' : 'Enroque largo 0-0-0'
    let s = toSquareName(mv.from[0], mv.from[1]) + toSquareName(mv.to[0], mv.to[1])
    if (mv.promo) s += mv.promo
    return s
}

function parseMove(text) {
    const s = text.toLowerCase().replace(/\s+/g, ' ').trim()
    if (/^(0-0-0|o-o-o|000|enroque largo|largo)$/.test(s)) return { type: 'castle', side: 'q' }
    if (/^(0-0|o-o|00|enroque corto|corto)$/.test(s)) return { type: 'castle', side: 'k' }
    const m = s.match(/^([a-h])\s*([1-8])\s*([a-h])\s*([1-8])\s*([qrbn])?$/)
    if (!m) return null
    return {
        type: 'move',
        from: [8 - parseInt(m[2]), m[1].charCodeAt(0) - 97],
        to: [8 - parseInt(m[4]), m[3].charCodeAt(0) - 97],
        promo: m[5] || null
    }
}

function findLegalMove(g, color, parsed) {
    const legal = genMoves(g, color)
    if (parsed.type === 'castle') {
        return legal.find(mv => mv.castle && (parsed.side === 'k' ? (mv.castle === 'K' || mv.castle === 'k') : (mv.castle === 'Q' || mv.castle === 'q'))) || null
    }
    const cands = legal.filter(mv => mv.from[0] === parsed.from[0] && mv.from[1] === parsed.from[1] && mv.to[0] === parsed.to[0] && mv.to[1] === parsed.to[1])
    if (!cands.length) return null
    if (parsed.promo) return cands.find(mv => mv.promo === parsed.promo) || null
    return cands[0]
}

function updateCastlingFlags(flags, mv) {
    let f = flags
    if (mv.piece) {
        const t = mv.piece.toLowerCase()
        if (t === 'k') {
            if (mv.from[0] === 7) f = f.replace(/[KQ]/g, '')
            if (mv.from[0] === 0) f = f.replace(/[kq]/g, '')
        }
        if (t === 'r') {
            if (mv.from[0] === 7 && mv.from[1] === 0) f = f.replace('Q', '')
            if (mv.from[0] === 7 && mv.from[1] === 7) f = f.replace('K', '')
            if (mv.from[0] === 0 && mv.from[1] === 0) f = f.replace('q', '')
            if (mv.from[0] === 0 && mv.from[1] === 7) f = f.replace('k', '')
        }
    }
    if (mv.to[0] === 7 && mv.to[1] === 0) f = f.replace('Q', '')
    if (mv.to[0] === 7 && mv.to[1] === 7) f = f.replace('K', '')
    if (mv.to[0] === 0 && mv.to[1] === 0) f = f.replace('q', '')
    if (mv.to[0] === 0 && mv.to[1] === 7) f = f.replace('k', '')
    return f
}

function nextEnPassant(g, mv) {
    if (!mv.piece) return null
    const t = mv.piece.toLowerCase()
    if (t !== 'p' || Math.abs(mv.from[0] - mv.to[0]) !== 2) return null
    return [(mv.from[0] + mv.to[0]) / 2, mv.from[1]]
}

function commitMove(g, mv) {
    g.history.push({
        board: clone(g.board),
        castling: g.castling,
        enPassant: g.enPassant,
        halfmove: g.halfmove,
        turn: g.turn,
        mover: g.players[g.turn]
    })
    const capture = !!g.board[mv.to[0]][mv.to[1]] || !!mv.ep
    g.board = boardAfter(g, mv)
    g.castling = updateCastlingFlags(g.castling, mv)
    g.enPassant = nextEnPassant(g, mv)
    g.halfmove = ((mv.piece && mv.piece.toLowerCase() === 'p') || capture) ? 0 : g.halfmove + 1
    g.drawOffer = null
    g.turn = 1 - g.turn
}

function toFen(g) {
    const rows = []
    for (let r = 0; r < 8; r++) {
        let line = '', empty = 0
        for (let c = 0; c < 8; c++) {
            const p = g.board[r][c]
            if (!p) { empty++; continue }
            if (empty) { line += empty; empty = 0 }
            line += p
        }
        if (empty) line += empty
        rows.push(line)
    }
    const ep = g.enPassant ? toSquareName(g.enPassant[0], g.enPassant[1]) : '-'
    return rows.join('/') + ' ' + (g.turn === 0 ? 'w' : 'b') + ' ' + (g.castling || '-') + ' ' + ep + ' 0 1'
}

function rulesText() {
    return '♟️ *REGLAS DE AJEDREZ* ♟️\n\n' +
        '⚪ *Blancas* mueven primero y luego ⚫ *Negras* (un jugador cada una).\n\n' +
        '🎮 *Cómo mover:* escribe origen y destino:\n' +
        '> `e2e4` · `g1f3` · `a2 a4`\n' +
        '> Enroque: `0-0` (corto) y `0-0-0` (largo)\n' +
        '> Coronar peón: `a7a8q` (q=dama, r=torre, b=alfil, n=caballo)\n\n' +
        '📌 Reglas del ajedrez real: cada pieza se mueve igual que en el tablero normal, sin atravesar piezas, capturas válidas, en passant, enroque solo si el rey y la torre no han movido y el rey no está ni pasa por jaque, y *no puedes dejar tu rey en jaque*.\n\n' +
        '🛠️ *Comandos:*\n' +
        '> `tablero` · `posicion`/`fen` · `deshacer` (solo una) · `tablas` · `rendirse`\n' +
        '> `salir`/`alto` (solo el creador) · `reglas`\n\n' +
        '⏱️ *2 min* por turno, si se agota gana el rival.\n' +
        '🤝 Tablas por acuerdo o por 50 movimientos sin capturas ni peones.\n' +
        '🏆 Ganador: +' + WIN_REWARD + '💰 · Tablas: +' + DRAW_REWARD + '💰 a cada uno.'
}

function endTimeout(sock, m, roomId, g) {
    if (!global.chessGames[roomId]) return
    sock.sendMessage(m.chat, { text: '⏱️ Tiempo de espera agotado. Invitación de ajedrez cancelada.', mentions: g.players }).catch(() => {})
    delete global.chessGames[roomId]
}

function startGame(sock, m, roomId, g) {
    clearTimeout(g.timeout)
    g.timeout = null
    g.status = 'playing'
    g.turn = 0
    g.turnTimeout = setTimeout(() => turnTimeout(sock, g), TURN_TIMEOUT)
    sock.sendMessage(g.chat, {
        text: '♟️ *¡AJEDREZ COMIENZA!* ♟️\n\n' +
            rulesText() +
            '\n\n⚪ Tablero (Blancas arriba ya coronan):\n' + renderBoard(g) +
            '\n\n🎯 Turno de ⚪ *Blancas* → @' + g.players[0].split('@')[0],
        mentions: g.players
    }).catch(() => {})
    if (!global.chessGames[roomId]) return
}

function turnTimeout(sock, g) {
    if (!global.chessGames[g.id]) return
    const loser = g.players[g.turn]
    const winner = g.players[1 - g.turn]
    const db = getDatabase()
    try { db.updateBerry(winner, WIN_REWARD) } catch (e) {}
    sock.sendMessage(g.chat, {
        text: '⏱️ @' + loser.split('@')[0] + ' no jugó en 2 minutos.\n🏆 Gana @' + winner.split('@')[0] + ' por tiempo!\n> +' + WIN_REWARD + '💰',
        mentions: g.players
    }).catch(() => {})
    delete global.chessGames[g.id]
}

function winGame(sock, g, winner) {
    const db = getDatabase()
    try { db.updateBerry(winner, WIN_REWARD) } catch (e) {}
    clearTimeout(g.timeout)
    clearTimeout(g.turnTimeout)
    const loser = g.players.find(p => p !== winner)
    sock.sendMessage(g.chat, {
        text: '♛ *JAQUE MATE!* 🏆\n\n' + renderBoard(g) +
            '\n\n🎉 ' + roleName(g, winner) + ' de @' + winner.split('@')[0] + ' GANA!\n' +
            '💔 @' + loser.split('@')[0] + ' (' + roleName(g, loser) + ') pierde.\n> +' + WIN_REWARD + '💰',
        mentions: g.players
    }).catch(() => {})
    delete global.chessGames[g.id]
}

function drawGame(sock, g, reason) {
    const db = getDatabase()
    for (const p of g.players) {
        try { db.updateBerry(p, DRAW_REWARD) } catch (e) {}
    }
    clearTimeout(g.timeout)
    clearTimeout(g.turnTimeout)
    sock.sendMessage(g.chat, {
        text: '🤝 *TABLAS* · ' + reason + '\n\n' + renderBoard(g) +
            '\n\n' + g.players.map(p => '@' + p.split('@')[0] + ' (' + roleName(g, p) + ')').join(' vs ') +
            '\n\n🎉 Empate! Cada jugador gana +' + DRAW_REWARD + '💰',
        mentions: g.players
    }).catch(() => {})
    delete global.chessGames[g.id]
}

function doMove(sock, m, g, parsed) {
    clearTimeout(g.turnTimeout)
    const color = g.turn === 0 ? 'w' : 'b'
    const mv = findLegalMove(g, color, parsed)
    if (!mv) {
        g.turnTimeout = setTimeout(() => turnTimeout(sock, g), TURN_TIMEOUT)
        return m.reply('❌ Movimiento ilegal. Escribe ej: `e2e4`, `0-0`, o `reglas`.')
    }
    const mover = g.players[g.turn]
    commitMove(g, mv)
    const status = gameStatus(g)
    if (status === 'checkmate') { winGame(sock, g, mover); return }
    if (status === 'stalemate') { drawGame(sock, g, 'ahogado (sin jugadas legales)'); return }
    if (status === 'fifty') { drawGame(sock, g, 'regla de los 50 movimientos'); return }
    g.turnTimeout = setTimeout(() => turnTimeout(sock, g), TURN_TIMEOUT)
    let txt = '♟️ @' + mover.split('@')[0] + ' jugó *' + describeMove(mv) + '*\n\n' + renderBoard(g)
    if (status === 'check') txt += '\n\n⚠️ *JAQUE* al rey ' + (g.turn === 0 ? '⚪' : '⚫') + '!'
    txt += '\n\n🎯 Turno de ' + roleName(g, g.players[g.turn]) + ' → @' + g.players[g.turn].split('@')[0]
    sock.sendMessage(g.chat, { text: txt, mentions: g.players }).catch(() => {})
}

function doUndo(sock, m, g) {
    if (g.undone) return m.reply('❌ Solo puedes deshacer *una* jugada por partida.')
    if (!g.history.length) return m.reply('❌ No hay jugadas para deshacer todavía.')
    const snap = g.history[g.history.length - 1]
    if (m.sender !== snap.mover) return m.reply('❌ Solo quien hizo la última jugada puede deshacer.')
    g.undone = true
    g.history.pop()
    g.board = snap.board
    g.castling = snap.castling
    g.enPassant = snap.enPassant
    g.halfmove = snap.halfmove
    g.turn = snap.turn
    g.drawOffer = null
    clearTimeout(g.turnTimeout)
    g.turnTimeout = setTimeout(() => turnTimeout(sock, g), TURN_TIMEOUT)
    sock.sendMessage(g.chat, {
        text: '↩️ @' + m.sender.split('@')[0] + ' deshizo su jugada.\n\n' + renderBoard(g) +
            '\n\n🎯 Turno de ' + roleName(g, g.players[g.turn]) + ' → @' + g.players[g.turn].split('@')[0],
        mentions: g.players
    }).catch(() => {})
    return true
}

function resign(sock, m, g) {
    const winner = g.players.find(p => p !== m.sender)
    const db = getDatabase()
    try { db.updateBerry(winner, WIN_REWARD) } catch (e) {}
    clearTimeout(g.timeout)
    clearTimeout(g.turnTimeout)
    sock.sendMessage(g.chat, {
        text: '🏳️ @' + m.sender.split('@')[0] + ' se rindió.\n🏆 Gana @' + winner.split('@')[0] + '!\n> +' + WIN_REWARD + '💰',
        mentions: g.players
    }).catch(() => {})
    delete global.chessGames[g.id]
    return true
}

function handleTablas(sock, m, g) {
    if (g.drawOffer && g.drawOffer !== m.sender) {
        drawGame(sock, g, 'acuerdo mutuo')
        return true
    }
    if (g.drawOffer === m.sender) {
        m.reply('❌ Ya ofreciste tablas, espera la respuesta de tu rival.')
        return true
    }
    g.drawOffer = m.sender
    const rival = g.players.find(p => p !== m.sender)
    sock.sendMessage(g.chat, {
        text: '🤝 @' + m.sender.split('@')[0] + ' ofrece *tablas*.\n@' + rival.split('@')[0] + ', responde con `tablas` para aceptar.',
        mentions: [rival]
    }).catch(() => {})
    return true
}

async function handler(m, { sock }) {
    const existing = Object.values(global.chessGames).find(r => r.status === 'playing' && r.players.includes(m.sender))
    if (existing) return m.reply('❌ Ya estás en una partida de ajedrez en curso.')

    let targets = []
    if (m.quoted) targets = [m.quoted.sender]
    else if (m.mentionedJid) targets = m.mentionedJid.slice(0, 1)

    if (!targets.length) {
        return m.reply('♟️ *AJEDREZ 1v1*\n\n' + rulesText() + '\n\n👉 Para jugar etiqueta a tu rival:\n> `.ajedrezpvp @jugador2`')
    }

    const rival = targets[0]
    if (rival === m.sender) return m.reply('❌ No puedes invitarte a ti mismo.')
    if (Object.values(global.chessGames).some(r => r.players.includes(rival) && r.status === 'playing'))
        return m.reply('❌ Ese jugador ya está en una partida de ajedrez.')
    if (Object.values(global.chessGames).some(r => r.status === 'waiting' && r.players.includes(rival)))
        return m.reply('❌ Ese jugador tiene una invitación pendiente de ajedrez.')

    const roomId = 'chess_' + Date.now()
    const g = {
        id: roomId,
        chat: m.chat,
        players: [m.sender, rival],
        accepted: { [m.sender]: true },
        status: 'waiting',
        board: initialBoard(),
        turn: 0,
        castling: 'KQkq',
        enPassant: null,
        halfmove: 0,
        history: [],
        drawOffer: null,
        undone: false,
        timeout: null,
        turnTimeout: null,
        createdAt: Date.now()
    }
    global.chessGames[roomId] = g
    g.timeout = setTimeout(() => endTimeout(sock, m, roomId, g), TIMEOUT)

    await m.react('♟️')
    await m.reply('♟️ *AJEDREZ · INVITACIÓN*\n\n' +
        '👤 Tú (@' + m.sender.split('@')[0] + ') juegas con ⚪ *Blancas* y mueves primero.\n' +
        '👥 @' + rival.split('@')[0] + ' juega con ⚫ *Negras*.\n\n' +
        'Esperando que @' + rival.split('@')[0] + ' escriba *acepto* / *ok*.\n' +
        'Las reglas se muestran al comenzar. Time: 5 min', { mentions: g.players })
}

async function answerHandler(m, sock) {
    if (!m.body) return false
    const text = m.body.trim().toLowerCase()

    let g = null, roomId = null
    for (const [id, r] of Object.entries(global.chessGames)) {
        if (r.status === 'waiting' && r.players.includes(m.sender) && r.chat === m.chat) { g = r; roomId = id; break }
        if (r.status === 'playing' && r.players.includes(m.sender)) { g = r; roomId = id; break }
    }
    if (!g) return false

    if (g.status === 'waiting') {
        if (/^(acept(o|ar)?|acepto|terima|gas|oke?|ok|iya|yoi|vale|dale|vamos|claro|si|sip)$/i.test(text)) {
            g.accepted[m.sender] = true
            if (g.players.every(p => g.accepted[p])) {
                startGame(sock, m, roomId, g)
            } else {
                m.reply('✅ Aceptado! Esperando que @' + g.players.filter(p => !g.accepted[p]).map(p => '@' + p.split('@')[0]).join(', ') + ' acepte.')
            }
            return true
        }
        if (/^(no|nope|rechaz|rechazo|negat|no quiero)$/i.test(text)) {
            clearTimeout(g.timeout)
            sock.sendMessage(g.chat, { text: '❌ @' + m.sender.split('@')[0] + ' rechazó. Partida cancelada.', mentions: g.players }).catch(() => {})
            delete global.chessGames[roomId]
            return true
        }
        return false
    }

    if (/^(reglas|regla|help|ayuda)$/i.test(text)) { m.reply(rulesText()); return true }
    if (/^(tablero|board|mesa)$/i.test(text)) { m.reply('♟️ *TABLERO*\n\n' + renderBoard(g)); return true }
    if (/^(posicion|fen|notacion)$/i.test(text)) { m.reply('📜 *FEN*\n\n`' + toFen(g) + '`'); return true }
    if (/^deshacer$/i.test(text)) return doUndo(sock, m, g)
    if (/^(rendirse|me rindo|surrender)$/i.test(text)) return resign(sock, m, g)
    if (/^tablas$/i.test(text)) return handleTablas(sock, m, g)
    if (/^(salir|alto|abortar|cancelar|terminar)$/i.test(text)) {
        if (m.sender !== g.players[0]) { m.reply('❌ Solo el creador puede terminar la partida.'); return true }
        clearTimeout(g.timeout)
        clearTimeout(g.turnTimeout)
        sock.sendMessage(g.chat, { text: '🛑 Partida de ajedrez cancelada por su creador.', mentions: g.players }).catch(() => {})
        delete global.chessGames[roomId]
        return true
    }

    const parsed = parseMove(text)
    if (g.players[g.turn] !== m.sender) {
        if (parsed) { m.reply('⏳ Aún no es tu turno.'); return true }
        return false
    }
    if (!parsed) { m.reply('❌ Formato inválido. Escribe ej: `e2e4`, `0-0`, o `reglas`.'); return true }
    doMove(sock, m, g, parsed)
    return true
}

export { pluginConfig as config, handler, answerHandler }