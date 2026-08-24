import config from '../../config.js'
/**
 * @file plugins/owner/self.js
 * @description Plugin para activar el modo self (solo owner y bot)
 */
import { getDatabase } from '../../src/lib/luffy-database.js'
import te from '../../src/lib/luffy-error.js'
const pluginConfig = {
    name: 'self',
    alias: ['selfmode', 'private-mode'],
    category: 'owner',
    description: 'Activar el modo self (solo el owner y el bot pueden acceder)',
    usage: '.self',
    example: '.self',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    carne: 0,
    isEnabled: true
};

/**
 * Handler para el comando self
 */
async function handler(m, { sock }) {
    try {
        const isRealOwner = validateOwner(m);
        if (!isRealOwner) {
            return await m.reply('🚫 *ᴀᴄᴄᴇsᴏ ᴅᴇɴᴇɢᴀᴅᴏ*\n\n> ¡Solo el owner puede cambiar el modo del bot!');
        }
        const currentMode = config.mode;
        if (currentMode === 'self') {
            return await m.reply('╭━〔 ⚙️ SISTEMA 〕━╮\n┃ ℹ️ El bot ya está en modo *self*\n╰━━━━━━━━╯');
        }
        config.mode = 'self';
        const db = getDatabase();
        db.setting('botMode', 'self');
        
        const responseText = `🔒 *ᴍᴏᴅᴏ sᴇʟꜰ ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n` +
            `╭━〔 ✦ ÉXITO 〕━━━╮\n` +
            `┃ El bot ahora solo responde:\n` +
            `┃ • Al owner del bot 👑\n` +
            `┃ • Al propio bot (fromMe)\n` +
            `╰━━━━━━━━━━━━╯\n\n` +
            `_Usa .public para abrir el acceso_`;
        await m.reply(responseText);
        console.log(`[Mode] Changed to SELF by ${m.pushName} (${m.sender})`);
    } catch (error) {
        console.error('[Self Command Error]', error);
        await m.reply(te(m.prefix, m.command, m.pushName));
    }
}

/**
 * Validación del owner con múltiples verificaciones
 */
function validateOwner(m) {
    if (!m.isOwner) return false;
    if (m.fromMe) return true;
    const senderNumber = m.sender?.replace(/[^0-9]/g, '') || '';
    const ownerNumbers = config.owner?.number || [];
    
    const isInOwnerList = ownerNumbers.some(owner => {
        const cleanOwner = owner.replace(/[^0-9]/g, '');
        return senderNumber.includes(cleanOwner) || cleanOwner.includes(senderNumber);
    });
    if (!isInOwnerList) return false;
    if (!m.sender || !m.sender.includes('@')) return false;
    return true;
}

export { pluginConfig as config, handler }