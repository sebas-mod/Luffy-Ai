const pluginConfig = {
    name: 'mengapa',
    alias: ['kenapa', 'why'],
    category: 'fun',
    description: 'Pregunta al bot por qué pasa algo',
    usage: '.mengapa <pregunta>',
    example: '.mengapa ¿por qué el cielo es azul?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Porque así estaba escrito.',
    'Hmm, buena pregunta. Yo también me lo pregunto.',
    'Porque así funciona.',
    'Porque Dios quiso que fuera así.',
    'No lo sé, búscala en Google.',
    'Porque así es nomás.',
    'Tal vez por coincidencia.',
    'Porque el mundo está lleno de misterios.',
    'Hmm, difícil de explicar.',
    'Porque el universo funciona de formas misteriosas.',
    'Yo también me pregunto, ¿por qué será?',
    'Porque así tenía que pasar.',
    '¡Buena pregunta! Lástima que no tenga la respuesta.',
    'Porque eso es lo que hace la vida única.',
    'Porque cada cosa tiene su razón.',
    'Hmm... necesito tiempo para pensarlo.',
    'Porque así es la lógica.',
    'Creo que es porque tenía que ser así.',
    'Porque todo está conectado.',
    '¡Eso también me lo pregunto!'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`🤔 *ᴍᴇɴɢᴀᴘᴀ*\n\n> ¡Ingresa una pregunta!\n\n*Ejemplo:*\n> .mengapa ¿por qué el cielo es azul?`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?\n*${answer}*`);
}

export { pluginConfig as config, handler }
