const pluginConfig = {
    name: 'cekcupu',
    alias: ['cupu', 'noob'],
    category: 'cek',
    description: 'Mide tu nivel de novato/a',
    usage: '.cekcupu <nombre>',
    example: '.cekcupu Budi',
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
    if (percent >= 90) desc = '¡MUY NOVATO/A! ¡NOOB DETECTADO! 🤡'
    else if (percent >= 70) desc = '¡Todavía novato/a~ 😅'
    else if (percent >= 50) desc = 'Normal 🤔'
    else if (percent >= 30) desc = '¡Bastante bueno/a! 💪'
    else desc = '¡PRO PLAYER! ¡GG! 🏆'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}

Tu nivel de novedad es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres medir el nivel de novedad de @${mentioned.split('@')[0]}?

Su nivel de novedad es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }