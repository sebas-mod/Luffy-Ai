const pluginConfig = {
    name: 'cekprocastinator',
    alias: ['procrastinator', 'nunda'],
    category: 'cek',
    description: 'Comprueba tu nivel de procrastinación',
    usage: '.cekprocastinator <nombre>',
    example: '.cekprocastinator Budi',
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
    if (percent >= 90) desc = '¿Deadline? Mejor mañana~ 😴'
    else if (percent >= 70) desc = '¡Maestro de la procrastinación! 🦥'
    else if (percent >= 50) desc = 'A veces pospone, a veces es diligente 😅'
    else if (percent >= 30) desc = '¡Bastante productivo! 💪'
    else desc = '¡Alta disciplina! ¡Felicidades! 🏆'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de procrastinación es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar el nivel de procrastinación de @${mentioned.split('@')[0]}? 
    
Su nivel de procrastinación es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
