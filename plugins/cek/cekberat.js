const pluginConfig = {
    name: 'cekberat',
    alias: ['berat', 'weight'],
    category: 'cek',
    description: 'Comprueba tu peso al azar',
    usage: '.cekberat <nombre>',
    example: '.cekberat Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m) {
    const berat = Math.floor(Math.random() * 60) + 40
    const mentioned = m.mentionedJid?.[0] || m.sender
    
    let desc = ''
    if (berat >= 90) {
        desc = 'Big boy/girl! 💪'
    } else if (berat >= 70) {
        desc = '¡Robusto y saludable! 😊'
    } else if (berat >= 55) {
        desc = '¡Ideal total! 👍'
    } else if (berat >= 45) {
        desc = 'Delgado~ 🌸'
    } else {
        desc = '¡Muy flaco, come mucho! 🍔'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu peso es *${berat} kg*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar el peso de @${mentioned.split('@')[0]}? 
    
Su peso es *${berat} kg*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
