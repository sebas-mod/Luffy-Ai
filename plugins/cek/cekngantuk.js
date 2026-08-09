const pluginConfig = {
    name: 'cekngantuk',
    alias: ['ngantuk', 'sleepy'],
    category: 'cek',
    description: 'Comprueba tu nivel de sueño',
    usage: '.cekngantuk <nombre>',
    example: '.cekngantuk Budi',
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
    if (percent >= 90) desc = 'ZZZZZ... ¡Vete a dormir! 😴💤'
    else if (percent >= 70) desc = 'Ojos de 5 vatios~ 😪'
    else if (percent >= 50) desc = 'Un poco somnoliento 🥱'
    else if (percent >= 30) desc = '¡Todavía fresco! ☕'
    else desc = '¡Muy despierto! ¿Insomnio? 👀'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de sueño es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar el nivel de sueño de @${mentioned.split('@')[0]}? 
    
Su nivel de sueño es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
