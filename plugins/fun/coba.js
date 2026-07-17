const pluginConfig = {
    name: 'intentar',
    alias: ['try'],
    category: 'fun',
    description: 'Intenta preguntar algo al bot',
    usage: '.coba <pregunta>',
    example: '.coba adivina lo que pienso',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Hmm, déjame intentar... ¡Estás pensando en comida!',
    'Adivino... ¡Estás aburrido!',
    'A ver... ¡Parece que estás feliz!',
    'Hmm, creo que estás confundido.',
    'Intento adivinar... ¿Extrañas a alguien?',
    'Parece que estás relajado.',
    'Adivino que estás en el celular.',
    'Hmm, seguro estás aburrido.',
    'A ver... ¡Quieres ir a pasear!',
    'Creo que necesitas entretenimiento.',
    'Hmm, ¡parece que estás contento!',
    'Intento... ¡Seguro estás curioso!',
    'Mi predicción: estás acostado.',
    'Hmm, quizás estás pensando en alguien especial.',
    'Intento: ¿quieres desahogarte?',
    '¡Parece que quieres jugar!',
    'Hmm, adivino que estás escuchando música.',
    'A ver... ¡Estás en tu cuarto!',
    'Creo que estás esperando algo.',
    'Hmm, mi predicción: ¡necesitas un amigo para charlar!'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`🎯 *ᴄᴏʙᴀ*\n\n> ¡Escribe algo!\n\n*Ejemplo:*\n> .coba adivina lo que pienso`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }
