const pluginConfig = {
    name: 'ceksexy',
    alias: ['sexy', 'hot'],
    category: 'cek',
    description: 'Comprueba cuán sexy eres',
    usage: '.ceksexy <nombre>',
    example: '.ceksexy Budi',
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
        desc = '¡SEXY TOTAL! 🔥🔥🔥'
    } else if (percent >= 70) {
        desc = '¡Muy hot! 😏'
    } else if (percent >= 50) {
        desc = 'Bastante tentador~ 😊'
    } else if (percent >= 30) {
        desc = 'Normalito 🙂'
    } else {
        desc = 'Quizás eres cute, no sexy 😅'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de sexy es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar el nivel de sexy de @${mentioned.split('@')[0]}? 
    
Su nivel de sexy es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
