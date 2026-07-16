const pluginConfig = {
    name: 'cekotaku',
    alias: ['otaku'],
    category: 'cek',
    description: 'Mide tu nivel de otaku',
    usage: '.cekotaku <nombre>',
    example: '.cekotaku Budi',
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
    if (percent >= 90) desc = '¡SUGOI! ¡Otaku de verdad! 🎌✨'
    else if (percent >= 70) desc = 'Nivel weeb alto~ 🇯🇵'
    else if (percent >= 50) desc = 'Disfruta anime casual 📺'
    else if (percent >= 30) desc = 'Sabe un poco de anime 🤔'
    else desc = '¡Normie detectado/a! 😂'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de otaku es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres medir el nivel de otaku de @${mentioned.split('@')[0]}?
    
Su nivel de otaku es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }