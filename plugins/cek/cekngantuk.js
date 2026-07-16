const pluginConfig = {
    name: 'cekngantuk',
    alias: ['ngantuk', 'sleepy'],
    category: 'cek',
    description: 'Mide tu nivel de somnolencia',
    usage: '.cekngantuk <nombre>',
    example: '.cekngantuk Budi',
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
    if (percent >= 90) desc = 'ZZZZZ... ¡Ve a dormir! 😴💤'
    else if (percent >= 70) desc = 'Ojos a punto de cerrarse~ 😪'
    else if (percent >= 50) desc = 'Un poco cansado/a 🥱'
    else if (percent >= 30) desc = '¡Todavía fresco/a! ☕'
    else desc = '¡Despierto/a totalmente! ¿Insomnio? 👀'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de somnolencia es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres medir el nivel de somnolencia de @${mentioned.split('@')[0]}?
    
Su nivel de somnolencia es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }