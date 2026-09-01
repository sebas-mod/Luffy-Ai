import { getDatabase } from '../../src/lib/luffy-database.js'

const pluginConfig = {
    name: 'duelo',
    alias: ['trivial', 'quizduel'],
    category: 'game',
    description: 'Duelo de trivia 1v1 por mensajes (5 rondas)',
    usage: '.duelo @jugador2',
    example: '.duelo @628xxx',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    isEnabled: true
}

if (!global.dueloGames) global.dueloGames = {}

const TIMEOUT = 120000
const WIN_REWARD = 1000
const ROUNDS = 5
const ROUND_TIME = 60000

const QUESTIONS = [
    // Geografía
    { q: '¿Cuál es el río más largo del mundo?', o: ['Amazonas', 'Nilo', 'Misisipi', 'Danubio'], a: 'A', kind: 'choice' },
    { q: '¿Cuál es la capital de Australia?', o: ['Sídney', 'Melbourne', 'Canberra', 'Perth'], a: 'C', kind: 'choice' },
    { q: '¿En qué continente está Egipto?', o: ['Asia', 'África', 'Europa', 'Oceanía'], a: 'B', kind: 'choice' },
    { q: '¿Cuál es el país más grande del mundo por superficie?', o: ['Canadá', 'China', 'Rusia', 'Estados Unidos'], a: 'C', kind: 'choice' },
    { q: '¿Cuál es el desierto más grande del mundo?', o: ['Sáhara', 'Gobi', 'Atacama', 'Antártida'], a: 'D', kind: 'choice' },
    { q: '¿En qué país se encuentra la Torre Eiffel?', o: ['Italia', 'Francia', 'España', 'Reino Unido'], a: 'B', kind: 'choice' },
    { q: '¿Cuál es la capital de Japón?', o: ['Pekín', 'Seúl', 'Tokio', 'Bangkok'], a: 'C', kind: 'choice' },
    { q: '¿Cuántos continentes hay en el mundo?', o: ['5', '6', '7', '8'], a: 'C', kind: 'choice' },
    { q: '¿Cuál es el océano más grande?', o: ['Atlántico', 'Índico', 'Pacífico', 'Ártico'], a: 'C', kind: 'choice' },
    { q: '¿Cuál es la montaña más alta del mundo?', o: ['K2', 'Kilimanjaro', 'Everest', 'Aconcagua'], a: 'C', kind: 'choice' },
    // Ciencia
    { q: '¿Cuál es el planeta más cercano al Sol?', o: ['Venus', 'Mercurio', 'Tierra', 'Marte'], a: 'B', kind: 'choice' },
    { q: '¿Cuál es el símbolo químico del oro?', o: ['Go', 'Au', 'Or', 'Ag'], a: 'B', kind: 'choice' },
    { q: '¿Cuántos huesos tiene un adulto humano?', o: ['186', '206', '226', '246'], a: 'B', kind: 'choice' },
    { q: '¿Qué gas respiramos principalmente?', o: ['Oxígeno', 'Hidrógeno', 'Nitrógeno', 'Dióxido de carbono'], a: 'A', kind: 'choice' },
    { q: '¿Cuál es el elemento más abundante en el universo?', o: ['Oxígeno', 'Carbono', 'Hidrógeno', 'Helio'], a: 'C', kind: 'choice' },
    { q: '¿Qué planeta es conocido como el "planeta rojo"?', o: ['Júpiter', 'Marte', 'Saturno', 'Venus'], a: 'B', kind: 'choice' },
    { q: '¿Cuántos planetas tiene el sistema solar?', o: ['7', '8', '9', '10'], a: 'B', kind: 'choice' },
    { q: '¿Cuál es la fórmula química del agua?', o: ['CO2', 'H2O', 'O2', 'NaCl'], a: 'B', kind: 'choice' },
    { q: '¿Qué órgano bombea la sangre por el cuerpo?', o: ['Pulmón', 'Cerebro', 'Corazón', 'Hígado'], a: 'C', kind: 'choice' },
    { q: '¿Cuál es la velocidad aproximada de la luz?', o: ['100.000 km/s', '200.000 km/s', '300.000 km/s', '400.000 km/s'], a: 'C', kind: 'choice' },
    // Historia
    { q: '¿Quién pintó la Mona Lisa?', o: ['Miguel Ángel', 'Leonardo da Vinci', 'Picasso', 'Van Gogh'], a: 'B', kind: 'choice' },
    { q: '¿En qué año inició la Segunda Guerra Mundial?', o: ['1935', '1939', '1941', '1945'], a: 'B', kind: 'choice' },
    { q: '¿Quién fue el primer presidente de Estados Unidos?', o: ['Thomas Jefferson', 'Abraham Lincoln', 'George Washington', 'John Adams'], a: 'C', kind: 'choice' },
    { q: '¿Qué civilización construyó las pirámides de Giza?', o: ['Romanos', 'Griegos', 'Egipcios', 'Mayas'], a: 'C', kind: 'choice' },
    { q: '¿En qué año llegó Cristóbal Colón a América?', o: ['1490', '1492', '1498', '1500'], a: 'B', kind: 'choice' },
    { q: '¿Quién fue el líder de la Revolución Cubana?', o: ['Che Guevara', 'Camilo Cienfuegos', 'Fidel Castro', 'Raúl Castro'], a: 'C', kind: 'choice' },
    { q: '¿En qué país cayó el muro de Berlín en 1989?', o: ['Francia', 'Alemania', 'Polonia', 'Rusia'], a: 'B', kind: 'choice' },
    { q: '¿Quién fue el emperador romano que construyó el Coliseo?', o: ['Julio César', 'Augusto', 'Vespasiano', 'Nerón'], a: 'C', kind: 'choice' },
    { q: '¿En qué año se firmó la independencia de México?', o: ['1808', '1810', '1821', '1824'], a: 'C', kind: 'choice' },
    { q: '¿Qué barco famoso se hundió en 1912?', o: ['Queen Mary', 'Titanic', 'Bismarck', 'Lusitania'], a: 'B', kind: 'choice' },
    // Deportes
    { q: '¿Cuántos jugadores tiene un equipo de fútbol en cancha?', o: ['9', '10', '11', '12'], a: 'C', kind: 'choice' },
    { q: '¿En qué deporte se usa la palabra "mate"?', o: ['Fútbol', 'Baloncesto', 'Tenis', 'Voleibol'], a: 'B', kind: 'choice' },
    { q: '¿Cada cuántos años se celebran los Juegos Olímpicos?', o: ['2', '3', '4', '5'], a: 'C', kind: 'choice' },
    { q: '¿Qué país ganó el Mundial de Fútbol 2010?', o: ['Brasil', 'Alemania', 'Argentina', 'España'], a: 'D', kind: 'choice' },
    { q: '¿Cuántos puntos vale un touchdown en fútbol americano?', o: ['5', '6', '7', '8'], a: 'B', kind: 'choice' },
    { q: '¿En qué deporte se utiliza el término "ace"?', o: ['Fútbol', 'Baloncesto', 'Tenis', 'Boxeo'], a: 'C', kind: 'choice' },
    { q: '¿Cuántos arcos tiene un partido de fútbol?', o: ['1', '2', '3', '4'], a: 'B', kind: 'choice' },
    { q: '¿En qué país se originó el taekwondo?', o: ['China', 'Japón', 'Corea del Sur', 'Tailandia'], a: 'C', kind: 'choice' },
    // Cultura general
    { q: '¿Cuántos lados tiene un hexágono?', o: ['5', '6', '7', '8'], a: 'B', kind: 'choice' },
    { q: '¿Qué color resulta de mezclar azul y amarillo?', o: ['Rojo', 'Naranja', 'Verde', 'Morado'], a: 'C', kind: 'choice' },
    { q: '¿Cuántas horas tiene un día?', o: ['12', '18', '24', '36'], a: 'C', kind: 'choice' },
    { q: '¿Qué instrumento tiene 88 teclas?', o: ['Guitarra', 'Violín', 'Piano', 'Flauta'], a: 'C', kind: 'choice' },
    { q: '¿Cuál es el idioma más hablado del mundo por hablantes nativos?', o: ['Inglés', 'Español', 'Mandarín', 'Hindi'], a: 'C', kind: 'choice' },
    { q: '¿Cuántos minutos tiene una hora?', o: ['50', '60', '90', '100'], a: 'B', kind: 'choice' },
    { q: '¿Qué animal es conocido como el rey de la selva?', o: ['Tigre', 'Elefante', 'León', 'Jaguar'], a: 'C', kind: 'choice' },
    { q: '¿Cuántos días tiene un año bisiesto?', o: ['364', '365', '366', '367'], a: 'C', kind: 'choice' },
    // Español
    { q: '¿Cuál es el plural de "lápiz"?', o: ['lápizes', 'lápices', 'lápi', 'lapizs'], a: 'B', kind: 'choice' },
    { q: '¿Qué palabra es un sinónimo de "rápido"?', o: ['Lento', 'Veloz', 'Grande', 'Pesado'], a: 'B', kind: 'choice' },
    { q: '¿Cuál de estas palabras está escrita correctamente?', o: ['búho', 'buho', 'buhoo', 'bújo'], a: 'A', kind: 'choice' },
    { q: '¿Cuál es el antónimo de "triste"?', o: ['Enfadado', 'Cansado', 'Alegre', 'Asustado'], a: 'C', kind: 'choice' },
    { q: '¿Qué significa la expresión "echar una mano"?', o: ['Saludar', 'Ayudar', 'Caminar', 'Llorar'], a: 'B', kind: 'choice' },
    { q: '¿Cuál es el diminutivo de "casa"?', o: ['casota', 'caserón', 'casita', 'casona'], a: 'C', kind: 'choice' },
    // Respuestas libres
    { q: '¿Cuál es la capital de Colombia?', o: null, a: 'bogota', kind: 'free' },
    { q: '¿Cuánto es 7 x 8?', o: null, a: '56', kind: 'free' },
    { q: '¿Cómo se llama la esposa de Barack Obama?', o: null, a: 'michelle', kind: 'free' },
    { q: '¿Cuál es el río que atraviesa la ciudad de Roma?', o: null, a: 'tiber', kind: 'free' }
]

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const t = a[i]; a[i] = a[j]; a[j] = t
    }
    return a
}

function normalize(str) {
    return (str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .replace(/[¿?¡!.,;:]/g, '')
        .replace(/\s+/g, ' ')
}

function choiceKeys(q) {
    return q.o.map((opt, i) => String.fromCharCode(65 + i))
}

function questionText(q, num) {
    let txt = '❓ *Pregunta ' + num + '/' + ROUNDS + '*\n\n' + q.q + '\n'
    if (q.kind === 'choice') {
        txt += '\n' + q.o.map((opt, i) => '*' + String.fromCharCode(65 + i) + ')* ' + opt).join('\n') +
            '\n\n✍️ Escribe la letra (ej: `A`) o la respuesta.'
    } else {
        txt += '\n\n✍️ Escribe tu respuesta libre (compruebo acentos/tildes).'
    }
    return txt
}

function rulesText() {
    return '⚔️ *REGLA DEL DUELO (TRIVIA 1v1)* ⚔️\n\n' +
        'Dos jugadores se enfrentan a lo largo de *' + ROUNDS + ' rondas* de preguntas.\n\n' +
        '🎯 *Cómo se juega:*\n' +
        '> En cada ronda se muestra una pregunta con 4 opciones (A/B/C/D) o respuesta libre.\n' +
        '> Cada jugador responde por *privado* (se le envía la pregunta a su chat privado).\n' +
        '> Tienes *' + ROUND_TIME / 1000 + ' segundos* para responder cada ronda.\n\n' +
        '🏁 *Puntos:*\n' +
        '> Acierto = *+1 punto*. Con respuesta libre acepto equivalentes (sin tildes/minúsculas).\n\n' +
        '🎮 *Comandos durante la partida:*\n' +
        '• `reglas` — ver estas reglas\n' +
        '• `puntos` / `marcador` — ver el marcador\n' +
        '• `salir` / `alto` — solo el creador cancela\n\n' +
        '🏆 Al final de las ' + ROUNDS + ' rondas, gana quien tenga más puntos (+' + WIN_REWARD + '💰).'
}

function broadcast(sock, m, g, txt, mentions) {
    sock.sendMessage(m.chat, { text: txt, mentions: mentions || g.players }).catch(() => {})
}

function askPrivately(sock, g, q, num) {
    for (const p of g.players) {
        sock.sendMessage(p, { text: '⚔️ *DUELO* — @' + g.players[0].split('@')[0] + ' vs @' + g.players[1].split('@')[0] + ' (ronda ' + num + ')\n\n' + questionText(q, num), mentions: g.players }).catch(() => {})
    }
}

function getAnswerText(q) {
    return q.kind === 'choice' ? q.a : q.a
}

function showResult(sock, m, g) {
    const q = g.currentQ
    const corrects = []
    for (const p of g.players) {
        if (g.answers[p] && isCorrect(g, p)) corrects.push('@' + p.split('@')[0])
    }
    const corrText = q.kind === 'choice'
        ? '*' + q.a + ')* ' + q.o[choiceKeys(q).indexOf(q.a)] + '*'
        : '*' + q.a + '*'
    broadcast(sock, m, g,
        '✅ *Respuesta correcta:* ' + corrText + '\n' +
        (corrects.length
            ? '🎉 Acertó: ' + corrects.join(' y ')
            : '😅 Nadie acertó en esta ronda.'),
        )
}

function isCorrect(g, p) {
    const q = g.currentQ
    const ans = g.answers[p]
    if (ans === null || ans === undefined) return false
    if (q.kind === 'choice') {
        return normalize(ans).toUpperCase() === normalize(q.a).toUpperCase() ||
            normalize(ans) === normalize(q.o[choiceKeys(q).indexOf(q.a)])
    }
    return normalize(ans) === normalize(q.a)
}

function updateScores(g) {
    for (const p of g.players) {
        if (isCorrect(g, p)) g.scores[p] = (g.scores[p] || 0) + 1
    }
}

function processAnswers(sock, m, g, roomId) {
    clearTimeout(g.roundTimer)
    updateScores(g)
    showResult(sock, m, g)
    g.answers = {}
    g.round++

    if (g.round > ROUNDS) {
        finishGame(sock, m, g, roomId)
        return
    }
    startRound(sock, m, g, roomId)
}

function startRound(sock, m, g, roomId) {
    g.currentQ = g.questions[g.round - 1]
    broadcast(sock, m, g,
        '⚔️ *Ronda ' + g.round + '/' + ROUNDS + '* — @' + g.players[0].split('@')[0] + ' vs @' + g.players[1].split('@')[0] +
        '\n\n' + questionText(g.currentQ, g.round) +
        '\n\n⏳ Responde por privado en ' + ROUND_TIME / 1000 + ' segundos.',
        )
    askPrivately(sock, g, g.currentQ, g.round)
    g.roundTimer = setTimeout(() => processAnswers(sock, m, g, roomId), ROUND_TIME)
}

function finishGame(sock, m, g, roomId) {
    clearTimeout(g.timeout)
    const p0 = g.players[0], p1 = g.players[1]
    const s0 = g.scores[p0] || 0, s1 = g.scores[p1] || 0
    let winner = null
    if (s0 > s1) winner = p0
    else if (s1 > s0) winner = p1

    let txt = '🏁 *¡DUELO TERMINADO!* ⚔️\n\n📊 *Marcador final:*\n' +
        '• @' + p0.split('@')[0] + ': *' + s0 + '* punto(s)\n' +
        '• @' + p1.split('@')[0] + ': *' + s1 + '* punto(s)\n\n'

    if (winner) {
        const db = getDatabase()
        try { db.updateBerry(winner, WIN_REWARD) } catch (e) {}
        txt += '🏆 *¡GANA @' + winner.split('@')[0] + '!* 🎉\n> Se lleva +' + WIN_REWARD + '💰'
    } else {
        txt += '🤝 *¡Empate!* Ambos demostraron gran nivel.'
    }
    broadcast(sock, m, g, txt)
    if (global.dueloGames[roomId]) delete global.dueloGames[roomId]
}

function startGame(sock, m, roomId, g) {
    g.status = 'playing'
    g.round = 1
    g.questions = shuffle(QUESTIONS.slice()).slice(0, ROUNDS)
    g.scores = {}
    g.answers = {}
    for (const p of g.players) { g.scores[p] = 0; g.answers[p] = null }
    clearTimeout(g.timeout)
    g.timeout = setTimeout(() => endTimeout(sock, m, roomId, g), TIMEOUT)

    broadcast(sock, m, g,
        '⚔️ *¡EL DUELO COMIENZA!* 🔥\n\n' + rulesText() +
        '\n\n🎮 @' + g.players[0].split('@')[0] + ' vs @' + g.players[1].split('@')[0] +
        '\nComenzamos con la Ronda 1...',
        )
    startRound(sock, m, g, roomId)
}

function endTimeout(sock, m, roomId, g) {
    if (!global.dueloGames[roomId]) return
    clearTimeout(g.roundTimer)
    sock.sendMessage(m.chat, { text: '⏱️ Tiempo agotado. Duelo cancelado.', mentions: g.players }).catch(() => {})
    delete global.dueloGames[roomId]
}

function scoreboard(g) {
    return '📊 *MARCADOR*\n' + g.players.map(p => '• @' + p.split('@')[0] + ': *' + (g.scores[p] || 0) + '* punto(s)').join('\n')
}

async function handler(m, { sock }) {
    const existing = Object.values(global.dueloGames).find(r => r.status === 'playing' && r.players.includes(m.sender))
    if (existing) return m.reply('❌ Ya estás en un Duelo en curso.')

    let targets = []
    if (m.quoted) targets = [m.quoted.sender]
    else if (m.mentionedJid) targets = m.mentionedJid.slice(0, 1)

    if (!targets.length) {
        return m.reply('⚔️ *DUELO (TRIVIA 1v1)*\n\n' + rulesText() + '\n\n👉 Para jugar, invita a tu rival etiquetándolo:\n> `.duelo @jugador2`')
    }

    const players = [m.sender, ...targets]
    if (new Set(players).size !== players.length) return m.reply('❌ No puedes invitarte a ti mismo o invitar repetidos.')
    if (players.length !== 2) return m.reply('❌ El Duelo se juega entre exactamente 2 jugadores.')
    if (Object.values(global.dueloGames).some(r => r.players.includes(targets[0]) && r.status === 'playing'))
        return m.reply('❌ Tu rival ya está en un Duelo en curso.')

    const roomId = 'duelo_' + Date.now()
    const g = {
        id: roomId, chat: m.chat, players,
        accepted: { [m.sender]: true },
        status: 'waiting', round: 0, questions: [], scores: {}, answers: {},
        currentQ: null, roundTimer: null, createdAt: Date.now()
    }
    global.dueloGames[roomId] = g
    g.timeout = setTimeout(() => endTimeout(sock, m, roomId, g), TIMEOUT)

    await m.react('⚔️')
    const inv = players.map(p => p === m.sender ? '👤 Tú (host)' : '👥 @' + p.split('@')[0]).join('\n')
    await m.reply('⚔️ *DUELO · INVITACIÓN*\n\nJugadores:\n' + inv +
        '\n\nEsperando que @' + targets.map(t => t.split('@')[0]).join(' y @') + ' escriba *acepto* / *ok*.\n' +
        'Las reglas se muestran al comenzar. Time: 2 min', { mentions: targets })
}

async function answerHandler(m, sock) {
    if (!m.body) return false
    const text = m.body.trim().toLowerCase()

    let g = null, roomId = null
    for (const [id, r] of Object.entries(global.dueloGames)) {
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
                m.reply('✅ Aceptado! Esperando a ' + g.players.filter(p => !g.accepted[p]).map(p => '@' + p.split('@')[0]).join(', '))
            }
            return true
        }
        if (/^(no|nope|rechaz|rechazo|negat|no quiero)$/i.test(text)) {
            clearTimeout(g.timeout)
            clearTimeout(g.roundTimer)
            sock.sendMessage(m.chat, { text: '❌ @' + m.sender.split('@')[0] + ' rechazó. Duelo cancelado.', mentions: g.players }).catch(() => {})
            delete global.dueloGames[roomId]
            return true
        }
        return false
    }

    if (/^(reglas|regla|help|ayuda)$/i.test(text)) {
        m.reply(rulesText()); return true
    }
    if (/^(puntos|marcador|score|puntaje)$/i.test(text)) {
        m.reply(scoreboard(g)); return true
    }
    if (/^(salir|alto|abortar|cancelar|terminar)$/i.test(text)) {
        if (m.sender !== g.players[0]) { m.reply('❌ Solo el creador puede cancelar.'); return true }
        clearTimeout(g.timeout)
        clearTimeout(g.roundTimer)
        broadcast(sock, m, g, '🛑 Duelo cancelado por su creador.')
        delete global.dueloGames[roomId]
        return true
    }

    if (g.round > 0 && g.currentQ) {
        g.answers[m.sender] = text
        m.reply('✅ Respuesta registrada! Esperando a tu rival...')
        if (g.players.every(p => g.answers[p] !== null && g.answers[p] !== undefined)) {
            processAnswers(sock, m, g, roomId)
        }
        return true
    }

    return false
}

export { pluginConfig as config, handler, answerHandler }
