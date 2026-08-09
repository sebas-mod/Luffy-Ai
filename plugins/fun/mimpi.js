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
    carne: 1,
    isEnabled: true
}

const DREAM_LEVELS = ['Lucid ✨', 'Mystic 🌟', 'Ethereal 💫', 'Divine 🌙', 'Legendary 🎇']
const DREAM_QUALITIES = ['Peaceful 😌', 'Adventure 🚀', 'Mystical 🔮', 'Prophecy 📖', 'Epic 🗺️']

const ELEMENTS = [
    '🌊 Océano de Cristal Brillante',
    '🌈 Arcoíris Flotante',
    '🌺 Jardín Flotante',
    '⭐ Constelación Viva',
    '🌙 Luna Gemela',
    '🏰 Castillo de Nubes',
    '🌋 Montaña de Prisma',
    '🎭 Teatro de Sombras'
]

const EVENTS = [
    '🦋 Mariposas que traen mensajes secretos',
    '🎭 Máscaras que bailan solas',
    '🌊 Lluvia de estrellas que cae al mar',
    '🎪 Desfile de criaturas mágicas',
    '🌺 Flores que cantan canciones antiguas',
    '🎨 Pinturas que cobran vida',
    '🎵 Música que se ve como colores',
    '⚡ Rayos que forman una escalera al cielo'
]

const ENCOUNTERS = [
    '🐉 Sabio Dragón Arcoíris',
    '🧙‍♂️ Mago de las Estrellas',
    '🦊 Zorro Espiritual de Nueve Colas',
    '🧝‍♀️ Hada Portadora de Sueños',
    '🦁 León de Cristal',
    '🐋 Ballena Voladora Mística',
    '🦅 Ave Fénix del Tiempo',
    '🐢 Tortuga Portadora del Mundo',
    '🦄 Unicornio de Otra Dimensión'
]

const POWERS = [
    '✨ Controlar el Tiempo',
    '🌊 Hablar con los Elementos',
    '🎭 Shapeshifting',
    '🌈 Manipular la Realidad',
    '👁️ Visión del Futuro',
    '🎪 Teletransporte Dimensional',
    '🌙 Sanación Espiritual',
    '⚡ Energía Cósmica'
]

const MESSAGES = [
    'Tu viaje traerá grandes cambios',
    'Antiguos secretos serán revelados pronto',
    'Un poder oculto despertará pronto',
    'Un nuevo destino te espera en el horizonte',
    'Tu conexión espiritual se fortalecerá',
    'Una gran transformación sucederá',
    'La iluminación llegará desde una dirección inesperada',
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
    
    let txt = `╭═══❯ *🌙 DREAM WORLD* ❮═══\n`
    txt += `│ 👤 *Explorer:* ${name}\n`
    txt += `│ ⭐ *Level:* ${dream.level}\n`
    txt += `│ 💫 *Quality:* ${dream.quality}\n`
    txt += `│ 🌈 *Elements:*\n`
    for (const el of dream.elements) {
        txt += `│ ├ ${el}\n`
    }
    txt += `│ 🎪 *Events:*\n`
    for (const ev of dream.events) {
        txt += `│ ├ ${ev}\n`
    }
    txt += `│ 🌟 *Encounters:*\n`
    for (const enc of dream.encounters) {
        txt += `│ ├ ${enc}\n`
    }
    txt += `│ 💫 *Powers:*\n`
    for (const pow of dream.powers) {
        txt += `│ ├ ${pow}\n`
    }
    txt += `│ 🔮 *Message:*\n`
    txt += `│ ${dream.message}\n`
    txt += `╰════════════════════`
    
    await m.reply(txt)
}

export { pluginConfig as config, handler }