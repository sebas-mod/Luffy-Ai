/**
 * Mimpi / Dream World - Fun dream interpretation generator
 * Ported from RTXZY-MD-pro
 */

const pluginConfig = {
    name: 'mimpi',
    alias: ['dream', 'dreamworld'],
    category: 'fun',
    description: 'Explora el mundo de tus sueños según tu nombre',
    usage: '.mimpi <nombre>',
    example: '.mimpi Keisya',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

const DREAM_LEVELS = ['Lúcida ✨', 'Mística 🌟', 'Etérea 💫', 'Divina 🌙', 'Legendaria 🎇']
const DREAM_QUALITIES = ['Tranquila 😌', 'Aventurera 🚀', 'Mística 🔮', 'Profética 📖', 'Épica 🗺️']

const ELEMENTS = [
    '🌊 Océano Cristalino Brillante',
    '🌈 Arcoíris Flotante',
    '🌺 Jardín Suspended',
    '⭐ Constelación Viva',
    '🌙 Luna Gemela',
    '🏰 Castillo de Nubes',
    '🌋 Montaña Prisma',
    '🎭 Teatro de Sombras'
]

const EVENTS = [
    '🦋 Mariposas portando mensajes secretos',
    '🎭 Máscaras bailando solas',
    '🌊 Lluvia de estrellas cayendo al mar',
    '🎪 Desfile de criaturas mágicas',
    '🌺 Flores cantando canciones antiguas',
    '🎨 Pinturas cobrando vida',
    '🎵 Música visible como colores',
    '⚡ Rayos formando escaleras al cielo'
]

const ENCOUNTERS = [
    '🐉 Dragón Arcoíris Sabio',
    '🧙‍♂️ Mago de las Estrellas',
    '🦊 Zorro Espíritu de Nueve Colas',
    '🧝‍♀️ Hada Portadora de Sueños',
    '🦁 León de Cristal',
    '🐋 Ballena Voladora Mística',
    '🦅 Pájaro Fénix del Tiempo',
    '🐢 Tortuga Portadora del Mundo',
    '🦄 Unicornio Dimensional'
]

const POWERS = [
    '✨ Controlar el Tiempo',
    '🌊 Hablar con los Elementos',
    '🎭 Transformación',
    '🌈 Manipulación de la Realidad',
    '👁️ Visión del Futuro',
    '🎪 Teletransportación Dimensional',
    '🌙 Curación Espiritual',
    '⚡ Energía Cósmica'
]

const MESSAGES = [
    'Tu viaje traerá grandes cambios',
    'Secretos antiguos se revelarán pronto',
    'Un poder oculto despertará pronto',
    'Un nuevo destino espera en el horizonte',
    'Una conexión espiritual se fortalecerá',
    'Una gran transformación ocurrirá',
    'La iluminación vendrá de una dirección inesperada',
    'Una misión importante comenzará pronto'
]

function generateDream(seed) {
    const seedNum = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0)
    
    const pick = (arr) => arr[seedNum % arr.length]
    const pickMulti = (arr, count) => {
        const shuffled = [...arr].sort(() => Math.random() - 0.5)
        return shuffled.slice(0, count)
    }
    
    return {
        level: pick(DREAM_LEVELS),
        quality: pick(DREAM_QUALITIES),
        elements: pickMulti(ELEMENTS, 3),
        events: pickMulti(EVENTS, 2),
        encounters: pickMulti(ENCOUNTERS, 2),
        powers: pickMulti(POWERS, 2),
        message: pick(MESSAGES)
    }
}

async function handler(m, { sock }) {
    const args = m.args || []
    let name = args.join(' ') || m.pushName || m.sender.split('@')[0]
    
    await m.react('🌙')
    await m.reply('🌙 *Entrando al mundo de los sueños...*')
    await new Promise(r => setTimeout(r, 1500))
    
    const dream = generateDream(name)
    
    let txt = `╭═══❯ *🌙 MUNDO DE LOS SUEÑOS* ❮═══\n`
    txt += `│ 👤 *Explorador:* ${name}\n`
    txt += `│ ⭐ *Nivel:* ${dream.level}\n`
    txt += `│ 💫 *Calidad:* ${dream.quality}\n`
    txt += `│ 🌈 *Elementos:*\n`
    for (const el of dream.elements) {
        txt += `│ ├ ${el}\n`
    }
    txt += `│ 🎪 *Eventos:*\n`
    for (const ev of dream.events) {
        txt += `│ ├ ${ev}\n`
    }
    txt += `│ 🌟 *Encuentros:*\n`
    for (const enc of dream.encounters) {
        txt += `│ ├ ${enc}\n`
    }
    txt += `│ 💫 *Poderes:*\n`
    for (const pow of dream.powers) {
        txt += `│ ├ ${pow}\n`
    }
    txt += `│ 🔮 *Mensaje:*\n`
    txt += `│ ${dream.message}\n`
    txt += `╰════════════════════`
    
    await m.reply(txt)
}

export { pluginConfig as config, handler }
