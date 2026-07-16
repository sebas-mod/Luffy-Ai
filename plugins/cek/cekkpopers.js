const pluginConfig = {
    name: 'cekkpopers',
    alias: ['kpopers', 'kpop'],
    category: 'cek',
    description: 'Mide tu nivel de kpopers',
    usage: '.cekkpopers <nombre>',
    example: '.cekkpopers Budi',
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
    if (percent >= 90) desc = '¡Nivel ARMY/BLINK máximo! 💜💗'
    else if (percent >= 70) desc = '¡Fanático/a! 🎤'
    else if (percent >= 50) desc = 'Escucha casual~ 🎵'
    else if (percent >= 30) desc = 'Sabe un poquito 😅'
    else desc = 'No es kpopers 🤷'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel kpop es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres medir el nivel kpop de @${mentioned.split('@')[0]}?
    
Su nivel kpop es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }