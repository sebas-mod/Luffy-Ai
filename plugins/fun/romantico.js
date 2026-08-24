import { getRandomItem } from '../../src/lib/luffy-game-data.js'
const pluginConfig = {
    name: 'romantico',
    alias: ['gombal', 'love', 'romantis'],
    category: 'fun',
    description: 'Palabras de amor/romance aleatorias',
    usage: '.bucin',
    example: '.bucin',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
};

async function handler(m) {
    const quote = getRandomItem('bucin.json');
    
    if (!quote) {
        await m.reply('❌ ¡Datos no disponibles!');
        return;
    }
    
    await m.reply(`꧁༺ 💘 ROMÁNTICO ༻꧂
──────────
\`\`\`"${quote}"\`\`\`\n\n`);
}

export { pluginConfig as config, handler }