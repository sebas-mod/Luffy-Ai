const pluginConfig = {
    name: 'es',
    alias: ['apa'],
    category: 'fun',
    description: 'Pregunta al bot si algo es así',
    usage: '.apakah <pregunta>',
    example: '.apakah puedo ser rico?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    '¡Sí, por supuesto!',
    'No, parece que no.',
    'Puede ser, intenta de nuevo después.',
    'Hmm... creo que sí.',
    'Dudo, pero puede ser.',
    '¡Por supuesto! ¡100%!',
    'Imposible.',
    'Puede ser, ¿quién sabe?',
    'Yo creo que sí.',
    'Uy, parece que no.',
    '¡Claro, por qué no!',
    'No sé, pregunta a alguien más.',
    '¡Oh Dios, por supuesto!',
    'Hmm... parece que no.',
    '¡Estoy seguro de que sí!',
    'Nada probable.',
    'Tal vez, pero no te hagas muchas ilusiones.',
    '¡Claro que sí!',
    'No, lo siento.',
    '¡Sí se puede! ¡Ánimo!'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`❓ *ᴀᴘᴀᴋᴀʜ*\n\n> ¡Escribe una pregunta!\n\n*Ejemplo:*\n> .apakah puedo ser rico?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
