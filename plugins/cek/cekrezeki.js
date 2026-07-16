const pluginConfig = {
    name: 'cekrezeki',
    alias: ['rezeki', 'fortune'],
    category: 'cek',
    description: 'Mide tu nivel de fortuna hoy',
    usage: '.cekrezeki <nombre>',
    example: '.cekrezeki Budi',
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
    if (percent >= 90) desc = '¡Fortuna abundante! ¡Bote! 💰🎉'
    else if (percent >= 70) desc = '¡Fortuna fluida hoy~ 💵'
    else if (percent >= 50) desc = 'Fortuna suficiente, sé agradecido/a 🙏'
    else if (percent >= 30) desc = 'Fortuna justa 😅'
    else desc = 'Ten paciencia, la fortuna llegará~ 🫂'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}

Tu nivel de fortuna es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres medir el nivel de fortuna de @${mentioned.split('@')[0]}?

Su nivel de fortuna es de *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }