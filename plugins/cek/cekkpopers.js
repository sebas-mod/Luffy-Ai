const pluginConfig = {
    name: 'cekkpopers',
    alias: ['kpopers', 'kpop'],
    category: 'cek',
    description: 'Comprueba tu nivel de kpopper',
    usage: '.cekkpopers <nombre>',
    example: '.cekkpopers Budi',
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
    if (percent >= 90) desc = '¡ARMY/BLINK nivel máximo! 💜💗'
    else if (percent >= 70) desc = '¡Fan acérrimo! 🎤'
    else if (percent >= 50) desc = 'Oyente casual~ 🎵'
    else if (percent >= 30) desc = 'Sabe un poquito 😅'
    else desc = 'No es kpopper 🤷'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de kpopper es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar el nivel de kpopper de @${mentioned.split('@')[0]}? 
    
Su nivel de kpopper es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
