const pluginConfig = {
    name: 'cekcupu',
    alias: ['cupu', 'noob'],
    category: 'cek',
    description: 'Comprueba cuán noob eres',
    usage: '.cekcupu <nombre>',
    example: '.cekcupu Budi',
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
    if (percent >= 90) desc = '¡CUPU SEVERO! ¡NOOB DETECTADO! 🤡'
    else if (percent >= 70) desc = 'Todavía eres novato~ 😅'
    else if (percent >= 50) desc = 'Normalito 🤔'
    else if (percent >= 30) desc = '¡Bastante bueno! 💪'
    else desc = '¡PRO PLAYER! ¡GG! 🏆'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de noob es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar el nivel de noob de @${mentioned.split('@')[0]}? 
    
Su nivel de noob es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
