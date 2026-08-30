const pluginConfig = {
    name: 'eliminar_asistencia',
    alias: ["deleteabsen", "cerrar_asistencia", "closeabsen", "resetabsen"],
    category: 'group',
    description: 'Eliminar/cerrar sesión de asistencia (solo admins)',
    usage: '.eliminar_asistencia',
    example: '.eliminar_asistencia',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    carne: 0,
    isEnabled: true,
    isAdmin: true
}

if (!global.absensi) global.absensi = {}

async function handler(m) {
    const chatId = m.chat
    
    if (!global.absensi[chatId]) {
        return m.reply(
            `❌ *ᴛɪᴅᴀᴋ ʜᴀʏ ᴀsɪsᴛᴇɴᴄɪᴀ*\n\n` +
            `> No hay una sesión de asistencia en este grupo!`
        )
    }
    
    const absen = global.absensi[chatId]
    const totalPeserta = absen.peserta.length
    
    delete global.absensi[chatId]
    
    await m.reply(
        `✅ *¡ASISTENCIA CERRADA!*\n\n` +
        `Motivo?\n` +
        `📝 ${absen.keterangan}\n` +
        `👥 Total presentes: ${totalPeserta}\n\n` +
        `La sesión de asistencia fue eliminada.`
    )
}

export { pluginConfig as config, handler }