const pluginConfig = {
    name: 'acaso',
    alias: ['quizas', 'ocurrira'],
    category: 'fun',
    description: 'Pregunta al bot si algo sucederá',
    usage: '.acaso <pregunta>',
    example: '.acaso seré exitoso?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
};

const answers = [
    '¡Sí, seguro sucederá!',
    'No, parece que no.',
    'Quizás sí, quizás no.',
    '¡Si Dios quiere, sucederá!',
    'Hmm, difícil de predecir.',
    '¡Seguro! ¡Confía!',
    'Creo que no.',
    'Sucederá si te esfuerzas.',
    'En algún momento, seguro.',
    'No sucederá, lo siento.',
    '¡Claro que sí! ¡Espera!',
    'Hmm, lo dudo.',
    '¡Sí! ¡Confía en el proceso!',
    'Es poco probable.',
    '¡Seguro que sí, estoy convencido!',
    'No sucederá, busca otra cosa.',
    'Sí, pero lleva tiempo.',
    '¡Si Dios quiere!',
    'Si es el destino, sucederá.',
    '¡Sucederá en el momento justo!'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`🔮 *¿ᴘᴀsᴀʀᴀ́?*\n\n> ¡Ingresa una pregunta!\n\n*Ejemplo:*\n> .acaso seré exitoso?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`✦ ${m.body.slice(1)}?
┈┈┈┈┈┈┈┈┈┈
☽◯☾ ♰ *${answer}*`);
}

export { pluginConfig as config, handler }