const pluginConfig = {
    name: 'cekimut',
    alias: ['imut', 'cute'],
    category: 'cek',
    description: 'Comprueba cuán lindo eres',
    usage: '.cekimut <nombre>',
    example: '.cekimut Ani',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    carne: 0,
    isEnabled: true
}

async function handler(m) {
        const percent = Math.floor(Math.random() * 101)
    const mentioned = m.mentionedJid[0] || m.sender
                    
    let desc = ''
    if (percent >= 90) {
        desc = '¡ADORABILÍSIMO! Kawaii~~ 🥺💕'
    } else if (percent >= 70) {
        desc = '¡Demasiado lindo! 😍'
    } else if (percent >= 50) {
        desc = 'Bastante lindo~ 🌸'
    } else if (percent >= 30) {
        desc = 'Un poquito lindo 😊'
    } else {
        desc = '¿Quizás eres cool y no lindo? 😎'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de lindura es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar el nivel de lindura de @${mentioned.split('@')[0]}? 
    
Su nivel de lindura es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
