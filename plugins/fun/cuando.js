const pluginConfig = {
    name: 'cuando',
    alias: ['que_momento', 'en_que_momento'],
    category: 'fun',
    description: 'Pregunta al bot cuándo sucederá algo',
    usage: '.cuando <pregunta>',
    example: '.cuando me casaré?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
};

const answers = [
    '¿Quizás mañana?',
    'Creo que el año que viene.',
    '¡En 3 días!',
    'Hmm, todavía falta mucho.',
    '¡Dentro de poco!',
    'Cuando llegue el momento, sucederá.',
    '¡El próximo mes!',
    'No sé cuándo, lo importante es tener paciencia.',
    '¡Muy pronto!',
    '¿Quizás en 10 años?',
    '¡No falta mucho!',
    'Si es el destino, seguro se encuentran.',
    'Hmm, difícil de predecir.',
    '¡La próxima semana!',
    '¡Si te esfuerzas más, será más rápido!',
    'En el momento exacto.',
    'Muy pronto, tranquilo.',
    'Cuando estés listo.',
    '¡En cuestión de días!',
    'Cuando estés listo para recibirlo.'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`⏰ *¿ᴄᴜᴀ́ɴᴅᴏ?*\n\n> ¡Ingresa una pregunta!\n\n*Ejemplo:*\n> .cuando me casaré?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?\n*${answer}*`);
}

export { pluginConfig as config, handler }