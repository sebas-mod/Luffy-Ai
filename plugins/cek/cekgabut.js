const pluginConfig = {
    name: 'cekgabut',
    alias: ['gabut', 'bored'],
    category: 'cek',
    description: 'Comprueba tu nivel de aburrimiento',
    usage: '.cekgabut <nombre>',
    example: '.cekgabut Budi',
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
    if (percent >= 90) desc = '¡ABURRIDO NIVEL MAX! Juega con el bot~ 🥱'
    else if (percent >= 70) desc = 'Aburrido severo! 😴'
    else if (percent >= 50) desc = 'Bastante aburrido 😅'
    else if (percent >= 30) desc = 'Un poco ocupado 📝'
    else desc = '¡Muy ocupado! ¡Productivo! 💼'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de aburrimiento es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar el nivel de aburrimiento de @${mentioned.split('@')[0]}? 
    
Su nivel de aburrimiento es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
