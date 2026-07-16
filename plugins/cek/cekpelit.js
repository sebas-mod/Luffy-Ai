const pluginConfig = {
    name: 'cekpelit',
    alias: ['pelit', 'kikir'],
    category: 'cek',
    description: 'Mide qué tan tacaño/a eres',
    usage: '.cekpelit <nombre>',
    example: '.cekpelit Budi',
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
    if (percent >= 90) {
        desc = '¡SÚPER TACAÑO/A! ¡Guarda el dinero a toda costa! 💸'
    } else if (percent >= 70) {
        desc = '¡Muy tacaño/a! 🙊'
    } else if (percent >= 50) {
        desc = 'Bastante tacaño/a 😅'
    } else if (percent >= 30) {
        desc = 'Un poco ahorrador/a 😊'
    } else {
        desc = '¡Muy generoso/a! 🎁'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de tacañería es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres medir el nivel de tacañería de @${mentioned.split('@')[0]}?
    
Su nivel de tacañería es *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }