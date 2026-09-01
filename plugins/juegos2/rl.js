import { getDatabase } from '../../src/lib/luffy-database.js'

const pluginConfig = {
    name: 'rl',
    alias: ['ranking', 'puntos', 'leaderboard', 'top'],
    category: 'juegos2',
    description: 'Ranking global de puntos entre jugadores de todos los juegos',
    usage: '.rl <juego> <puntos>',
    example: '.rl snake 1200',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    isEnabled: true
}

const GAMES = [
    ['_2048', ['2048', 'dosmilcuarentaiocho']],
    ['adivinabandera', ['bandera', 'flags']],
    ['agarmini', ['agar', 'celula', 'zona']],
    ['ahorcado', ['hangman', 'horca']],
    ['ajedrez', ['chess', 'xadrez']],
    ['bingo', ['loteria', 'carton']],
    ['billar', ['pool', '8ball']],
    ['bomberman', ['bomba', 'bomb']],
    ['blackjack', ['21', 'bj', 'cartas']],
    ['brickbreaker', ['ladrillos', 'arkanoid', 'breakout']],
    ['buscaminas', ['minas', 'minesweeper']],
    ['carrera', ['race']],
    ['conecta4', ['cuatro', '4enlinea', 'c4']],
    ['crucigrama', ['crossword', 'palabras']],
    ['dados', ['craps', 'dice', 'azar']],
    ['dadosuerte', ['suerte', 'dado', 'golpe']],
    ['damero', ['damas', 'checkers']],
    ['diloseñas', ['mimica', 'actuar', 'charadas']],
    ['dino', []],
    ['flappy', ['flappybird', 'pajaro']],
    ['geometrydash', ['gd', 'geodash', 'geometry']],
    ['hundirlaflota', ['barcos', 'batalla', 'warship']],
    ['laberinto', ['exorcista', 'maze', 'laberintodel']],
    ['luzverde', ['luzroja', 'squidgame']],
    ['mahjong', ['shanghai', 'parejas']],
    ['memorama', ['memory', 'pares', 'memoria']],
    ['moneda', ['caracruz', 'cara', 'coincasa']],
    ['piano', ['teclado', 'musica']],
    ['pinball', ['pin']],
    ['pixeldraw', ['dibujar', 'pixel', 'pizarra']],
    ['pokerdados', ['poker', 'yahtzee']],
    ['puntosycajas', ['cajitas', 'dots']],
    ['pupiletras', ['sopa', 'wordsearch', 'sopadeletras']],
    ['puzzle15', ['rompecabezas15', 'puzzle']],
    ['rasga', ['raspaygana', 'scratch', 'raspadito']],
    ['reaccion', ['tiempo', 'reflejos']],
    ['ruleta', ['roulette', 'girar']],
    ['secuencia', ['musical', 'notas']],
    ['simon', ['simondice']],
    ['slot', ['tragaperras', 'tragamonedas', 'casino', 'slotmachine']],
    ['snake', ['serpiente']],
    ['sudoku', ['sudoku9']],
    ['tateti', ['tres_en_raya', 'ttt']],
    ['trivia', ['quiz', 'preguntas']],
    ['verdadorreto', ['verdad', 'reto', 'vr']]
]

const GAME_NAME = {}
const GAME_ALIAS = {}
for (const [name, alias] of GAMES) {
    GAME_NAME[name] = true
    for (const a of alias) GAME_ALIAS[a] = name
}
function resolveGame(input) {
    if (!input) return null
    const key = String(input).toLowerCase()
    if (GAME_NAME[key]) return key
    return GAME_ALIAS[key] || null
}

const MAX_POINTS = 1000000

async function handler(m, { prefix }) {
    const db = getDatabase()
    const jid = m.sender
    const text = (m.text || '').trim()
    const P = prefix || '.'
    const cmd = `${P}rl`

    if (/^(ayuda|help|list|lista|juegos)$/i.test(text)) {
        const list = GAMES.map(g => '• ' + g[0]).join('\n')
        return m.reply(
            `🏆 *RANKING GLOBAL* · @sebas-MD\n\n` +
            `>*Para reportar tu puntaje:*\n` +
            `> ${cmd} <juego> <puntos>\n\n` +
            `>*Ejemplo:*\n` +
            `> ${cmd} snake 1200\n\n` +
            `>*Comandos:*\n` +
            `> ${cmd}  → líderes generales\n` +
            `> ${cmd} mío  → tu puntaje\n` +
            `> ${cmd} <juego> <puntos>  → reportar\n\n` +
            `>*Juegos disponibles:*\n` +
            list +
            `\n\n> Credits: yosoyyo`
        )
    }

    if (/^(mio|mi|yo|me|perfil)$/i.test(text)) {
        const user = db.getUser(jid)
        if (!user || !user.scores || !Object.keys(user.scores).length) {
            return m.reply(`📊 *Tus puntos:*\n> Aún no has reportado ningún puntaje. ¡Juega y reporta con ${cmd} <juego> <puntos>!`)
        }
        const total = user.totalScore || 0
        const pos = calculatePosition(db, jid, total)
        const perGame = Object.entries(user.scores)
            .sort((a, b) => b[1] - a[1])
            .map(([g, p]) => `• ${g}: ${p.toLocaleString()}`)
            .join('\n')
        return m.reply(
            `📊 *TU RANKING* · @sebas-MD\n\n` +
            `> 🥇 Posición global: *#${pos}*\n` +
            `> 🏆 Puntos totales: *${total.toLocaleString()}*\n` +
            `> 🎮 Juegos con puntaje: *${Object.keys(user.scores).length}*\n\n` +
            `>*Tus mejores:*\n` + perGame +
            `\n\n> Credits: yosoyyo`
        )
    }

    const firstToken = text.split(/\s+/)[0]
    const knownGame = resolveGame(firstToken)
    if (knownGame && !/^\d+$/.test(text.split(/\s+/)[1] || '')) {
        return m.reply(
            `❌ Puntaje inválido para *${knownGame}*.\n` +
            `> Debes escribir: ${cmd} ${knownGame} <puntos>\n` +
            `> Ejemplo: ${cmd} ${knownGame} 1200\n\n> Credits: yosoyyo`
        )
    }

    const match = text.match(/^(\S+)\s+(\d+)$/)
    if (match) {
        const game = resolveGame(match[1])
        const points = parseInt(match[2], 10)
        if (!game) {
            return m.reply(`❌ Juego desconocido: *${match[1]}*\n> Usa ${cmd} ayuda para ver la lista.`)
        }
        if (!Number.isFinite(points) || points < 0) {
            return m.reply('❌ Los puntos deben ser un número entero positivo.')
        }
        const capped = Math.min(points, MAX_POINTS)

        let user = db.getUser(jid)
        const pushName = (m.pushName || '').trim()
        const displayName = pushName || (user && user.name && user.name !== 'Unknown' ? user.name : null)
        if (!user) {
            db.setUser(jid, displayName ? { name: displayName } : {})
            user = db.getUser(jid)
        }
        const scores = { ...(user.scores || {}) }
        const prev = scores[game] || 0
        const isNew = capped > prev

        if (isNew) {
            scores[game] = capped
            const total = Object.values(scores).reduce((a, b) => a + b, 0)
            db.setUser(jid, { name: displayName || undefined, scores, totalScore: total })
            return m.reply(
                `✅ *PUNTAJE REGISTRADO* · @sebas-MD\n\n` +
                `> 🎮 Juego: *${game}*\n` +
                `> 🏆 Puntos: *${capped.toLocaleString()}*\n` +
                (prev > 0 ? `> 🔼 Nuevo récord (antes ${prev.toLocaleString()})\n` : `> 🆕 Primer puntaje en este juego\n`) +
                `> 📊 Total general: *${total.toLocaleString()}*\n\n> Credits: yosoyyo`
            )
        }
        return m.reply(
            `ℹ️ *Tu mejor en ${game}* es *${prev.toLocaleString()}* (no supera este puntaje).\n` +
            `> Envía un puntaje mayor para actualizar.\n\n> Credits: yosoyyo`
        )
    }

    return m.reply(buildLeaderboard(db, cmd))
}

function buildLeaderboard(db, cmd) {
    const users = db.getAllUsers()
    const rows = []
    for (const num of Object.keys(users)) {
        const u = users[num]
        const total = u.totalScore || 0
        if (total > 0) {
            const nm = (u.name && u.name !== 'Unknown') ? u.name : num
            rows.push({ num, name: nm, total, games: Object.keys(u.scores || {}).length })
        }
    }
    rows.sort((a, b) => b.total - a.total)

    if (!rows.length) {
        return `🏆 *RANKING GLOBAL* · @sebas-MD\n\n> Aún no hay puntajes registrados.\n> ¡Juega y reporta con ${cmd} <juego> <puntos>!\n\n> Credits: yosoyyo`
    }

    const medals = ['🥇', '🥈', '🥉']
    const top = rows.slice(0, 10)
    const lines = top.map((r, i) => {
        const badge = medals[i] || `${i + 1}.`
        const nm = r.name.length > 15 ? r.name.slice(0, 15) + '…' : r.name
        return `${badge} *${nm}* — ${r.total.toLocaleString()} pts (${r.games} 🎮)`
    }).join('\n')

    return `🏆 *RANKING GLOBAL* · @sebas-MD\n\n` + lines +
        `\n\n> Usa ${cmd} mío para ver tu posición.\n> Credits: yosoyyo`
}

function calculatePosition(db, jid, total) {
    const users = db.getAllUsers()
    let pos = 1
    for (const num of Object.keys(users)) {
        if (num === String(jid).replace(/@.+/g, '')) continue
        if ((users[num].totalScore || 0) > total) pos++
    }
    return pos
}

export { pluginConfig as config, handler }
