const pluginConfig = {
    name: 'cekkarma',
    alias: ['karma'],
    category: 'cek',
    description: 'Comprueba tu nivel de karma',
    usage: '.cekkarma <nombre>',
    example: '.cekkarma Budi',
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
    if (percent >= 80) desc = '¡Buen karma! El cielo te espera~ ✨'
    else if (percent >= 60) desc = 'Bastante bueno, ¡sigue mejorando! 🙏'
    else if (percent >= 40) desc = 'Neutral, haz más el bien~ ⚖️'
    else if (percent >= 20) desc = '¡Cuidado con el mal karma! ⚠️'
    else desc = 'Vaya, necesitas mucha penitencia... 😱'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de karma es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar el nivel de karma de @${mentioned.split('@')[0]}? 
    
Su nivel de karma es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
