const pluginConfig = {
    name: 'ceksexy',
    alias: ['sexy', 'hot'],
    category: 'cek',
    description: 'Mide qué tan sexi eres',
    usage: '.ceksexy <nombre>',
    example: '.ceksexy Budi',
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
        desc = '¡SEXY TOTAL! 🔥🔥🔥'
    } else if (percent >= 70) {
        desc = '¡Muy hot! 😏'
    } else if (percent >= 50) {
        desc = 'Bastante seductor/a~ 😊'
    } else if (percent >= 30) {
        desc = 'Normal 🙂'
    } else {
        desc = '¿Quizás lindo/a no sexi? 😅'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}

Tu nivel de sex appeal es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres medir el nivel de sex appeal de @${mentioned.split('@')[0]}?

Su nivel de sex appeal es de *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }