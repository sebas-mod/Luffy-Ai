const pluginConfig = {
    name: 'cekwibu',
    alias: ['wibu', 'weeb'],
    category: 'cek',
    description: 'Mide qué tan wibu eres',
    usage: '.cekwibu <nombre>',
    example: '.cekwibu Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
        const percent = Math.floor(Math.random() * 101)
    const mentioned = m.mentionedJid[0] || m.sender
                    
    let desc = ''
    if (percent >= 90) {
        desc = '¡WIBU DE VERDAD! ¡Ara ara~ 🎌'
    } else if (percent >= 70) {
        desc = '¡Muy wibu! ¡Kimochi~ 😍'
    } else if (percent >= 50) {
        desc = 'Bastante wibu 🌸'
    } else if (percent >= 30) {
        desc = 'Un poco wibu 😊'
    } else {
        desc = 'No eres wibu, normal 😎'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}

Tu nivel wibu es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres medir el nivel wibu de @${mentioned.split('@')[0]}?

Su nivel wibu es de *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }