const pluginConfig = {
    name: 'cekgacha',
    alias: ['gacha', 'luck'],
    category: 'cek',
    description: 'Comprueba tu suerte en la gacha',
    usage: '.cekgacha <nombre>',
    example: '.cekgacha Budi',
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
    if (percent >= 90) desc = '¡MUCHA SUERTE! ¡SSR GARANTIZADO! ✨💎'
    else if (percent >= 70) desc = '¡Lucky! Seguro que sacas SR o mejor! 🍀'
    else if (percent >= 50) desc = 'Un poco de suerte 😊'
    else if (percent >= 30) desc = 'Hmm... ¡rezamos más fuerte! 🙏'
    else desc = '¡MALA SUERTE! ¡Gacha después! 💔'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de gacha es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar el nivel de gacha de @${mentioned.split('@')[0]}? 
    
Su nivel de gacha es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
