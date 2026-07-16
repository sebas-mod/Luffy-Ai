const pluginConfig = {
    name: 'cekcreative',
    alias: ['creative', 'kreatif'],
    category: 'cek',
    description: 'Mide tu nivel de creatividad',
    usage: '.cekcreative <nombre>',
    example: '.cekcreative Budi',
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
    if (percent >= 90) desc = '¡SÚPER CREATIVO/A! ¡Artista de verdad! 🎨✨'
    else if (percent >= 70) desc = '¡Muy imaginativo/a! 💡'
    else if (percent >= 50) desc = 'Bastante creativo/a 😊'
    else if (percent >= 30) desc = 'Normal 🤔'
    else desc = 'Poca imaginación 😅'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}

Tu nivel de creatividad es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres medir el nivel de creatividad de @${mentioned.split('@')[0]}?

Su nivel de creatividad es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }