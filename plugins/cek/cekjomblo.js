const pluginConfig = {
    name: 'cekjomblo',
    alias: ['jomblo', 'single'],
    category: 'cek',
    description: 'Mide tu nivel de soltería',
    usage: '.cekjomblo <nombre>',
    example: '.cekjomblo Budi',
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
    if (percent >= 90) desc = '¡Soltero/a eterno/a! ¡La soltería es felicidad~ 💔😎'
    else if (percent >= 70) desc = '¡Persona fuerte e independiente! 💪'
    else if (percent >= 50) desc = 'Modo conquista activado 😍'
    else if (percent >= 30) desc = '¡Alguien te gusta parece~ 👀'
    else desc = '¡Pronto tendrás pareja! 💕'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de soltería es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres medir el nivel de soltería de @${mentioned.split('@')[0]}?
    
Su nivel de soltería es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }