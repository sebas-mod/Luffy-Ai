const pluginConfig = {
    name: 'cekbucin',
    alias: ['bucin'],
    category: 'cek',
    description: 'Mide qué tan enamorado/a estás',
    usage: '.cekbucin <nombre>',
    example: '.cekbucin Budi',
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
        desc = '¡ENAMORADO/A TERMINAL! ¡No hay remedio! 😭💔'
    } else if (percent >= 70) {
        desc = '¡Muy enamorado/a~ 🥺'
    } else if (percent >= 50) {
        desc = 'Bastante enamorado/a 💕'
    } else if (percent >= 30) {
        desc = 'Un poco enamorado/a 😊'
    } else {
        desc = 'Tranquilo/a, no estás enamorado/a 😎'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}

Tu nivel de enamoramiento es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres medir el nivel de enamoramiento de @${mentioned.split('@')[0]}?

Su nivel de enamoramiento es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }