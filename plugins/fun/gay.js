import config from '../../config.js'
const pluginConfig = {
    name: 'gay',
    alias: ['howgay'],
    category: 'fun',
    description: 'Señala al miembro más gay del grupo',
    usage: '.gay',
    isGroup: true,
    isBotAdmin: false,
    isAdmin: false,
    cooldown: 10,
    carne: 2,
    isEnabled: true
};

async function handler(m, { sock }) {
    if (!m.isGroup) return m.reply(config.messages.groupOnly);
    const groupMetadata = m.groupMetadata;
    const participants = groupMetadata.participants;
    const member = participants.map(u => u.jid);
    const persona1 = member[Math.floor(Math.random() * member.length)];
    const persona2 = member[Math.floor(Math.random() * member.length)];
    const text = `🔥┈┈┈┈┈┈┈┈┈┈\n☽◯☾ ♰ @${persona1.split('@')[0]} *está gay con* @${persona2.split('@')[0]}\n🔥┈┈┈┈┈┈┈┈┈┈`;
    await m.reply(text, { mentions: [persona1, persona2] })
}

export { pluginConfig as config, handler }