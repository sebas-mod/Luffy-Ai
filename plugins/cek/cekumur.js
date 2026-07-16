const pluginConfig = {
    name: 'cekumur',
    alias: ['umur', 'age'],
    category: 'cek',
    description: 'Mide tu edad mental',
    usage: '.cekumur <nombre>',
    example: '.cekumur Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
        const percent = Math.floor(Math.random() * 80) + 5
    const mentioned = m.mentionedJid[0] || m.sender
                    
    let desc = ''
    if (percent >= 60) desc = '¡Sabio/a como un anciano! 🧓'
    else if (percent >= 40) desc = 'Maduro/a y adulto/a~ 🧑'
    else if (percent >= 20) desc = '¡Espíritu joven! 🧒'
    else desc = '¡Todavía como un niño/a~ 👶'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}

Tu edad es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres medir la edad de @${mentioned.split('@')[0]}?

Su edad es de *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }