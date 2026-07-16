const pluginConfig = {
    name: 'close',
    alias: ['tutup', 'closegroup', 'tutupgroup'],
    category: 'group',
    description: 'Cerrar grupo para que solo los admin puedan escribir',
    usage: '.close',
    example: '.close',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
};

async function handler(m, { sock }) {
    try {
        const groupMeta = m.groupMetadata;
        
        if (groupMeta.announce) {
            await m.reply(
                `⚠️ *ᴠᴀʟɪᴅᴀᴄɪóɴ ɴᴏ ᴠᴀ́ʟɪᴅᴀ*\n\n` +
                `> El grupo ya está en estado \`cerrado\`.\n` +
                `> Solo los admin pueden enviar mensajes.`
            );
            return;
        }
        
        await sock.groupSettingUpdate(m.chat, 'announcement');
        
        const senderNum = m.sender.split('@')[0];
        
        const successMsg = `✅ @${senderNum} ha cerrado este grupo`;
        
        await m.reply(successMsg, {mentions: [m.sender]})
        
    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> Error al cerrar el grupo.\n` +
            `> _${error.message}_`
        );
    }
}

export { pluginConfig as config, handler }