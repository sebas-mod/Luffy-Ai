const pluginConfig = {
    name: 'hapusabsen',
    alias: ['deleteabsen', 'tutupabsen', 'closeabsen', 'resetabsen'],
    category: 'group',
    description: 'Eliminar/cerrar sesión de asistencia (solo admin)',
    usage: '.hapusabsen',
    example: '.hapusabsen',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true
}

if (!global.absensi) global.absensi = {}

async function handler(m) {
    const chatId = m.chat
    
    if (!global.absensi[chatId]) {
        return m.reply(
            `❌ *ɴᴏ ʜᴀʏ sᴇsɪ ᴅᴇ ᴀsɪsᴛᴇɴᴄɪᴀ*\n\n` +
            `> ¡No hay sesión de asistencia en este grupo!`
        )
    }
    
    const absen = global.absensi[chatId]
    const totalPeserta = absen.peserta.length
    
    delete global.absensi[chatId]
    
    await m.reply(
        `✅ *¡ASISTENCIA CERRADA!*\n\n` +
        `¿Motivo?\n` +
        `📝 ${absen.keterangan}\n` +
        `👥 Total presentes: ${totalPeserta}\n\n` +
        `La sesión de asistencia fue eliminada. ¡Shishishi!`
    )
}

export { pluginConfig as config, handler }