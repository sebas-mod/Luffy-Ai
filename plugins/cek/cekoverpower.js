const pluginConfig = {
    name: 'cekoverpower',
    alias: ['overpower', 'op'],
    category: 'cek',
    description: 'Mide tu nivel de poder',
    usage: '.cekoverpower <nombre>',
    example: '.cekoverpower Budi',
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
    if (percent >= 90) desc = '¡PODER ABSOLUTO! ¡LEYENDA! 👑🔥'
    else if (percent >= 70) desc = '¡Muy fuerte! 💪'
    else if (percent >= 50) desc = 'Bastante fuerte~ 😎'
    else if (percent >= 30) desc = 'Normal 🤔'
    else desc = 'Necesitas más entrenamiento 📝'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de poder es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres medir el nivel de poder de @${mentioned.split('@')[0]}?
    
Su nivel de poder es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }