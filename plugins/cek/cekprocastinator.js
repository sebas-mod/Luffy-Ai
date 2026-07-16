const pluginConfig = {
    name: 'cekprocastinator',
    alias: ['procrastinator', 'nunda'],
    category: 'cek',
    description: 'Mide tu tendencia a procrastinar',
    usage: '.cekprocastinator <nombre>',
    example: '.cekprocastinator Budi',
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
    if (percent >= 90) desc = '¿Fecha límite? ¡Mañana! 😴'
    else if (percent >= 70) desc = '¡Maestro de la procrastinación! 🦥'
    else if (percent >= 50) desc = 'A veces procrastinas, a veces eres trabajador/a 😅'
    else if (percent >= 30) desc = '¡Bastante productivo/a! 💪'
    else desc = '¡Muy disciplinado/a! ¡Saludo! 🏆'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}

Tu nivel de procrastinación es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres medir el nivel de procrastinación de @${mentioned.split('@')[0]}?

Su nivel de procrastinación es de *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }