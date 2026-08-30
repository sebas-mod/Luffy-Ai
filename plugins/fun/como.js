const pluginConfig = {
    name: 'como',
    alias: ['de_que_manera', 'modo'],
    category: 'fun',
    description: 'Pregunta al bot cómo hacer algo',
    usage: '.como <pregunta>',
    example: '.como tener éxito?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
};

const answers = [
    'Es fácil, ¡solo hay que hacerlo!',
    'Hmm, es difícil de explicar. ¡Inténtalo primero!',
    'Con esfuerzo y oración, claro.',
    'Así nomás es como se hace.',
    'No lo sé muy bien, busca otras referencias.',
    'Poco a poco, luego podrás.',
    '¡Con trabajo duro y sin rendirse!',
    'Primero, confía en ti mismo.',
    'Hmm, cada persona tiene su propia manera.',
    'Sigue a tu corazón.',
    'Aprende de los que tienen experiencia.',
    'Paso a paso, sin apresurarse.',
    '¡Con determinación!',
    'Empieza por lo pequeño.',
    'Sé constante, luego lo lograrás.',
    '¡No le des tantas vueltas, actúa ya!',
    '¡Fácil! ¡Solo empieza!',
    '¿Cómo? ¡Pues inténtalo!',
    'Con la estrategia adecuada.',
    'Hmm, yo también sigo aprendiendo.'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`📋 *¿ᴄᴏ́ᴍᴏ?*\n\n> ¡Ingresa una pregunta!\n\n*Ejemplo:*\n> .como tener éxito?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`✦ ${m.body.slice(1)}?
┈┈┈┈┈┈┈┈┈┈
☽◯☾ ♰ *${answer}*`);
}

export { pluginConfig as config, handler }