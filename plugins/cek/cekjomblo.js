const pluginConfig = {
    name: 'cekjomblo',
    alias: ['jomblo', 'single'],
    category: 'cek',
    description: 'Comprueba tu nivel de soltería',
    usage: '.cekjomblo <nombre>',
    example: '.cekjomblo Budi',
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
    if (percent >= 90) desc = '¡Soltero eterno! Soltero es felicidad~ 💔😎'
    else if (percent >= 70) desc = '¡Persona fuerte e independiente! 💪'
    else if (percent >= 50) desc = 'Todavía en modo coqueteo 😍'
    else if (percent >= 30) desc = 'Parece que alguien le gusta~ 👀'
    else desc = '¡Pronto estará comprometido! 💕'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de soltería es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar el nivel de soltería de @${mentioned.split('@')[0]}? 
    
Su nivel de soltería es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
