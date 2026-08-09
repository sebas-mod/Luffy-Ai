const pluginConfig = {
    name: 'cekcreative',
    alias: ['creative', 'kreatif'],
    category: 'cek',
    description: 'Comprueba tu nivel de creatividad',
    usage: '.cekcreative <nombre>',
    example: '.cekcreative Budi',
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
    if (percent >= 90) desc = '¡SUPER CREATIVO! ¡Artista de verdad! 🎨✨'
    else if (percent >= 70) desc = '¡Muy imaginativo! 💡'
    else if (percent >= 50) desc = 'Bastante creativo 😊'
    else if (percent >= 30) desc = 'Normalito 🤔'
    else desc = 'Le falta imaginación 😅'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de creatividad es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar el nivel de creatividad de @${mentioned.split('@')[0]}? 
    
Su nivel de creatividad es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
