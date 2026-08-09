const pluginConfig = {
    name: 'readmore',
    alias: ['selengkapnya', 'spoiler'],
    category: 'tools',
    description: 'Crea texto de "leer más" (spoiler)',
    usage: '.readmore <texto_inicial>|<texto_final>',
    example: '.readmore Hola|Este es un mensaje secreto',
    isGroup: false,
    isBotAdmin: false,
    isAdmin: false,
    cooldown: 5,
    carne: 1,
    isEnabled: true
};

function handler(m, { sock }) {
    const text = m.text;
    
    if (!text) {
        return m.reply(`⚠️ ¡Ingresa el texto!\nEjemplo: \`${m.prefix}${m.command} Hola|Este texto está oculto\``);
    }
    
    let [l, r] = text.split('|');
    if (!l) l = '';
    if (!r) r = '';
    
    const readmore = String.fromCharCode(8206).repeat(4001);
    
    m.reply(l + readmore + r);
}

export { pluginConfig as config, handler }