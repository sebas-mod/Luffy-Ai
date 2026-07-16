const pluginConfig = {
    name: 'cekyandere',
    alias: ['yandere'],
    category: 'cek',
    description: 'Mide tu nivel de yandere',
    usage: '.cekyandere <nombre>',
    example: '.cekyandere Budi',
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
    if (percent >= 90) desc = '¡Eres mío/a para siempre~ 🔪💕'
    else if (percent >= 70) desc = 'No te acerques a él/ella... 👁️'
    else if (percent >= 50) desc = 'Un poco sobreprotector/a~ 🫂'
    else if (percent >= 30) desc = 'Algo posesivo/a 😅'
    else desc = 'Normal, tranquilo/a 😊'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}

Tu nivel yandere es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres medir el nivel yandere de @${mentioned.split('@')[0]}?

Su nivel yandere es de *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }