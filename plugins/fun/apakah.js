const pluginConfig = {
    name: 'apakah',
    alias: ['apa'],
    category: 'fun',
    description: 'Pregunta al bot si algo es así',
    usage: '.apakah <pregunta>',
    example: '.apakah puedo hacerme rico?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
};

const answers = [
    '¡Sí, por supuesto!',
    'No, parece que no.',
    'Quizás, intenta de nuevo luego.',
    'Hmm... creo que sí.',
    'Lo dudo, pero podría ser.',
    '¡Seguro! ¡100%!',
    'Imposible.',
    'Podría ser, ¿quién sabe?',
    'Yo creo que sí.',
    'Vaya, creo que no.',
    'Claro, ¿por qué no?',
    'No lo sé, pregúntale a otro.',
    '¡Dios mío, claro que sí!',
    'Hmm... parece que no.',
    '¡Estoy seguro de que sí!',
    'Muy poco probable.',
    'Quizás, pero no te hagas demasiadas ilusiones.',
    '¡Sí claro!',
    'No, lo siento.',
    '¡Puedes! ¡Ánimo!'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`❓ *ᴀᴘᴀᴋᴀʜ*\n\n> ¡Ingresa una pregunta!\n\n*Ejemplo:*\n> .apakah puedo hacerme rico?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }