const pluginConfig = {
    name: 'cektinggi',
    alias: ['tinggi', 'tall'],
    category: 'cek',
    description: 'Mide la estatura aleatoria',
    usage: '.cektinggi <nombre>',
    example: '.cektinggi Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
        const mentioned = m.mentionedJid[0] || m.sender

        const tinggi = Math.floor(Math.random() * 50) + 150
    
    let desc = ''
    if (tinggi >= 190) {
        desc = '¡MUY ALTO/A! ¡Modelo de baloncesto! 🏀'
    } else if (tinggi >= 175) {
        desc = '¡Estatura ideal! 😎'
    } else if (tinggi >= 165) {
        desc = 'Bastante alto/a 👍'
    } else if (tinggi >= 155) {
        desc = 'Estándar 🙂'
    } else {
        desc = '¡Lindo/a y diminuto/a! 🥺'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}

Tu estatura es *${tinggi} cm*
\`\`\`${desc}\`\`\`` : `¿Quieres medir la estatura de @${mentioned.split('@')[0]}?

Su estatura es de *${tinggi} cm*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }