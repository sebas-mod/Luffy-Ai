const pluginConfig = {
    name: 'stop',
    alias: ['shutdown', 'kill'],
    category: 'owner',
    description: 'Detener el proceso del bot',
    usage: '.stop',
    example: '.stop',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    carne: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    await m.reply('☽◯☾ ╭━ ♰ 🛑 SISTEMA ♰ ━╮ ☽◯☾\n┃ *Deteniendo el Bot...*\n╰━ ⊱༺༒༻⊰ ━╯\n\n☽◯☾ ♰ El bot se apagó. Debe encenderse manualmente desde la terminal.')
    console.log('Stopping via command...')
    
    // Permitir que el mensaje se envíe antes de salir
    setTimeout(() => {
        process.exit(1) // El código de salida 1 detiene el auto-restart en bucles simples
    }, 1000)
}

export { pluginConfig as config, handler }