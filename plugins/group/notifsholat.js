import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'notifsholat',
    alias: ['notifsolat'],
    category: 'group',
    description: 'Alternar notificación de horario de oración para este grupo',
    usage: '.notifsholat on/off',
    example: '.notifsholat on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
};

function handler(m, { sock, db }) {
    if (!m.isAdmin && !m.isOwner) {
        return m.reply(`❌ Solo los admins del grupo pueden usar esta función`);
    }

    const args = m.args[0]?.toLowerCase();
    const group = db.getGroup(m.chat) || {};
    const globalDb = getDatabase();
    const kotaSetting = globalDb.setting('autoSholatKota') || { nama: 'KOTA JAKARTA' };

    if (!['on', 'off'].includes(args)) {
        const isGlobalActive = globalDb.setting('autoSholat') || false;
        const statusGlobal = isGlobalActive ? '✅ ACTIVO' : '❌ INACTIVO';
        const statusGrup = group.notifSholat !== false ? '✅ ACTIVO' : '❌ INACTIVO';
        
        return m.reply(
            `🕌 *RECORDATORIO DE HORARIO DE ORACIÓN*\n\n` +
            `Estado Global: *${statusGlobal}* (Del Owner)\n` +
            `Estado del Grupo: *${statusGrup}*\n` +
            `Ubicación: *${kotaSetting.nama}*\n\n` +
            `*CONFIGURACIÓN DEL GRUPO:*\n` +
            `• *${m.prefix}notifsholat on* — Activar notif en este grupo\n` +
            `• *${m.prefix}notifsholat off* — Desactivar notif en este grupo\n\n` +
            `*CÓMO FUNCIONA:*\n` +
            `1. Envía mp3 de adzan e imagen del horario al momento de la oración\n` +
            `2. Sigue el horario en tiempo real de myquran.com\n` +
            `3. Si el Estado Global está INACTIVO, el grupo no recibirá adzan aunque el Estado del Grupo esté ACTIVO.\n` +
            `4. Si el grupo se siente molesto, el admin puede desactivarlo específicamente para este grupo.`
        );
    }

    if (args === 'on') {
        group.notifSholat = true;
        db.setGroup(m.chat, group);
        return m.reply(`✅ *ɴᴏᴛɪꜰ ᴅᴇ ᴏʀᴀᴄɪóɴ ᴀᴄᴛɪᴠᴀᴅᴀ*\n\n> Este grupo recibirá recordatorios de horario de oración\n> Ubicación: ${kotaSetting.nama}`);
    }

    if (args === 'off') {
        group.notifSholat = false;
        db.setGroup(m.chat, group);
        return m.reply(`❌ *ɴᴏᴛɪꜰ ᴅᴇ ᴏʀᴀᴄɪóɴ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴀ*`);
    }
}

export { pluginConfig as config, handler }