const pluginConfig = {
    name: 'cektinggi',
    alias: ['tinggi', 'tall'],
    category: 'cek',
    description: 'Comprueba la altura al azar',
    usage: '.cektinggi <nombre>',
    example: '.cektinggi Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m) {
        const mentioned = m.mentionedJid[0] || m.sender

        const tinggi = Math.floor(Math.random() * 50) + 150
    
    let desc = ''
    if (tinggi >= 190) {
        desc = '¡MUY ALTO! ¡Modelo de baloncesto! 🏀'
    } else if (tinggi >= 175) {
        desc = '¡Altura ideal! 😎'
    } else if (tinggi >= 165) {
        desc = 'Bastante alto 👍'
    } else if (tinggi >= 155) {
        desc = 'Estándar 🙂'
    } else {
        desc = '¡Pequeño y adorable! 🥺'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu altura es *${tinggi} cm*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar la altura de @${mentioned.split('@')[0]}? 
    
Su altura es *${tinggi} cm*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
