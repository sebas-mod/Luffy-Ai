/**
 * Soul Match / Belahan Jiwa - Fun compatibility checker
 * Ported from RTXZY-MD-pro
 */

const pluginConfig = {
    name: 'soulmatch',
    alias: [],
    category: 'fun',
    description: 'Verificar compatibilidad de alma con alguien',
    usage: '.soulmatch nombre1|nombre2',
    example: '.soulmatch Raiden|Mei',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

const ELEMENTS = ['Fuego 🔥', 'Agua 💧', 'Tierra 🌍', 'Viento 🌪️', 'Rayo ⚡', 'Hielo ❄️', 'Luz ✨', 'Sombra 🌑']
const ZODIAC = ['♈ Aries', '♉ Tauro', '♊ Géminis', '♋ Cáncer', '♌ Leo', '♍ Virgo', 
               '♎ Libra', '♏ Escorpio', '♐ Sagitario', '♑ Capricornio', '♒ Acuario', '♓ Piscis']
const SOUL_TYPES = [
    "Líder Valiente", "Equilibrador Sabio", "Creador Expresivo", "Constructor Sólido", 
    "Aventurero Libre", "Protector Leal", "Pensador Místico", "Conquistador Fuerte", "Humanitario Puro"
]

function generateSoulData(name, seed) {
    const nameVal = Array.from(name.toLowerCase()).reduce((a, c) => a + c.charCodeAt(0), 0)
    return {
        element: ELEMENTS[(nameVal + seed) % ELEMENTS.length],
        zodiac: ZODIAC[(nameVal + seed * 2) % ZODIAC.length],
        soulType: SOUL_TYPES[(nameVal + seed * 3) % SOUL_TYPES.length]
    }
}

function getMatchDescription(score) {
    if (score >= 90) return "💫 Destino Verdadero"
    if (score >= 80) return "✨ Armonía Perfecta"
    if (score >= 70) return "🌟 Conexión Fuerte"
    if (score >= 60) return "⭐ Buen Potencial"
    if (score >= 50) return "🌙 Necesita Esfuerzo"
    return "🌑 Gran Desafío"
}

function getReading(score) {
    if (score >= 80) {
        return "Vuestros almas tienen una conexión muy especial y rara. El destino ha planeado este encuentro."
    } else if (score >= 60) {
        return "Hay una química fuerte entre ustedes. Vuestras diferencias crean armonía."
    } else if (score >= 40) {
        return "Necesitan tiempo para entenderse. Cada desafío fortalecerá vuestro vínculo."
    }
    return "Diferencias significativas en la energía del alma. Necesitan mucha adaptación y comprensión."
}

async function handler(m, { sock }) {
    const args = m.args || []
    const text = args.join(' ')
    
    if (!text || !text.includes('|')) {
        return m.reply(
            `💫 *sᴏᴜʟ ᴍᴀᴛᴄʜ*\n\n` +
            `> ¡Verifica la compatibilidad de alma de 2 personas!\n\n` +
            `*Formato:*\n` +
            `> \`.soulmatch nombre1|nombre2\`\n\n` +
            `*Ejemplo:*\n` +
            `> \`.soulmatch Raiden|Mei\``
        )
    }
    
    const [nama1, nama2] = text.split('|').map(n => n.trim())
    
    if (!nama1 || !nama2) {
        return m.reply(`❌ Ingresa 2 nombres con el formato: \`${m.prefix}soulmatch nombre1|nombre2\``)
    }
    
    await m.react('🕕')
    
    const seed1 = Date.now() % 100
    const seed2 = (Date.now() + 50) % 100
    const soul1 = generateSoulData(nama1, seed1)
    const soul2 = generateSoulData(nama2, seed2)
    const combined = nama1.toLowerCase() + nama2.toLowerCase()
    const baseScore = Array.from(combined).reduce((a, c) => a + c.charCodeAt(0), 0)
    const compatibility = (baseScore % 51) + 50 
    let txt = `╭═══❯ *💫 SOUL MATCH* ❮═══\n`
    txt += `│\n`
    txt += `│ 👤 *${nama1}*\n`
    txt += `│ ├ 🔮 Alma: ${soul1.soulType}\n`
    txt += `│ ├ 🌟 Elemento: ${soul1.element}\n`
    txt += `│ └ 🎯 Zodiaco: ${soul1.zodiac}\n`
    txt += `│\n`
    txt += `│ 👤 *${nama2}*\n`
    txt += `│ ├ 🔮 Alma: ${soul2.soulType}\n`
    txt += `│ ├ 🌟 Elemento: ${soul2.element}\n`
    txt += `│ └ 🎯 Zodiaco: ${soul2.zodiac}\n`
    txt += `│\n`
    txt += `│ 💕 *COMPATIBILIDAD*\n`
    txt += `│ ├ 📊 Puntuación: *${compatibility}%*\n`
    txt += `│ └ 🎭 Estado: ${getMatchDescription(compatibility)}\n`
    txt += `│\n`
    txt += `│ 🔮 *Lectura:*\n`
    txt += `│ ${getReading(compatibility)}\n`
    txt += `│\n`
    txt += `╰════════════════════`
    await m.reply(txt)
    m.react('✅')
}

export { pluginConfig as config, handler }
