const pluginConfig = {
    name: 'open',
    alias: ["abrir", "opengroup", "abrir_grupo"],
    category: 'group',
    description: 'Abrir el grupo para que todos los miembros puedan chatear',
    usage: '.open',
    example: '.open',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    carne: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
};

async function handler(m, { sock }) {
    try {
        const groupMeta = m.groupMetadata;
        
        if (!groupMeta.announce) {
            await m.reply(
                `⚠️ *ᴠᴀʟɪᴅᴀᴄɪóɴ ʀᴇᴄʜᴀᴢᴀᴅᴀ*\n\n` +
                `> El grupo ya está en estado \`abierto\`.\n` +
                `> Todos los miembros ya pueden enviar mensajes.`
            );
            return;
        }
        
        await sock.groupSettingUpdate(m.chat, 'not_announcement');
        
        const senderNum = m.sender.split('@')[0];
        
        const successMsg = `✅ @${senderNum} abrió este grupo\n_Ahora todos pueden enviar mensajes_`;
        
        await m.reply(successMsg, { mentions: [m.sender] });
        
    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> No se pudo abrir el grupo.\n` +
            `> _${error.message}_`
        );
    }
}

export { pluginConfig as config, handler }