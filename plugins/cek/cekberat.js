const pluginConfig = {
    name: 'cekberat',
    alias: ['berat', 'weight'],
    category: 'cek',
    description: 'Mide el peso aleatorio',
    usage: '.cekberat <nombre>',
    example: '.cekberat Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const berat = Math.floor(Math.random() * 60) + 40
    const mentioned = m.mentionedJid?.[0] || m.sender
    
    let desc = ''
    if (berat >= 90) {
        desc = '¡Buen cuerpo! 💪'
    } else if (berat >= 70) {
        desc = '¡Lleno/a y saludable! 😊'
    } else if (berat >= 55) {
        desc = '¡Ideal! 👍'
    } else if (berat >= 45) {
        desc = '¡Delgado/a~ 🌸'
    } else {
        desc = '¡Muy flaco/a, come más! 🍔'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}

Tu peso es *${berat} kg*
\`\`\`${desc}\`\`\`` : `¿Quieres medir el peso de @${mentioned.split('@')[0]}?

Su peso es de *${berat} kg*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
