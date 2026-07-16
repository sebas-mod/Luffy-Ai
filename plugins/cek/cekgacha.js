const pluginConfig = {
    name: 'cekgacha',
    alias: ['gacha', 'luck'],
    category: 'cek',
    description: 'Mide tu suerte en gacha',
    usage: '.cekgacha <nombre>',
    example: '.cekgacha Budi',
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
    if (percent >= 90) desc = '¡SUERTE EXTREMA! ¡SSR GARANTIZADO! ✨💎'
    else if (percent >= 70) desc = '¡Suerte! ¡Seguro sacas SR o mejor! 🍀'
    else if (percent >= 50) desc = 'Un poco de suerte 😊'
    else if (percent >= 30) desc = 'Hmm... ¡reza más fuerte! 🙏'
    else desc = '¡MALA SUERTE! ¡Mejor espera para gachar! 💔'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}

Tu suerte en gacha es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres medir la suerte en gacha de @${mentioned.split('@')[0]}?

Su suerte en gacha es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }