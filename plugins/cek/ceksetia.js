const pluginConfig = {
    name: 'ceksetia',
    alias: ['setia', 'loyal'],
    category: 'cek',
    description: 'Comprueba tu nivel de lealtad',
    usage: '.ceksetia <nombre>',
    example: '.ceksetia Budi',
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
    if (percent >= 90) desc = '¡Leal hasta la muerte! 💍💕'
    else if (percent >= 70) desc = '¡Muy leal y sincero! ❤️'
    else if (percent >= 50) desc = 'Bastante leal~ 😊'
    else if (percent >= 30) desc = 'Hmm... a veces titubea 😅'
    else desc = '¿Modo playboy/playgirl? 😏'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de lealtad es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar el nivel de lealtad de @${mentioned.split('@')[0]}? 
    
Su nivel de lealtad es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
