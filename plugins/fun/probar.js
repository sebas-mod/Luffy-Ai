const pluginConfig = {
    name: 'probar',
    alias: ['try'],
    category: 'fun',
    description: 'Prueba a preguntar algo al bot',
    usage: '.coba <pregunta>',
    example: '.coba adivina lo que estoy pensando',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
};

const answers = [
    'Hmm, déjame intentarlo... ¡Estás pensando en comida!',
    'Adivino... ¡Estás aburrido!',
    'A ver... ¡Parece que estás feliz!',
    'Hmm, creo que estás confundido.',
    'Déjame adivinar... ¿Extrañas a alguien?',
    'Creo que estás relajado.',
    'Adivino que estás desplazándote por el celular.',
    'Hmm, seguro estás aburrido, ¿no?',
    'Déjame adivinar... ¡Quieres salir de paseo!',
    'Creo que necesitas entretenimiento.',
    'Hmm, ¡parece que estás feliz!',
    'Déjame ver... ¡Seguro tienes curiosidad!',
    'Mi suposición: estás acostado.',
    'Hmm, quizás estés pensando en alguien especial.',
    'Déjame ver: ¿quieres desahogarte?',
    '¡Parece que quieres jugar un juego!',
    'Hmm, adivino que estás escuchando música.',
    'Déjame adivinar... ¡Estás en tu habitación!',
    'Creo que estás esperando algo.',
    'Hmm, mi suposición: ¡necesitas alguien con quien hablar!'
];

async function handler(m) {
    const text = m.text?.trim();
    
    if (!text) {
        return m.reply(`🎯 *ᴄᴏʙᴀ*\n\n> ¡Ingresa algo!\n\n*Ejemplo:*\n> .coba adivina lo que estoy pensando`);
    }
    
    const answer = answers[Math.floor(Math.random() * answers.length)];
    
    await m.reply(`${m.body.slice(1)}?
*${answer}*`);
}

export { pluginConfig as config, handler }