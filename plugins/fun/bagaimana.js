const pluginConfig = {
    name: 'bagaimana',
    alias: ['gimana', 'how'],
    category: 'fun',
    description: 'Pregunta al bot cómo hacer algo',
    usage: '.bagaimana <pregunta>',
    example: '.bagaimana ser exitoso?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Es fácil, ¡solo hazlo!',
    'Hmm, es difícil de explicar. ¡Inténtalo primero!',
    'Con esfuerzo y oración, claro.',
    'Pues así es como se hace.',
    'No estoy muy seguro, busca otra referencia.',
    'Poco a poco, ya podrás.',
    '¡Con trabajo duro y sin rendirte!',
    'Primero, cree en ti mismo.',
    'Hmm, cada persona tiene su manera.',
    'Sigue lo que dice tu corazón.',
    'Aprende de los que ya tienen experiencia.',
    'Paso a paso, no te apures.',
    '¡Con mucha determinación!',
    'Empieza por lo pequeño.',
    'Sé constante, ya podrás.',
    'No pienses demasiado, ¡actúa directamente!',
    '¡Fácil! ¡Solo empieza!',
    '¿Cómo? ¡Pruébalo primero!',
    'Con la estrategia correcta.',
    'Hmm, yo también estoy aprendiendo.'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`📋 *ʙᴀɢᴀɪᴍᴀɴᴀ*\n\n> ¡Escribe una pregunta!\n\n*Ejemplo:*\n> .bagaimana ser exitoso?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
